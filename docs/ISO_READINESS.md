# EcoSnap ISO 27001-Style Readiness Record

This is an engineering evidence record, not an ISO certification. Certification requires an approved scope, risk assessment, control review, management system, internal audit, and independent auditor.

## Scope

The scoped system is the EcoSnap responsive web application, its Next.js API routes, Cloudinary image workflow, Supabase database, deployment environment, source repository, and CI pipeline.

## Implemented control evidence

| Control area | Evidence |
| --- | --- |
| Secret protection | Cloudinary API secret is server-only; only client-safe configuration is documented in `.env.example`. |
| Input validation | Canonical Zod schema trims and bounds fields and restricts enums. |
| Error handling | Stable error codes avoid raw provider errors and distinguish configuration, malformed input, rate limiting, and upstream failures. |
| Data access | Supabase RLS remains enabled; public update/delete grants are revoked in the migration. |
| Integrity | Cloudinary URL/cloud/folder provenance is checked before report persistence. |
| Availability | API failure states, retries, bounded pagination, and rate limits are implemented. |
| Secure transport | Submitted image URLs must use HTTPS; security response headers are configured. |
| Change control | GitHub Actions runs lint, typecheck, tests, and production build on pushes and pull requests. |
| Evidence | Baseline, QA, traceability, implementation status, and this readiness record are maintained in `docs/`. |

## Open risks and required evidence

- Replace in-memory rate limiting with a distributed control suitable for the deployment provider.
- Run live Cloudinary verification with test credentials and record the result.
- Apply the Supabase migration in a test project and record anonymous update/delete denial.
- Configure Vercel environment variables and record a deployment smoke test.
- Establish retention, deletion, incident response, access review, backup, and recovery procedures with the system owner.
- Obtain the authoritative FR-01–FR-13 specification and map each control to its acceptance test.

No certification claim should be made until these items are independently reviewed.
