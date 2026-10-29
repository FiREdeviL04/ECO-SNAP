# EcoSnap FR-01–FR-13 Traceability

**Specification:** `EcoSnap_Root_Cause_Engineering_Spec_v2.0`  
**Audit date:** 30 October 2026  
**Implementation baseline:** `13ec04941a66cce94625e30c9e773f2227dc6ba6`

| ID | Requirement and owner | Acceptance evidence | Status |
| --- | --- | --- | --- |
| FR-01 | Landing page; `app/page.tsx`, `app/layout.tsx` | Hero and CTAs exist; counters use API metrics or an unavailable marker; responsive navigation remains reachable at narrow widths. Screenshot/device verification remains pending. | IMPLEMENTED LOCALLY; DEVICE CHECK BLOCKED |
| FR-02 | Create report validation; `lib/report.ts`, `app/api/reports/route.ts`, `components/report-form.tsx` | Trimmed canonical Zod schema, enum/length rules, controlled malformed JSON, server-owned ID/status/time, structured errors, HTTPS asset checks. Automated smoke and build checks pass. | IMPLEMENTED LOCALLY |
| FR-03 | Signed Cloudinary upload; `app/api/cloudinary/sign/route.ts`, `lib/report.ts` | Fixed folder signature, client type/size checks, verified provider response, server provenance check, rate limit. Real upload and provider metadata test require credentials. | IMPLEMENTED LOCALLY; LIVE TEST BLOCKED |
| FR-04 | Supabase persistence; `supabase/migrations/001_create_reports.sql`, `app/api/reports/route.ts` | Explicit configuration mode, safe REST failures, constraints, index, timestamp trigger, anonymous update/delete revoke. Migration/RLS/live persistence test require a project. | IMPLEMENTED LOCALLY; LIVE TEST BLOCKED |
| FR-05 | Browse reports; `app/reports/page.tsx` | Separate loading, empty, request-error and retry states; no local fallback after API failure. Local build/type checks pass. | IMPLEMENTED LOCALLY |
| FR-06 | Detail/404; `app/reports/[id]/page.tsx` | Separate loading, error and confirmed not-found; safe reference/date; raw provider ID removed from prominent UI. | IMPLEMENTED LOCALLY |
| FR-07 | Honest demo fallback; `lib/runtime.ts`, `components/runtime-banner.tsx`, `app/api/runtime/route.ts` | Persistent, explicit demo, and misconfigured modes; persistent banner/error indicator across routes; no silent fallback. | IMPLEMENTED LOCALLY |
| FR-08 | Real metrics; `app/api/reports/route.ts`, `app/page.tsx` | Counts are queried from persisted records and show unavailable state when storage is not configured. Fixture/live transition verification requires Supabase. | IMPLEMENTED LOCALLY; LIVE TEST BLOCKED |
| FR-09 | Search/filter/pagination; `app/api/reports/route.ts` | Server-capped search, category/status/severity filters, deterministic range pagination and total response. UI controls and boundary tests remain to be added. | PARTIAL / P1 DEFERRED |
| FR-10 | Admin status updates | No auth/admin implementation exists. | DEFERRED P2 — requires Supabase Auth, trusted admin role, and status history design |
| FR-11 | Before/after evidence | Only original evidence and resolution note exist. | DEFERRED P2 — requires status lifecycle and separate resolution asset contract |
| FR-12 | AI-assisted labels | No AI service is configured. | DEFERRED P2 — optional and must not fabricate suggestions |
| FR-13 | Map and duplicate grouping | No geolocation or grouping contract exists. | DEFERRED P2 — requires privacy, consent, stable location data, and representative tests |

Live Cloudinary, Supabase, deployed, and device checks are explicitly blocked until authorized environment configuration is available.
