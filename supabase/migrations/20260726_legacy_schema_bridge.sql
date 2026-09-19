-- Football OS legacy-schema bridge
-- Preserves the original Sharks prototype tables before the multi-club foundation
-- creates new team-scoped players and fixtures tables.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'players'
      and column_name = 'name'
  )
  and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'players'
      and column_name = 'team_id'
  )
  and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'legacy_players_v1'
  ) then
    alter table public.players rename to legacy_players_v1;
    comment on table public.legacy_players_v1 is
      'Read-only preserved prototype player data from before the Football OS team-scoped schema.';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'fixtures'
      and column_name = 'match_date'
  )
  and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'fixtures'
      and column_name = 'team_id'
  )
  and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'legacy_fixtures_v1'
  ) then
    alter table public.fixtures rename to legacy_fixtures_v1;
    comment on table public.legacy_fixtures_v1 is
      'Read-only preserved prototype fixture data from before the Football OS team-scoped schema.';
  end if;
end
$$;
