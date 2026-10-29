# EcoSnap competition demo

## Live application

- URL: https://ecosnap-hacktober-hackdays.vercel.app
- Runtime check: `/api/runtime` should report `{"mode":"persistent"}`.
- Data check: `/api/reports` should report `persistence:"supabase"`.

## Recommended 60-second flow

1. Open the landing page and show the campus pulse metrics.
2. Select **Report an issue**.
3. Enter a realistic campus location and short description.
4. Upload a JPG, PNG, WebP, or GIF image under 8 MB.
5. Point out the **Uploaded to Cloudinary** confirmation.
6. Submit and show the report detail page.
7. Open **Browse reports** and demonstrate search, category/status/priority filters, clear recovery, and pagination.
8. Explain that the report is persisted in Supabase and that the status shown is the recorded workflow state, not a claim that the physical issue has already been resolved.

## Claims that are safe to make

- EcoSnap is an installable mobile-first PWA.
- Evidence uploads use a server-signed Cloudinary flow.
- Reports and metrics are persisted through Supabase in production.
- Discovery is server-backed and bounded.
- Demo mode is explicit and separate from persistent mode.

## Do not claim

- Native Android or iOS delivery.
- Admin status management or resolution evidence; these are not currently implemented.
- Map markers, AI labels, duplicate detection, or fabricated environmental impact metrics.
- Formal ISO certification.

Before presenting, remove any diagnostic records from the production `public.reports` table that should not appear in the public demo.
