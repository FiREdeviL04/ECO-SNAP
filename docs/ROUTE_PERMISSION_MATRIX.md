# EcoSnap route and permission matrix

| Surface | Anonymous | Normal user | Team member | Admin | Enforcement |
| --- | --- | --- | --- | --- | --- |
| `/reports` | Public list | Public list | Public list | Public list | Public read policy and API |
| `/report` | Form visible; submit depends on rollout mode | Create report | Create report | Create report | API validation; authenticated creation when `ECOSNAP_RBAC_ENABLED=true` |
| `/dashboard` | Login required | Own reports and metrics | Own reports and metrics | Own reports and metrics | `/api/reports?scope=mine` |
| `/team-member` | Application denied | Submit/view own application | View current role | View current role | `/api/team-applications` |
| `/team` | Denied data | Denied data | Open/assigned workload and claim | Team workload and claim | `/api/reports?scope=team`, atomic `claim_report` |
| `/admin` | Denied data | Denied data | Denied data | Applications and review actions | `/api/team-applications`, admin RPC |
| `/api/team/resolve` | 401 | 403 | Assigned member only | Authorized admin | Database `resolve_report` function |

The page shells are intentionally lightweight and do not constitute authorization. API handlers and Supabase policies are the security boundary. Full live role/RLS verification remains pending migration activation and controlled test identities.
