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
