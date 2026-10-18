# EcoSnap

Image-first campus waste reporting. A report is only submitted after Cloudinary returns an actual `secure_url` and `public_id`.

## Run locally

1. Copy `.env.example` to `.env.local` and add Cloudinary values from the Media Library dashboard.
2. `npm install && npm run dev`
3. Visit `/report`, upload a real image, complete the form, and submit.

The browser-demo persistence fallback is explicitly local-only; it exists only when Supabase environment variables are not configured. For persistent data, apply `supabase/migrations/001_create_reports.sql` then add the project URL and anon key.

## Cloudinary security

`app/api/cloudinary/sign/route.ts` generates a SHA-1 signature server-side. `CLOUDINARY_API_SECRET` is never returned to the browser. The browser posts directly to Cloudinary and the returned `secure_url`/`public_id` become mandatory report fields.
