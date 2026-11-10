# TERVÉN — Phase 4 preview

The existing Next.js App Router website now has Supabase data, admin authentication, property management, image uploads and seller submissions. **No mock listing is published or copied into Supabase.** Without configuration the public pages show an empty state, login explains setup, and seller intake stays disabled. The full application is deployed only as a Vercel Preview; Production serves a launch placeholder.

## GitHub and Vercel deployment

- The GitHub repository is `helloaoffy99/TERVEN` and is connected to the Vercel project `terven`.
- `main` contains the launch placeholder and automatically deploys to Production. Do not merge the full application into `main` until the public launch is approved.
- `review/terven-site` contains the full application and automatically deploys to a protected Vercel Preview. The Preview environment has the Supabase URL and publishable key, and `SUBMISSIONS_ENABLED=false`.
- `.env.local`, screenshots, staging files and the original oversized logo are excluded from Git. The optimized logo used by the site is in `public/images/terven-logo.png`.
- The full application remains `noindex` globally. Review business data, privacy terms and contact details before launching, then configure Production environment variables and change the robots policy deliberately.

## Local preview

```powershell
pnpm install
Copy-Item .env.example .env.local
# Fill .env.local with your own project's values (see below)
pnpm dev
```

Open `http://127.0.0.1:3000/`. For a production-build preview, stop the dev server, run `pnpm build`, then `pnpm start`. `.env.local` is ignored by Git. Restart the server after changing env values; rebuild when using `pnpm start` and changing `NEXT_PUBLIC_*` values.

## Supabase setup in the existing project

1. In the existing Supabase dashboard, obtain **Project URL** and **Publishable key** from Connect / API Keys. Put these in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. These values may be exposed to the browser. Do not use a database password or secret key as the publishable key.
2. In Supabase SQL Editor, review and run [`supabase/migrations/202611100001_phase4.sql`](supabase/migrations/202611100001_phase4.sql), then [`supabase/migrations/202611100002_phase4_api_grants.sql`](supabase/migrations/202611100002_phase4_api_grants.sql). Both are safe to rerun. The first creates five primary tables, the rate limit table, constraints, indexes, triggers, RLS policies, and storage bucket/policies. The second grants table privileges to API roles while RLS still controls row access. Neither inserts sample properties or admin accounts.
3. In Authentication settings, disable public email sign-ups. Set the Auth Site URL to the running website URL (`http://localhost:3000` works for this local preview), then invite the first user privately in Authentication → Users. The invitation link opens `/auth/accept` (or reaches the home page and is forwarded there), where the user sets a password. Confirm the email and collect the user's UUID. In SQL Editor, with trusted dashboard privileges, run:

   ```sql
   insert into public.admin_users (user_id, role)
   values ('PASTE_AUTH_USER_UUID_HERE'::uuid, 'owner')
   on conflict (user_id) do update set role = 'owner';
   ```

   Never put that SQL in the application, a public endpoint or a client component. Later editors can be granted in the same trusted SQL editor with role `editor`. App users cannot grant themselves admin rights.
4. For public seller submissions, add the project's **Secret key** to `SUPABASE_SECRET_KEY` **only in `.env.local`/server environment**. Generate a random 32+ character `SUBMISSION_RATE_LIMIT_SECRET`. Supply a verified `NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL`, review and complete the privacy policy, then set `SUBMISSIONS_ENABLED=true`. Keep this flag false until intake is approved. The secret key is used only by the validated submission server route; it never appears in client components.
5. Set `NEXT_PUBLIC_SITE_URL` to the canonical domain only when the site is actually hosted. For local preview leave `http://127.0.0.1:3000`.

## Data and security

- `/admin/login` uses Supabase password auth with cookie-based `@supabase/ssr`. No sign-up route exists. Every admin page and mutation checks `auth.getUser()` and `admin_users` on the server. RLS independently restricts database/storage access.
- `/admin` shows counts and recent data. `/admin/properties` provides search, status filter, add/edit, draft/publish, status, featured, delete confirmation and mobile forms. Only the `owner` role can delete a whole property; `editor` can create and edit. Images are uploaded through an admin-only server endpoint with MIME, size and signature checks, unique paths, progress, cover selection, order swap and deletion.
- `/admin/submissions` shows private leads, status changes and conversion to a **draft** property. A human must verify details and images before publishing.
- `/`, `/properties`, `/properties/[slug]` read published Supabase rows only. Reads use dynamic rendering to reflect changes; admin mutations also revalidate relevant paths. The Phase 3 fictional sample dataset remains in source solely for older tests/design reference and is never used by public routes.
- `/api/submissions` accepts validated, consented requests only after intake is enabled, applies a honeypot, same-origin check, database-backed hourly IP limit and one submission per phone/day. Anonymous clients have no direct RLS policy to read or write private leads. The `property_inquiries` table is prepared but no inquiry form is exposed yet.
- The property image bucket is public for displayed images; only admins can upload, change and remove objects. Draft image URLs are not shown publicly, but anyone with an exact public object URL could retrieve an image. Do not upload sensitive documents to this bucket.
- Money and area use PostgreSQL `numeric`. Land area is stored as square metres; admin form accepts rai, ngan and square wa.

## Verification

Run `pnpm exec tsc --noEmit`, `pnpm test`, and `pnpm build`. Without project credentials, database migrations, Auth, RLS, CRUD, Storage and real submission delivery **cannot** be verified against Supabase; validate those in the connected project before opening service. Suggested manual checks: anonymous cannot read `property_submissions` or change `properties`; non-admin cannot open `/admin` or call mutation routes; admin can draft, upload, publish, unpublish, update, delete, and see public changes; duplicate/rate-limited seller requests show errors.

The website remains `noindex` globally until business data, privacy terms, contact details and production readiness are reviewed. Do not deploy or enable intake merely to test visual layout.
