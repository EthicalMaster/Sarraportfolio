# Visitor insights

Open /admin and choose Visitor insights. Reports offer 7 or 30 calendar days in Asia/Kolkata, including the current partial day. Data comes from this portfolio's own counters, not Vercel Analytics. No historical visits are imported.

## Install and deploy

The database schema and key hash are already configured on the existing Supabase project. Do not rerun SQL or change the generated key without rotating its database hash as well.

The download includes analytics.env. Keep it outside the Git repository. In Vercel project settings, add a Production Secret named STUDIO_ANALYTICS_KEY with the exact value after '=' in that file. Keep all existing variables unchanged. Then deploy the supplied bundle. Vercel management access returned 403 in this session, so this one setting must be added by the project owner. No Vercel analytics subscription or API token is required. Normal hosting and database usage still applies.

The collector requires VERCEL_ENV=production, a configured key and same-origin requests. Local development and preview deployments never contribute counts. Never set VERCEL_ENV=production locally merely to test the UI: it would write to live analytics.

## What the numbers mean

- Estimated visits: distinct random browsing sessions with at least one page view. A session is stored in sessionStorage per tab and renews after 30 minutes without an event. Tab duplication, storage blocking, devices and repeat visits can affect this estimate. It is not an exact count of unique people.
- Page views: one event per visible public page load. Refreshes count again. Query strings, anchors, admin pages and unknown route shapes are excluded.
- Interest clicks: email links, LinkedIn, Instagram and portfolio booklet links; each action counts at most once per page load. Email clicks do not prove that messages were sent. Copy-email button clicks are not currently counted.
- Sources: broad categories from the first page's referrer, retained for the session. No full referrer URL is sent. Unknown, app-hidden and internal entry sources appear as direct/unknown.
- Devices: approximate mobile/tablet/desktop groups. No raw user-agent string is stored in the analytics table.

No names, raw IPs, full referrers, enquiry text or URL query parameters are stored by these counters. The site host may independently maintain ordinary request logs. Do Not Track and Global Privacy Control preferences suppress collection. Blockers, bots and outages can affect accuracy.

Opening the dashboard sets sarra-analytics-exclude=1 in that browser's localStorage. Public browsing in that browser is then excluded, even after sign-out. Requests containing Supabase login cookies are also excluded. Use a private window or another browser to test public visits; tracking preferences and blockers may still suppress them. Test visits will be real recorded visits.

Events older than 90 days are deleted on the next accepted ingestion request. Reports show only the last 7 or 30 days. Ingestion is capped at 300 events per session hash per rolling day and 10,000 events total per UTC day to bound storage growth. This is lightweight portfolio analytics, not a fraud-proof or billing-grade measurement system. Published-page counts may differ from Vercel's.

## Security and validation

Public clients have no direct read or write access to analytics rows. The Hono collector passes a server-only capability key to a narrow database function; only its SHA-256 hash is stored in an inaccessible configuration table. The ingestion function accepts only bounded, whitelisted fields and owns its timestamp. The report function runs under the signed-in editor's permissions and RLS.

Supabase's advisor flags the deliberately anonymous-callable SECURITY DEFINER ingestion function. This is intentional: it validates the separate server-only key before performing its restricted insert, with a fixed empty search path. It does not return stored analytics or keys. Relevant advisor reference: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable . Wrong-key denial and anonymous/non-editor read denial were tested. Existing leaked-password protection warning remains separate: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .

Production build and ten regression test files passed. A rolled-back database transaction verified key validation, excluded paths, deduplication, visit/page/click totals, a seven-day chart, and access restrictions. No owner password was requested. The deployed browser workflow still needs its post-deployment smoke check.

## Smoke check

After deployment, open Visitor insights and confirm no setup/error warning. From a different/private browser, visit the homepage and one project, then click the booklet or a social link. Return to the dashboard and click Refresh. Confirm the expected page/click increase. The dashboard itself must not increase page views. Start with an empty report rather than inventing sample numbers.
