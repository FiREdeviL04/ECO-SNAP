# QA report — 30 October 2026

| Check | Result | Evidence |
| --- | --- | --- |
| Strict TypeScript | Pass | `npm run typecheck` |
| ESLint | Pass with warnings | `npm run lint`; image optimization and stale browser mapping warnings remain |
| Focused tests | Pass | `npm test` |
| Production build | Pass | `npm run build` |
| Report page route | Pass | emitted as static `/report` route |
| Cloudinary missing-config state | Pass | local POST to `/api/cloudinary/sign` returned safe HTTP 503 JSON error |
| Real Cloudinary upload | Blocked | no Cloudinary credentials were available |
| Supabase persistence and RLS verification | Blocked | no Supabase project URL/key was available |
| GitHub push | Not attempted | repository remote is available, but no commit/push was requested |
| Live deployment | Blocked | no hosting account or production environment values were available |

No live integration has been represented as tested. When environment variables are provided, perform the documented demo path and record the actual result here.
