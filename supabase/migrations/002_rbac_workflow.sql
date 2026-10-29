create type public.app_role as enum ('normal_user', 'team_member', 'admin');
create type public.application_status as enum ('Pending', 'Approved', 'Rejected', 'Withdrawn');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'normal_user',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.create_profile_for_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles(id) values (new.id) on conflict do nothing; return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile_for_user();

alter table public.reports add column if not exists reporter_id uuid references public.profiles(id);
alter table public.reports add column if not exists assigned_to uuid references public.profiles(id);
alter table public.reports add column if not exists resolution_note text check (resolution_note is null or char_length(btrim(resolution_note)) between 10 and 1000);
alter table public.reports add column if not exists resolution_image_url text check (resolution_image_url is null or resolution_image_url like 'https://res.cloudinary.com/%');
alter table public.reports add column if not exists resolution_cloudinary_public_id text;
alter table public.reports add column if not exists resolved_at timestamptz;
alter table public.reports add column if not exists resolved_by uuid references public.profiles(id);

create table public.team_member_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  statement text not null check (char_length(btrim(statement)) between 20 and 1000),
  status public.application_status not null default 'Pending',
  reviewed_by uuid references public.profiles(id),
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create unique index one_pending_team_application on public.team_member_applications(applicant_id) where status = 'Pending';

create table public.report_status_history (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  previous_status public.report_status,
  new_status public.report_status not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  action text not null check (char_length(btrim(action)) between 2 and 100),
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.team_member_applications enable row level security;
alter table public.report_status_history enable row level security;
alter table public.admin_audit_log enable row level security;

create or replace function public.current_app_role()
returns public.app_role language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() and active = true $$;

create policy "Users can read own profile" on public.profiles for select using (id = auth.uid() or public.current_app_role() = 'admin');
create policy "Users can read own applications" on public.team_member_applications for select using (applicant_id = auth.uid() or public.current_app_role() = 'admin');
create policy "Users can submit applications" on public.team_member_applications for insert with check (applicant_id = auth.uid() and public.current_app_role() = 'normal_user');
create policy "Admins manage applications" on public.team_member_applications for update using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy "Authorized users read status history" on public.report_status_history for select using (auth.uid() is not null);
create policy "Admins read audit log" on public.admin_audit_log for select using (public.current_app_role() = 'admin');

drop policy if exists "Public can create reports" on public.reports;
create policy "Authenticated users create reports" on public.reports for insert with check (auth.uid() is not null and reporter_id = auth.uid());
create policy "Admins manage reports" on public.reports for update using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create index reports_reporter_id_idx on public.reports(reporter_id);
create index reports_assigned_to_idx on public.reports(assigned_to);

create or replace function public.claim_report(target_report uuid)
returns public.reports language plpgsql security definer set search_path = public
as $$
declare claimed public.reports;
begin
  if public.current_app_role() not in ('team_member', 'admin') then raise exception 'FORBIDDEN'; end if;
  update public.reports set assigned_to = auth.uid(), status = 'In Progress'
    where id = target_report and status = 'Open' and assigned_to is null
    returning * into claimed;
  if claimed.id is null then raise exception 'REPORT_NOT_AVAILABLE'; end if;
  insert into public.report_status_history(report_id, actor_id, previous_status, new_status, note)
    values (claimed.id, auth.uid(), 'Open', 'In Progress', 'Report claimed');
  return claimed;
end $$;

create or replace function public.resolve_report(target_report uuid, completion_note text, completion_image_url text, completion_public_id text)
returns public.reports language plpgsql security definer set search_path = public
as $$
declare resolved public.reports;
begin
  if public.current_app_role() not in ('team_member', 'admin') then raise exception 'FORBIDDEN'; end if;
  if char_length(btrim(completion_note)) < 10 or completion_image_url not like 'https://res.cloudinary.com/%' or char_length(btrim(completion_public_id)) < 1 then raise exception 'INVALID_RESOLUTION'; end if;
  update public.reports set status = 'Resolved', resolution_note = btrim(completion_note),
    resolution_image_url = completion_image_url, resolution_cloudinary_public_id = btrim(completion_public_id),
    resolved_at = now(), resolved_by = auth.uid()
    where id = target_report and status = 'In Progress' and (assigned_to = auth.uid() or public.current_app_role() = 'admin')
    returning * into resolved;
  if resolved.id is null then raise exception 'REPORT_NOT_ASSIGNABLE'; end if;
  insert into public.report_status_history(report_id, actor_id, previous_status, new_status, note)
    values (resolved.id, auth.uid(), 'In Progress', 'Resolved', btrim(completion_note));
  return resolved;
end $$;

create or replace function public.review_team_application(target_application uuid, decision public.application_status, review_reason text default null)
returns public.team_member_applications language plpgsql security definer set search_path = public
as $$
declare reviewed public.team_member_applications;
begin
  if public.current_app_role() <> 'admin' then raise exception 'FORBIDDEN'; end if;
  if decision not in ('Approved', 'Rejected') then raise exception 'INVALID_DECISION'; end if;
  update public.team_member_applications set status = decision, reviewed_by = auth.uid(),
    review_note = nullif(btrim(coalesce(review_reason, '')), ''), reviewed_at = now()
    where id = target_application and status = 'Pending' and applicant_id <> auth.uid()
    returning * into reviewed;
  if reviewed.id is null then raise exception 'APPLICATION_NOT_AVAILABLE'; end if;
  if decision = 'Approved' then update public.profiles set role = 'team_member', updated_at = now() where id = reviewed.applicant_id; end if;
  insert into public.admin_audit_log(actor_id, action, entity_type, entity_id, details)
    values (auth.uid(), 'review_application', 'team_member_application', reviewed.id, jsonb_build_object('decision', decision));
  return reviewed;
end $$;

revoke execute on function public.claim_report(uuid) from public, anon;
revoke execute on function public.resolve_report(uuid, text, text, text) from public, anon;
revoke execute on function public.review_team_application(uuid, public.application_status, text) from public, anon;
grant execute on function public.claim_report(uuid) to authenticated;
grant execute on function public.resolve_report(uuid, text, text, text) to authenticated;
grant execute on function public.review_team_application(uuid, public.application_status, text) to authenticated;
