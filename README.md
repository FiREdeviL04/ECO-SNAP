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

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Local checks pass in the current remediation baseline. Real Cloudinary, Supabase, and deployed smoke tests remain blocked until credentials and a deployment are supplied.

The current delivered platform is an installable mobile-first PWA, not a native Android/iOS application. On a phone browser, use “Add to Home Screen”. Demo mode supports local image data and browser-only reports; persistent mode uses real Cloudinary and Supabase.

## Cloudinary security

`app/api/cloudinary/sign/route.ts` generates a SHA-1 signature server-side. `CLOUDINARY_API_SECRET` is never returned to the browser. The browser posts directly to Cloudinary and the returned `secure_url`/`public_id` become mandatory report fields.
