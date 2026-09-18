-- Football OS release database lockdown
-- Locks the pre-Football-OS prototype surface and narrows the new multi-club
-- schema to authenticated, team-scoped access only.

-- Preserve prototype data for audit/history, but remove direct client access.
do $$
declare
  target_table text;
  policy record;
  prototype_tables text[] := array[
    'legacy_players_v1','legacy_fixtures_v1','availability','squads','quarters',
    'saved_squads','event_attendance','event_plans','events','player_match_stats',
    'match_quarter_plans','app_settings','timeline_events','quarter_plans',
    'saved_lineups','match_state','match_timeline','match_period_plans',
    'match_saved_lineups','coaches','coach_availability','coach_unavailability',
    'event_coach_status','match_lineups','match_timeline_events','league_results',
    'training_plans','training_session_history','player_match_ratings',
    'match_reports','league_table','league_teams','seasons'
  ];
begin
  foreach target_table in array prototype_tables loop
    if to_regclass(format('public.%I', target_table)) is not null then
      for policy in
        select policyname
        from pg_policies
        where schemaname='public' and tablename=target_table
      loop
        execute format('drop policy if exists %I on public.%I', policy.policyname, target_table);
      end loop;

      execute format('revoke all privileges on table public.%I from anon', target_table);
      execute format('revoke all privileges on table public.%I from authenticated', target_table);
    end if;
  end loop;
end
$$;

-- Historical league views must never run with creator privileges.
do $$
begin
  if to_regclass('public.league_standings') is not null then
    execute 'alter view public.league_standings set (security_invoker=true)';
    execute 'revoke all privileges on table public.league_standings from anon';
    execute 'revoke all privileges on table public.league_standings from authenticated';
  end if;

  if to_regclass('public.team_head_to_head') is not null then
    execute 'alter view public.team_head_to_head set (security_invoker=true)';
    execute 'revoke all privileges on table public.team_head_to_head from anon';
    execute 'revoke all privileges on table public.team_head_to_head from authenticated';
  end if;
end
$$;

-- Lock mutable search paths on legacy trigger helpers.
alter function public.set_updated_at_column() set search_path = public;
alter function public.set_updated_at() set search_path = public;

-- Security-definer helpers are internal policy/trigger infrastructure unless
-- explicitly granted below.
revoke all on function public.is_club_member(uuid) from public, anon;
revoke all on function public.can_manage_club(uuid) from public, anon;
revoke all on function public.can_access_team(uuid) from public, anon;
revoke all on function public.can_manage_team(uuid) from public, anon;
revoke all on function public.delete_my_account() from public, anon;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.enforce_player_private_team() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

grant execute on function public.is_club_member(uuid) to authenticated;
grant execute on function public.can_manage_club(uuid) to authenticated;
grant execute on function public.can_access_team(uuid) to authenticated;
grant execute on function public.can_manage_team(uuid) to authenticated;
grant execute on function public.delete_my_account() to authenticated;

-- Recreate the Football OS policies with an explicit authenticated role.
drop policy if exists "profiles_read_self" on public.profiles;
create policy "profiles_read_self" on public.profiles
for select to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "clubs_read_members" on public.clubs;
create policy "clubs_read_members" on public.clubs
for select to authenticated
using (public.is_club_member(id));

drop policy if exists "clubs_update_admins" on public.clubs;
create policy "clubs_update_admins" on public.clubs
for update to authenticated
using (public.can_manage_club(id))
with check (public.can_manage_club(id));

drop policy if exists "memberships_manage_admins" on public.club_memberships;
create policy "memberships_manage_admins" on public.club_memberships
for all to authenticated
using (public.can_manage_club(club_id))
with check (public.can_manage_club(club_id));

drop policy if exists "memberships_read_self_or_admin" on public.club_memberships;
create policy "memberships_read_self_or_admin" on public.club_memberships
for select to authenticated
using (user_id = auth.uid() or public.can_manage_club(club_id));

