create type public.report_status as enum ('Open', 'In Progress', 'Resolved');
create type public.report_severity as enum ('Low', 'Medium', 'High');
create table public.reports (
  id uuid primary key, title text not null check (char_length(title) between 4 and 100),
  description text not null check (char_length(description) between 10 and 600), category text not null,
  location text not null, severity public.report_severity not null, status public.report_status not null default 'Open',
  image_url text not null, cloudinary_public_id text not null, resolution_note text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.reports enable row level security;
create policy "Anyone can view reports" on public.reports for select using (true);
create policy "Public can create reports" on public.reports for insert with check (true);
-- Add a SECURITY DEFINER is_admin() helper and update policy after configuring Supabase Auth.
