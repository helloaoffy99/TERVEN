-- TERVÉN Phase 4. Apply in the existing project's SQL editor or Supabase CLI.
-- Safe to re-run; no sample properties are inserted.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  property_code text not null unique check (length(property_code) between 3 and 40),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (length(title) between 5 and 200),
  description text not null default '',
  property_type text not null check (property_type in ('บ้านเดี่ยว','บ้านแฝด','ทาวน์เฮาส์ / ทาวน์โฮม','คอนโดมิเนียม','ที่ดิน','อาคารพาณิชย์','อสังหาริมทรัพย์อื่น ๆ')),
  price numeric(15,2) not null check (price >= 0),
  province text not null check (length(province) between 1 and 100),
  district text not null check (length(district) between 1 and 100),
  subdistrict text,
  land_area_sqm numeric(12,2) check (land_area_sqm >= 0),
  usable_area_sqm numeric(12,2) check (usable_area_sqm >= 0),
  bedrooms smallint check (bedrooms >= 0),
  bathrooms smallint check (bathrooms >= 0),
  parking smallint check (parking >= 0),
  latitude numeric(9,6) check (latitude between -90 and 90),
  longitude numeric(9,6) check (longitude between -180 and 180),
  status text not null default 'draft' check (status in ('draft','available','reserved','sold')),
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((latitude is null) = (longitude is null)),
  check (published_at is null or status <> 'draft')
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null unique check (length(storage_path) between 1 and 500),
  alt_text text not null default '',
  sort_order integer not null default 0 check (sort_order >= 0),
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists property_images_one_cover on public.property_images(property_id) where is_cover;
create index if not exists property_images_order on public.property_images(property_id, sort_order);

create or replace function public.swap_property_images(p_first uuid, p_second uuid)
returns boolean language plpgsql security invoker set search_path = public as $$
declare first_row public.property_images%rowtype; second_row public.property_images%rowtype;
begin
  select * into first_row from public.property_images where id = p_first;
  select * into second_row from public.property_images where id = p_second;
  if first_row.id is null or second_row.id is null or first_row.property_id <> second_row.property_id then return false; end if;
  update public.property_images set sort_order = case when id = p_first then second_row.sort_order else first_row.sort_order end
  where id in (p_first,p_second);
  return true;
end $$;
revoke all on function public.swap_property_images(uuid,uuid) from public, anon;
grant execute on function public.swap_property_images(uuid,uuid) to authenticated;

create table if not exists public.property_submissions (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null check (length(contact_name) between 2 and 120),
  phone text not null check (length(phone) between 9 and 20),
  line_id text,
  property_type text not null check (property_type in ('บ้านเดี่ยว','บ้านแฝด','ทาวน์เฮาส์ / ทาวน์โฮม','คอนโดมิเนียม','ที่ดิน','อาคารพาณิชย์','อสังหาริมทรัพย์อื่น ๆ')),
  province text not null check (length(province) between 1 and 100),
  district text not null check (length(district) between 1 and 100),
  subdistrict text,
  land_area_sqm numeric(12,2) not null check (land_area_sqm > 0),
  asking_price numeric(15,2) not null check (asking_price > 0),
  description text,
  consent_at timestamptz not null,
  status text not null default 'new' check (status in ('new','contacted','reviewing','converted','closed')),
  dedupe_key text unique,
  created_at timestamptz not null default now()
);
create index if not exists property_submissions_recent on public.property_submissions(created_at desc);

create table if not exists public.property_inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  contact_name text not null,
  phone text not null,
  message text not null,
  consent_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists property_inquiries_property on public.property_inquiries(property_id, created_at desc);

create table if not exists public.submission_rate_limits (
  identifier_hash text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0
);

create or replace function public.claim_submission_slot(p_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
declare current_count integer;
begin
  if length(p_hash) <> 64 then return false; end if;
  insert into public.submission_rate_limits(identifier_hash,window_started_at,request_count)
  values(p_hash,now(),1)
  on conflict(identifier_hash) do update set
    window_started_at = case when public.submission_rate_limits.window_started_at < now() - interval '1 hour' then now() else public.submission_rate_limits.window_started_at end,
    request_count = case when public.submission_rate_limits.window_started_at < now() - interval '1 hour' then 1 else public.submission_rate_limits.request_count + 1 end
  returning request_count into current_count;
  return current_count <= 5;
end $$;
revoke all on function public.claim_submission_slot(text) from public, anon, authenticated;
grant execute on function public.claim_submission_slot(text) to service_role;

create or replace function public.touch_property_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists properties_updated_at on public.properties;
create trigger properties_updated_at before update on public.properties
for each row execute function public.touch_property_updated_at();

-- Security-definer functions avoid recursive RLS on admin_users.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role in ('owner','editor'))
$$;
create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'owner')
$$;
revoke all on function public.is_admin() from public;
revoke all on function public.is_owner() from public;
grant execute on function public.is_admin(), public.is_owner() to authenticated;

