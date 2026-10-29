# EcoSnap Phase 0 Baseline Audit

**Audit date:** 30 October 2026  
**Repository:** `JS-code7/ecosnap-hacktober-hackdays`  
**Baseline branch:** `main`  
**Baseline commit:** `13ec04941a66cce94625e30c9e773f2227dc6ba6`  
**Working tree at audit start:** clean

## Scope and evidence

The supplied mission was available as pasted text. The referenced EcoSnap product specification PDF/DOCX and organizer logistics confirmation were not available in the workspace or supplied artifacts, so requirement details that depend on those sources remain blocked. The repository was cloned read-only from the supplied public URL because the configured workspace was empty and was not initially a Git repository.

No application source, dependency manifest, migration, or configuration was changed during the baseline inspection. This report and its traceability table are the only Phase 0 additions.

## Repository and architecture

- Framework: Next.js 16 App Router with React 19 and TypeScript.
- Delivered platform at baseline: responsive web application; no Expo, React Native, Android, or iOS project is present.
- Routes: `/`, `/report`, `/reports`, `/reports/[id]`, `/about`, `/api/reports`, and `/api/cloudinary/sign`.
- Persistence: Supabase REST when the public URL and anon key are configured; browser local storage fallback otherwise.
- Image flow: browser requests a server-generated Cloudinary signature, uploads directly to Cloudinary, then submits the returned URL and public ID.
- Shared validation: `lib/report.ts` is used by the report form and report API.
- Database: one Supabase migration creates `reports`, status/severity enums, basic checks, RLS, public select, and public insert policies.
- Navigation: desktop-oriented header links with non-button links hidden below 700px; no mobile menu is present.
- Tests and CI: no test script, test files, GitHub Actions workflow, or deployment configuration is present.

The least disruptive architecture for the current repository is to repair and extend the existing mobile-responsive Next.js application. A separate native client is not justified by the available requirements because the supplied mission allows responsive web delivery unless native is explicitly required, and no native project exists.

## Baseline commands

Commands were run from the cloned repository on Windows with Node `v25.8.2` and npm `11.11.1`.

| Command | Result | Evidence / blocker |
| --- | --- | --- |
| `npm ci` | PASS with warnings | Installed 346 packages; npm reported 6 vulnerabilities (2 low, 3 high, 1 critical). |
| `npm run lint` | BLOCKED | ESLint 9.16.0 could not find `eslint.config.js`, `.mjs`, or `.cjs`. |
| `npm run typecheck` | PASS | `tsc --noEmit` exited 0. |
| `npm run build` | PASS | Next.js production build exited 0 and emitted all listed routes. |
| `npm test` | NOT AVAILABLE | No `test` script exists in `package.json`. |
| Live Cloudinary test | BLOCKED | No Cloudinary credentials were available. |
| Live Supabase test | BLOCKED | No Supabase project URL/key were available. |
| Deployed smoke test | BLOCKED | No deployment URL or hosting credentials were available. |

The build emitted a stale `baseline-browser-mapping` warning. The dependency audit also reports that the checked-in Next.js version has a known security vulnerability and should be upgraded during remediation rather than suppressed.

## Baseline root-cause findings

These are baseline findings, not fixes:

1. The API accepts `await req.json()` without controlled malformed-JSON handling and returns a single unstructured error string.
2. The server validates report fields but does not verify that the submitted image URL and public ID belong to the configured Cloudinary account and folder.
3. Cloudinary signing parameters are derived from environment configuration but do not include an explicit server-side provenance verification step after upload.
4. The report GET route returns an empty demo response for missing persistence configuration, while the client also falls back to local storage on any fetch failure. This can hide network or server failures as an empty/success-shaped state.
5. Report detail and list screens do not distinguish loading, confirmed 404, configuration, and request-error states.
6. Client-side report submission and upload share one busy flag but have no explicit abort, retry, or duplicate-request policy.
7. The Supabase migration has no category constraint, no `updated_at` maintenance, and leaves the future authorization policy as a comment.
8. There is no distributed rate limiting or documented origin/abuse control for signing and report creation.
9. The UI has no persistent demo-mode indicator, no mobile navigation replacement at narrow widths, and no live metrics implementation.
10. The repository has no automated test suite, CI workflow, accessibility checks, or live integration harness.

## External blockers and unresolved discrepancy

- The referenced product specification PDF/DOCX was not supplied, so the exact FR-01 through FR-13 definitions cannot be verified.
- The mission reports a logistics discrepancy between an in-person selection email at PW Institute of Innovation, Noida, on 31 October 2026 and a separate online-event description. Written organizer or official-dashboard confirmation is required; no assumption was made.
- Cloudinary and Supabase credentials, a deployed environment, and representative device/emulator access were not available for Phase 0.

## Go/no-go status

**Gate A: PARTIAL / BLOCKED.** The repository baseline and architecture audit are complete, but the requirement traceability source and live-service prerequisites are unavailable. Do not claim product completion or begin P1/P2 work until the missing specification is obtained and the P0 design decisions are documented.

