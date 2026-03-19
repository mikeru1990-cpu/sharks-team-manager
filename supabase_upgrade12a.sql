-- USERS LOGIN IS HANDLED BY SUPABASE AUTH
-- THIS SCRIPT CREATES THE APP TABLES FOR UPGRADE 12A

create table if not exists public.players (
  id text primary key,
  name text not null,
  positions_json text not null default '[]',
  main_gk boolean not null default false,
  backup_gk boolean not null default false,
  captain boolean not null default false,
  vice_captain boolean not null default false,
  season_seconds integer not null default 0,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id text primary key,
  home_team text not null default 'Sharks Lioness',
  away_team text not null default 'Opposition',
  match_format text not null default '7v7',
  formation text not null default '2-3-1',
  current_quarter integer not null default 1,
  home_score integer not null default 0,
  away_score integer not null default 0,
  selected_date date default current_date,
  updated_at timestamptz not null default now()
);

create table if not exists public.timeline_events (
  id text primary key,
  minute integer not null default 0,
  type text not null,
  text text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.quarter_plans (
  id text primary key,
  quarter_number integer not null unique,
  lineup_json text not null default '{}',
  bench_json text not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_lineups (
  id text primary key,
  name text not null,
  match_format text not null,
  formation text not null,
  lineup_json text not null default '{}',
  bench_json text not null default '[]',
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id)
values ('main')
on conflict (id) do nothing;

alter table public.players enable row level security;
alter table public.app_settings enable row level security;
alter table public.timeline_events enable row level security;
alter table public.quarter_plans enable row level security;
alter table public.saved_lineups enable row level security;

drop policy if exists "players_read_authenticated" on public.players;
drop policy if exists "players_admin_write" on public.players;

drop policy if exists "settings_read_authenticated" on public.app_settings;
drop policy if exists "settings_admin_write" on public.app_settings;

drop policy if exists "timeline_read_authenticated" on public.timeline_events;
drop policy if exists "timeline_admin_write" on public.timeline_events;

drop policy if exists "quarters_read_authenticated" on public.quarter_plans;
drop policy if exists "quarters_admin_write" on public.quarter_plans;

drop policy if exists "lineups_read_authenticated" on public.saved_lineups;
drop policy if exists "lineups_admin_write" on public.saved_lineups;

create policy "players_read_authenticated"
on public.players
for select
to authenticated
using (true);

create policy "players_admin_write"
on public.players
for all
to authenticated
using (auth.email() in ('your-admin-email@example.com'))
with check (auth.email() in ('your-admin-email@example.com'));

create policy "settings_read_authenticated"
on public.app_settings
for select
to authenticated
using (true);

create policy "settings_admin_write"
on public.app_settings
for all
to authenticated
using (auth.email() in ('your-admin-email@example.com'))
with check (auth.email() in ('your-admin-email@example.com'));

create policy "timeline_read_authenticated"
on public.timeline_events
for select
to authenticated
using (true);

create policy "timeline_admin_write"
on public.timeline_events
for all
to authenticated
using (auth.email() in ('your-admin-email@example.com'))
with check (auth.email() in ('your-admin-email@example.com'));

create policy "quarters_read_authenticated"
on public.quarter_plans
for select
to authenticated
using (true);

create policy "quarters_admin_write"
on public.quarter_plans
for all
to authenticated
using (auth.email() in ('your-admin-email@example.com'))
with check (auth.email() in ('your-admin-email@example.com'));

create policy "lineups_read_authenticated"
on public.saved_lineups
for select
to authenticated
using (true);

create policy "lineups_admin_write"
on public.saved_lineups
for all
to authenticated
using (auth.email() in ('your-admin-email@example.com'))
with check (auth.email() in ('your-admin-email@example.com'));
