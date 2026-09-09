-- Football OS cloud squad and youth-data privacy hardening
-- Makes team scoping explicit, separates sensitive child data, and supports one canonical squad across devices.

alter table public.players
  add column if not exists external_key text,
  add column if not exists known_as text,
  add column if not exists responsibilities text[] not null default '{"Squad Player"}',
  add column if not exists availability text not null default 'Available';

update public.players
set external_key = id::text
where external_key is null or btrim(external_key) = '';

alter table public.players
  alter column external_key set not null;

alter table public.players
  drop constraint if exists players_availability_check;

alter table public.players
  add constraint players_availability_check
  check (availability in ('Available', 'Doubtful', 'Injured', 'Unavailable'));

alter table public.players
  drop constraint if exists players_team_external_key_key;

alter table public.players
  add constraint players_team_external_key_key unique (team_id, external_key);

create table if not exists public.player_private_details (
  player_id uuid primary key references public.players(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  parent_contact text not null default '',
  medical_notes text not null default '',
  development_notes text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists player_private_details_team_idx
  on public.player_private_details(team_id);

alter table public.player_private_details enable row level security;

-- A user may access a team only when they manage the club or are explicitly
-- assigned to that team. This prevents a parent/viewer membership in one team
-- from becoming club-wide player access.
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
        public.can_manage_club(team.club_id)
        or exists (
          select 1
          from public.team_memberships membership
          where membership.team_id = target_team
            and membership.user_id = auth.uid()
        )
      )
  );
$$;

drop policy if exists "teams_read_members" on public.teams;
drop policy if exists "teams_read_access" on public.teams;
create policy "teams_read_access" on public.teams
for select using (public.can_access_team(id));

drop policy if exists "memberships_read_club_members" on public.club_memberships;
drop policy if exists "memberships_read_self_or_admin" on public.club_memberships;
create policy "memberships_read_self_or_admin" on public.club_memberships
for select using (
  user_id = auth.uid()
  or public.can_manage_club(club_id)
);

drop policy if exists "team_memberships_read_team" on public.team_memberships;
drop policy if exists "team_memberships_read_self_or_manager" on public.team_memberships;
create policy "team_memberships_read_self_or_manager" on public.team_memberships
for select using (
  user_id = auth.uid()
  or public.can_manage_team(team_id)
);

drop policy if exists "players_team_access" on public.players;
create policy "players_team_access" on public.players
for select using (public.can_access_team(team_id));

drop policy if exists "player_private_details_read_manager" on public.player_private_details;
create policy "player_private_details_read_manager" on public.player_private_details
for select using (public.can_manage_team(team_id));

drop policy if exists "player_private_details_write_manager" on public.player_private_details;
create policy "player_private_details_write_manager" on public.player_private_details
for all using (public.can_manage_team(team_id))
with check (public.can_manage_team(team_id));

-- Keep team_id trustworthy when private details are written.
create or replace function public.enforce_player_private_team()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select team_id into new.team_id
  from public.players
  where id = new.player_id;

  if new.team_id is null then
    raise exception 'Unknown player';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists player_private_details_team_guard on public.player_private_details;
create trigger player_private_details_team_guard
before insert or update on public.player_private_details
for each row execute function public.enforce_player_private_team();

revoke all on function public.enforce_player_private_team() from public;
