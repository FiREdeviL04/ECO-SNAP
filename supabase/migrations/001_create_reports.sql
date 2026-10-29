create type public.report_status as enum ('Open', 'In Progress', 'Resolved');
create type public.report_severity as enum ('Low', 'Medium', 'High');
create table public.reports (
  id uuid primary key, title text not null check (char_length(btrim(title)) between 4 and 100),
  description text not null check (char_length(btrim(description)) between 10 and 600),
  category text not null check (category in ('Overflowing bin', 'Litter', 'Plastic waste', 'Recycling issue', 'Illegal dumping', 'Other')),
  location text not null check (char_length(btrim(location)) between 2 and 100), severity public.report_severity not null, status public.report_status not null default 'Open',
  image_url text not null check (image_url like 'https://res.cloudinary.com/%'), cloudinary_public_id text not null, resolution_note text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.reports enable row level security;
create policy "Anyone can view reports" on public.reports for select using (true);
create policy "Public can create reports" on public.reports for insert with check (true);
create index reports_created_at_idx on public.reports (created_at desc);
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger reports_touch_updated_at before update on public.reports for each row execute function public.touch_updated_at();
revoke update, delete on public.reports from anon;
