> Historical setup notes: cloud storage, publishing and homepage controls are now implemented. Follow studio-cloud-guide.md for the current workflow and deployment instructions. Recovery/MFA interface work remains separate.

# Private studio authentication — provisioning pending

The `/admin` and `/admin/starter-projects` routes no longer have a development
bypass. `/admin/login` provides the sign-in form. Without the configuration below,
login stays disabled and the editor cannot be reached.

Server environment variables (never commit populated values):

- `SUPABASE_URL`: selected project's HTTPS Supabase URL.
- `SUPABASE_PUBLISHABLE_KEY`: its modern `sb_publishable_...` key.
- `STUDIO_ALLOWED_USER_IDS`: comma-separated Supabase Auth UUIDs explicitly
  authorised for this portfolio. Empty configuration denies access.

Use the hosting environment-variable interface for deployed values. For local
Hono/Vite development, copy the supplied studio.env to .env.local. The Vite
configuration explicitly loads these three server-only values. .env.local is ignored
by Git. Deployment still needs these settings in the hosting environment.

## Account setup

1. Confirm organisation, project cost, and region before provisioning.
2. Disable public user registration and anonymous sign-in in Supabase Auth.
3. Configure the exact production/local redirect URLs and authentication email
   delivery. Create the authorised account through the provider's secure flow.
   Never put a real password in source control, documentation, or chat.
4. Record the created Auth UUID in the server allowlist. Email addresses and
   user-editable metadata are not used for authorisation.
5. Set a suitable auth rate limit and CAPTCHA/bot protection before public release.
6. Complete account recovery and MFA configuration, with corresponding application
   flows, before handing the editor over for ongoing use.
7. Test real sign-in, refresh, sign-out, denied accounts and provider failures on
   the configured project. These cannot be verified with a live account until the
   project and account exist.

## Implemented guards

- Supabase SSR session cookies, HttpOnly, SameSite=Lax, Secure under HTTPS.
- Verified `getUser()` calls and explicit Auth UUID allowlist on protected routes.
- Confirmed-email check; anonymous accounts denied.
- Same-origin POST checks, bounded request bodies, no-store responses,
  no framing, and generic sign-in failure messages.
- Sign-out uses local session scope. Other device sessions are not signed out.
- No service-role or secret key is used by the application.

## Not completed yet

Project storage remains browser-local; existing drafts remain in their IndexedDB.
Database tables, storage buckets, RLS policies, cloud upload, account recovery UI,
MFA UI, publishing and private preview links are not provisioned in this change.
Do not call the project-management backend complete or ask the owner to enter real
project content without retaining backups. Account recovery and rate-limit settings
must be verified as part of provisioning rather than guessed.

## Provisioning checkpoint

Project `wmsvczaxzfmpbtpizeuh` now contains the initial protected studio tables
and private `studio-drafts` bucket. Approved-editor membership is empty until
Sarra's confirmed Auth account exists. RLS is enabled on all three studio tables;
anonymous clients cannot read draft rows and authenticated clients cannot insert
their own editor membership. See studio-schema.sql for the applied SQL.
Cloud data/upload routes and UI synchronisation are still pending; creating these
tables has not moved any browser drafts or enabled publishing.

Sarra’s confirmed account is now recorded in studio_editors. Access requires both
the server UUID allowlist and a current database membership. No actual password
has been collected or used by the assistant. Real sign-in remains user-tested.
