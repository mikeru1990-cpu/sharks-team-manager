-- Football OS foundation schema
-- Run through the Supabase migration workflow before enabling authentication in production.

create extension if not exists pgcrypto;

create type public.club_role as enum (
  'owner',
  'club_admin',
  'coach',
  'assistant_coach',
  'parent',
  'viewer'
);

create type public.team_role as enum (
  'manager',
  'coach',
  'assistant_coach',
  'parent',
  'viewer'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  badge_url text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.club_memberships (
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.club_role not null default 'viewer',
  invited_by uuid references auth.users(id),
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  age_group text,
  season text,
  format text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_memberships (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.team_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  shirt_number integer,
  preferred_foot text,
  primary_position text,
  secondary_positions text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fixtures (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  opponent text not null,
  starts_at timestamptz not null,
  venue text,
  competition text,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid references public.fixtures(id) on delete set null,
  team_id uuid not null references public.teams(id) on delete cascade,
  started_at timestamptz,
  ended_at timestamptz,
  home_score integer not null default 0,
  away_score integer not null default 0,
  status text not null default 'planned',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  event_type text not null,
  match_second integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  client_event_id text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (match_id, client_event_id)
);

create index club_memberships_user_idx on public.club_memberships(user_id);
create index teams_club_idx on public.teams(club_id);
create index team_memberships_user_idx on public.team_memberships(user_id);
create index players_team_idx on public.players(team_id);
create index fixtures_team_starts_idx on public.fixtures(team_id, starts_at);
create index matches_team_idx on public.matches(team_id);
create index match_events_match_second_idx on public.match_events(match_id, match_second);

create or replace function public.is_club_member(target_club uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.club_memberships membership
    where membership.club_id = target_club
      and membership.user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_club(target_club uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.club_memberships membership
    where membership.club_id = target_club
      and membership.user_id = auth.uid()
      and membership.role in ('owner', 'club_admin')
  );
$$;

create or replace function public.can_access_team(target_team uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teams team
    where team.id = target_team
      and (
        public.is_club_member(team.club_id)
        or exists (
          select 1
          from public.team_memberships membership
          where membership.team_id = target_team
            and membership.user_id = auth.uid()
        )
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.club_memberships enable row level security;
alter table public.teams enable row level security;
alter table public.team_memberships enable row level security;
alter table public.players enable row level security;
alter table public.fixtures enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;

create policy "profiles_read_self" on public.profiles
for select using (id = auth.uid());

create policy "profiles_update_self" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "clubs_read_members" on public.clubs
for select using (public.is_club_member(id));

create policy "clubs_update_admins" on public.clubs
for update using (public.can_manage_club(id)) with check (public.can_manage_club(id));

create policy "memberships_read_club_members" on public.club_memberships
for select using (public.is_club_member(club_id));

create policy "memberships_manage_admins" on public.club_memberships
for all using (public.can_manage_club(club_id)) with check (public.can_manage_club(club_id));

create policy "teams_read_members" on public.teams
for select using (public.is_club_member(club_id));

create policy "teams_manage_admins" on public.teams
for all using (public.can_manage_club(club_id)) with check (public.can_manage_club(club_id));

create policy "team_memberships_read_team" on public.team_memberships
for select using (public.can_access_team(team_id));

create policy "team_memberships_manage_club_admins" on public.team_memberships
for all using (
  exists (
    select 1 from public.teams team
    where team.id = team_id and public.can_manage_club(team.club_id)
  )
) with check (
  exists (
    select 1 from public.teams team
    where team.id = team_id and public.can_manage_club(team.club_id)
  )
);

create policy "players_team_access" on public.players
for select using (public.can_access_team(team_id));

create policy "players_team_write" on public.players
for all using (public.can_access_team(team_id)) with check (public.can_access_team(team_id));

create policy "fixtures_team_access" on public.fixtures
for select using (public.can_access_team(team_id));

create policy "fixtures_team_write" on public.fixtures
for all using (public.can_access_team(team_id)) with check (public.can_access_team(team_id));

create policy "matches_team_access" on public.matches
for select using (public.can_access_team(team_id));

create policy "matches_team_write" on public.matches
for all using (public.can_access_team(team_id)) with check (public.can_access_team(team_id));

create policy "match_events_match_access" on public.match_events
for select using (
  exists (
    select 1 from public.matches match
    where match.id = match_id and public.can_access_team(match.team_id)
  )
);

create policy "match_events_match_write" on public.match_events
for all using (
  exists (
    select 1 from public.matches match
    where match.id = match_id and public.can_access_team(match.team_id)
  )
) with check (
  exists (
    select 1 from public.matches match
    where match.id = match_id and public.can_access_team(match.team_id)
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
