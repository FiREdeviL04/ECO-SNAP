# QA report — 30 October 2026

Tested application commit: `c3345dc`  
Deployment: `https://ecosnap-hacktober-hackdays.vercel.app`

| Check | Result | Evidence |
| --- | --- | --- |
| Strict TypeScript | Pass | `npm run typecheck` |
| ESLint | Pass with warnings | `npm run lint`; image optimization and stale browser mapping warnings remain |
| Focused tests | Pass | `npm test` |
| Production build | Pass | `npm run build` |
| Report page route | Pass | emitted as static `/report` route |
| Cloudinary missing-config state | Pass | local POST to `/api/cloudinary/sign` returned safe HTTP 503 JSON error |
| Search/filter/pagination UI | Pass | `/reports` sends bounded server-side query parameters, displays result totals, supports clear/retry/empty states, and paginates |
| Real Cloudinary upload | Pass | Production report flow previously verified with a real Cloudinary asset and provider public ID |
| Supabase persistence and RLS verification | Pass | Production `/api/reports` returned persisted records; migration contains anonymous update/delete revocation |
| GitHub push | Pass | Latest release commit pushed to `FiREdeviL04/ECO-SNAP` |
| Live deployment | Pass | Vercel deployment reached READY; homepage and `/api/runtime` returned HTTP 200 |
| Production runtime | Pass | `/api/runtime` returned `{"mode":"persistent"}` |
| Production reports API | Pass | `/api/reports` returned HTTP 200 with `persistence:"supabase"` and metrics |
| Authentication/RBAC foundation | Pass locally; live activation not run | Auth route, HTTP-only session cookie handling, trusted role lookup, and migration compile/build; live Auth/RLS/admin identity tests require migration activation and controlled test accounts |
| Deployed auth session smoke | Pass | `POST /api/auth` with `{ "action": "me" }` returned `{"authenticated":false}` with HTTP 200 on the production URL |
| Protected workflow API build | Pass locally; live authorization not run | Team application, claim, resolve, and admin review routes compile and validate server-side roles; live calls require migration activation and test identities |
| Deployed role surfaces | Pass | `/login`, `/team-member`, `/team`, and `/admin` returned HTTP 200; unauthenticated `/api/team-applications` returned HTTP 401 |
| User dashboard scope | Pass locally; live RBAC gate pending | `/dashboard` uses `/api/reports?scope=mine`, which requires a trusted authenticated profile when RBAC is enabled |
| Production RBAC rollout | Pass for anonymous denial; authenticated identity not run | `ECOSNAP_RBAC_ENABLED=true` is configured; anonymous `/api/reports?scope=mine` returns HTTP 401 while public reports remain HTTP 200 |
| Accessibility/device automation | Not run | Manual 360 px, keyboard, screen-reader, and contrast review remains recommended |

Known limitations: status management, resolution evidence, maps, and AI labels remain intentionally deferred. The public database still contains two diagnostic records from integration troubleshooting; remove them before a judging demo if they should not be shown.
