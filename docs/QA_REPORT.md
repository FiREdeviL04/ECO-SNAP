# QA report — 30 October 2026

Tested application commit: `27dade6`  
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
| Accessibility/device automation | Not run | Manual 360 px, keyboard, screen-reader, and contrast review remains recommended |

Known limitations: status management, resolution evidence, maps, and AI labels remain intentionally deferred. The public database still contains two diagnostic records from integration troubleshooting; remove them before a judging demo if they should not be shown.
