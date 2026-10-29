# EcoSnap

Image-first campus waste reporting. A report is only submitted after Cloudinary returns an actual `secure_url` and `public_id`.

## Run locally

1. Copy `.env.example` to `.env.local` and add Cloudinary values from the Media Library dashboard.
2. `npm install && npm run dev`
3. Visit `/report`, upload a real image, complete the form, and submit.

The browser-demo mode is explicit: set `NEXT_PUBLIC_DEMO_MODE=true` for a local-only environment. Without Supabase configuration and that flag, the API reports a configuration error rather than silently falling back. For persistent data, apply `supabase/migrations/001_create_reports.sql` then add the project URL and anon key.

## What works

- Signed Cloudinary image uploads with client-side format and size validation.
- Submission is impossible until Cloudinary has returned an actual secure URL and public ID.
- Reports are written to and read from Supabase REST when configured.
- Reports list and detail views display Cloudinary-hosted evidence.
- Safe local-only demo persistence when Supabase is not configured.

## Verification

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. The current release passes typecheck, tests, and production build; lint passes with existing non-blocking image/config warnings. The deployed production URL is `https://ecosnap-hacktober-hackdays.vercel.app`. Its runtime reports persistent mode and its reports API is Supabase-backed.

The reports screen provides server-backed search across title, description, and location, category/status/priority filters, clear recovery, result totals, and bounded pagination. Admin status changes, resolution evidence, maps, and AI labels are intentionally deferred rather than simulated.

## Authentication and RBAC rollout

The repository includes a Supabase Auth and trusted-role foundation plus migration `supabase/migrations/002_rbac_workflow.sql`. Apply that migration and set `ECOSNAP_RBAC_ENABLED=true` only after creating the initial administrator through a controlled database operation. The default is `false` to preserve the currently verified report flow until the live schema and test identities are verified. See [docs/RBAC_STATUS.md](./docs/RBAC_STATUS.md) for the activation and verification gates.

The current role-aware surfaces are `/login`, `/dashboard`, `/team-member`, `/team`, and `/admin`. See [the route/permission matrix](./docs/ROUTE_PERMISSION_MATRIX.md). They call role-checked APIs, but resolution upload UI, full report administration, and live authorization verification remain pending the migration activation gate.

The current delivered platform is an installable mobile-first PWA, not a native Android/iOS application. On a phone browser, use “Add to Home Screen”. Demo mode supports local image data and browser-only reports; persistent mode uses real Cloudinary and Supabase.

## Cloudinary security

`app/api/cloudinary/sign/route.ts` generates a SHA-1 signature server-side. `CLOUDINARY_API_SECRET` is never returned to the browser. The browser posts directly to Cloudinary and the returned `secure_url`/`public_id` become mandatory report fields.