drop policy if exists "teams_manage_admins" on public.teams;
create policy "teams_manage_admins" on public.teams
for all to authenticated
using (public.can_manage_club(club_id))
with check (public.can_manage_club(club_id));

drop policy if exists "teams_read_access" on public.teams;
create policy "teams_read_access" on public.teams
for select to authenticated
using (public.can_access_team(id));

drop policy if exists "team_memberships_manage_club_admins" on public.team_memberships;
create policy "team_memberships_manage_club_admins" on public.team_memberships
for all to authenticated
using (
  exists (
    select 1
    from public.teams team
    where team.id = team_id and public.can_manage_club(team.club_id)
  )
)
with check (
  exists (
    select 1
    from public.teams team
    where team.id = team_id and public.can_manage_club(team.club_id)
  )
);

drop policy if exists "team_memberships_read_self_or_manager" on public.team_memberships;
create policy "team_memberships_read_self_or_manager" on public.team_memberships
for select to authenticated
using (user_id = auth.uid() or public.can_manage_team(team_id));

drop policy if exists "players_team_access" on public.players;
create policy "players_team_access" on public.players
for select to authenticated
using (public.can_access_team(team_id));

drop policy if exists "players_team_write" on public.players;
create policy "players_team_write" on public.players
for all to authenticated
using (public.can_manage_team(team_id))
with check (public.can_manage_team(team_id));

drop policy if exists "fixtures_team_access" on public.fixtures;
create policy "fixtures_team_access" on public.fixtures
for select to authenticated
using (public.can_access_team(team_id));

drop policy if exists "fixtures_team_write" on public.fixtures;
create policy "fixtures_team_write" on public.fixtures
for all to authenticated
using (public.can_manage_team(team_id))
with check (public.can_manage_team(team_id));

drop policy if exists "matches_team_access" on public.matches;
create policy "matches_team_access" on public.matches
for select to authenticated
using (public.can_access_team(team_id));

drop policy if exists "matches_team_write" on public.matches;
create policy "matches_team_write" on public.matches
for all to authenticated
using (public.can_manage_team(team_id))
with check (public.can_manage_team(team_id));

drop policy if exists "match_events_match_access" on public.match_events;
create policy "match_events_match_access" on public.match_events
for select to authenticated
using (
  exists (
    select 1
    from public.matches match
    where match.id = match_id and public.can_access_team(match.team_id)
  )
);

drop policy if exists "match_events_match_write" on public.match_events;
create policy "match_events_match_write" on public.match_events
for all to authenticated
using (
  exists (
    select 1
    from public.matches match
    where match.id = match_id and public.can_manage_team(match.team_id)
  )
)
with check (
  exists (
    select 1
    from public.matches match
    where match.id = match_id and public.can_manage_team(match.team_id)
  )
);

drop policy if exists "policy_acknowledgements_read" on public.policy_acknowledgements;
create policy "policy_acknowledgements_read" on public.policy_acknowledgements
for select to authenticated
using (
  user_id = auth.uid()
  or (club_id is not null and public.can_manage_club(club_id))
);

drop policy if exists "policy_acknowledgements_insert_self" on public.policy_acknowledgements;
create policy "policy_acknowledgements_insert_self" on public.policy_acknowledgements
for insert to authenticated
with check (
  user_id = auth.uid()
  and (club_id is null or public.is_club_member(club_id))
);

drop policy if exists "policy_acknowledgements_delete_self" on public.policy_acknowledgements;
create policy "policy_acknowledgements_delete_self" on public.policy_acknowledgements
for delete to authenticated
using (user_id = auth.uid());

drop policy if exists "player_private_details_read_manager" on public.player_private_details;
create policy "player_private_details_read_manager" on public.player_private_details
for select to authenticated
using (public.can_manage_team(team_id));

drop policy if exists "player_private_details_write_manager" on public.player_private_details;
create policy "player_private_details_write_manager" on public.player_private_details
for all to authenticated
using (public.can_manage_team(team_id))
with check (public.can_manage_team(team_id));
