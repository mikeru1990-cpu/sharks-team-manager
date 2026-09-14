-- Football OS release hardening
-- Tightens write permissions, stores policy acknowledgements and enables in-app account deletion.

create or replace function public.can_manage_team(target_team uuid)
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
            and membership.role in ('manager', 'coach', 'assistant_coach')
        )
      )
  );
$$;

drop policy if exists "players_team_write" on public.players;
create policy "players_team_write" on public.players
for all using (public.can_manage_team(team_id))
with check (public.can_manage_team(team_id));

drop policy if exists "fixtures_team_write" on public.fixtures;
create policy "fixtures_team_write" on public.fixtures
for all using (public.can_manage_team(team_id))
with check (public.can_manage_team(team_id));

drop policy if exists "matches_team_write" on public.matches;
create policy "matches_team_write" on public.matches
for all using (public.can_manage_team(team_id))
with check (public.can_manage_team(team_id));

drop policy if exists "match_events_match_write" on public.match_events;
create policy "match_events_match_write" on public.match_events
for all using (
  exists (
    select 1
    from public.matches match
    where match.id = match_id
      and public.can_manage_team(match.team_id)
  )
) with check (
  exists (
    select 1
    from public.matches match
    where match.id = match_id
      and public.can_manage_team(match.team_id)
  )
);

create table if not exists public.policy_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete cascade,
  policy_id text not null,
  policy_version text not null,
  audience text not null check (audience in ('parent', 'player', 'coach')),
  acknowledged_at timestamptz not null default now(),
  unique (user_id, club_id, policy_id, policy_version)
);

create index if not exists policy_acknowledgements_user_idx
  on public.policy_acknowledgements(user_id);
create index if not exists policy_acknowledgements_club_idx
  on public.policy_acknowledgements(club_id);

alter table public.policy_acknowledgements enable row level security;

drop policy if exists "policy_acknowledgements_read" on public.policy_acknowledgements;
create policy "policy_acknowledgements_read" on public.policy_acknowledgements
for select using (
  user_id = auth.uid()
  or (club_id is not null and public.can_manage_club(club_id))
);

drop policy if exists "policy_acknowledgements_insert_self" on public.policy_acknowledgements;
create policy "policy_acknowledgements_insert_self" on public.policy_acknowledgements
for insert with check (
  user_id = auth.uid()
  and (club_id is null or public.is_club_member(club_id))
);

drop policy if exists "policy_acknowledgements_delete_self" on public.policy_acknowledgements;
create policy "policy_acknowledgements_delete_self" on public.policy_acknowledgements
for delete using (user_id = auth.uid());

-- Preserve club and match history when an account is deleted while removing the account itself.
alter table public.clubs alter column created_by drop not null;
alter table public.clubs drop constraint if exists clubs_created_by_fkey;
alter table public.clubs
  add constraint clubs_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

alter table public.club_memberships drop constraint if exists club_memberships_invited_by_fkey;
alter table public.club_memberships
  add constraint club_memberships_invited_by_fkey
  foreign key (invited_by) references auth.users(id) on delete set null;

alter table public.matches alter column created_by drop not null;
alter table public.matches drop constraint if exists matches_created_by_fkey;
alter table public.matches
  add constraint matches_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

alter table public.match_events alter column created_by drop not null;
alter table public.match_events drop constraint if exists match_events_created_by_fkey;
alter table public.match_events
  add constraint match_events_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_user_id uuid := auth.uid();
begin
  if target_user_id is null then
    raise exception 'Authentication required';
  end if;

  delete from auth.users where id = target_user_id;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
