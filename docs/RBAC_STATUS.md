# RBAC implementation status

## Implemented foundation

- Supabase Auth registration and password login through `/api/auth`.
- HTTP-only, secure production session cookies for access and refresh tokens.
- Server-side session validation against Supabase Auth.
- Trusted application role lookup from `public.profiles`; client-supplied roles are ignored.
- Versioned migration `supabase/migrations/002_rbac_workflow.sql` containing profiles, application status, assignment fields, resolution evidence fields, status history, audit log, constraints, indexes, and RLS policies.
- Explicit rollout flag `ECOSNAP_RBAC_ENABLED`. It defaults to `false` so an unapplied migration cannot break the existing report flow.

## Activation runbook

1. Apply `002_rbac_workflow.sql` in the Supabase SQL editor after `001_create_reports.sql`.
2. Create the initial administrator through a controlled SQL procedure or trusted database operation; never through public registration.
3. Verify Supabase Auth email/password settings and create test identities for normal user, team member, and administrator.
4. Set `ECOSNAP_RBAC_ENABLED=true` in the Vercel Production environment.
5. Redeploy and run authenticated API/RLS tests with those identities.

## Not yet claimed

The migration and authentication foundation are not evidence of a complete RBAC product. Team-member applications, protected claim/resolve mutations, resolution upload UI, admin dashboard, approval actions, audit views, and live RLS tests require the migration, trusted admin bootstrap, and test identities. They remain deferred until those gates are exercised.
