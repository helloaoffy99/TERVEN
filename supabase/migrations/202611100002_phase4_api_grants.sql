-- Apply after 202611100001_phase4.sql on projects that already ran the first version.
-- Safe to re-run. RLS policies from the first migration still control row access.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.properties, public.property_images to anon;
grant select, insert, update, delete on public.properties, public.property_images to authenticated;
grant select on public.admin_users to authenticated;
grant select, update on public.property_submissions, public.property_inquiries to authenticated;
grant select, insert, update on public.property_submissions, public.submission_rate_limits to service_role;