-- Lock the lead and create the draft in one database transaction.
create or replace function public.convert_submission_to_draft(p_submission_id uuid)
returns uuid language plpgsql security invoker set search_path = public as $$
declare lead public.property_submissions%rowtype; new_id uuid; suffix text;
begin
  if not public.is_admin() then return null; end if;
  select * into lead from public.property_submissions where id = p_submission_id for update;
  if lead.id is null or lead.status = 'converted' then return null; end if;
  suffix := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
  insert into public.properties(property_code,slug,title,description,property_type,price,province,district,subdistrict,land_area_sqm,status,published_at)
  values('TV-' || upper(suffix),'submission-' || suffix,left(lead.property_type || ' ' || lead.district || ' ' || lead.province, 200),
    coalesce(lead.description,''),lead.property_type,lead.asking_price,lead.province,lead.district,lead.subdistrict,
    lead.land_area_sqm,'draft',null)
  returning id into new_id;
  update public.property_submissions set status = 'converted' where id = p_submission_id;
  return new_id;
end $$;
revoke all on function public.convert_submission_to_draft(uuid) from public, anon;
grant execute on function public.convert_submission_to_draft(uuid) to authenticated;

alter table public.admin_users enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_submissions enable row level security;
alter table public.property_inquiries enable row level security;
alter table public.submission_rate_limits enable row level security;

drop policy if exists admin_read_self on public.admin_users;
create policy admin_read_self on public.admin_users for select to authenticated using (user_id = (select auth.uid()));
-- No client insert/update/delete policy for admin_users. Bootstrap in SQL editor only.

drop policy if exists public_read_published_properties on public.properties;
create policy public_read_published_properties on public.properties for select to anon, authenticated
using (published_at is not null and published_at <= now() and status <> 'draft');
drop policy if exists admin_read_properties on public.properties;
create policy admin_read_properties on public.properties for select to authenticated using ((select public.is_admin()));
drop policy if exists admin_insert_properties on public.properties;
create policy admin_insert_properties on public.properties for insert to authenticated with check ((select public.is_admin()));
drop policy if exists admin_update_properties on public.properties;
create policy admin_update_properties on public.properties for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists admin_delete_properties on public.properties;
create policy admin_delete_properties on public.properties for delete to authenticated using ((select public.is_owner()));

drop policy if exists public_read_published_images on public.property_images;
create policy public_read_published_images on public.property_images for select to anon, authenticated
using (exists(select 1 from public.properties p where p.id = property_id and p.published_at is not null and p.published_at <= now() and p.status <> 'draft'));
drop policy if exists admin_manage_images on public.property_images;
create policy admin_manage_images on public.property_images for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists admin_manage_submissions on public.property_submissions;
create policy admin_manage_submissions on public.property_submissions for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists admin_read_inquiries on public.property_inquiries;
create policy admin_read_inquiries on public.property_inquiries for select to authenticated using ((select public.is_admin()));
drop policy if exists admin_manage_inquiries on public.property_inquiries;
create policy admin_manage_inquiries on public.property_inquiries for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
-- Public submission endpoint uses a server-only key after validation and rate limiting.
-- Anonymous/authenticated clients receive no write or read policy for private leads.

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('property-images','property-images',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists admin_insert_property_storage on storage.objects;
create policy admin_insert_property_storage on storage.objects for insert to authenticated
with check (bucket_id = 'property-images' and (select public.is_admin()));
drop policy if exists admin_update_property_storage on storage.objects;
create policy admin_update_property_storage on storage.objects for update to authenticated
using (bucket_id = 'property-images' and (select public.is_admin()))
with check (bucket_id = 'property-images' and (select public.is_admin()));
drop policy if exists admin_delete_property_storage on storage.objects;
create policy admin_delete_property_storage on storage.objects for delete to authenticated
using (bucket_id = 'property-images' and (select public.is_admin()));
drop policy if exists admin_read_property_storage on storage.objects;
create policy admin_read_property_storage on storage.objects for select to authenticated
using (bucket_id = 'property-images' and (select public.is_admin()));

create index if not exists properties_public_search on public.properties(published_at desc, status, province, property_type, price);
create index if not exists properties_admin_updated on public.properties(updated_at desc);

-- SQL Editor-created tables may not inherit API grants. RLS remains the final access check.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.properties, public.property_images to anon;
grant select, insert, update, delete on public.properties, public.property_images to authenticated;
grant select on public.admin_users to authenticated;
grant select, update on public.property_submissions, public.property_inquiries to authenticated;
grant select, insert, update on public.property_submissions, public.submission_rate_limits to service_role;
