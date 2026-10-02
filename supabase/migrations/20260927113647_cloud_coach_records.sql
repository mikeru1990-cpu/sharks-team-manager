-- Coach-only records. Composite foreign keys prevent cross-team associations.
create unique index players_id_team_unique on public.players(id, team_id);
create unique index team_events_id_team_unique on public.team_events(id, team_id);

create table public.player_position_profiles (
  player_id uuid primary key,
  team_id uuid not null,
  defence smallint check (defence between 0 and 5),
  centre_mid smallint check (centre_mid between 0 and 5),
  wide smallint check (wide between 0 and 5),
  striker smallint check (striker between 0 and 5),
  goalkeeper smallint check (goalkeeper between 0 and 5),
  all_rounder boolean not null default false,
  notes text not null default '' check (length(notes) <= 4000),
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  foreign key (player_id,team_id) references public.players(id,team_id) on delete cascade
);
create index player_position_profiles_team_idx on public.player_position_profiles(team_id);

create table public.team_match_reports (
  event_id uuid primary key,
  team_id uuid not null,
  goals_for integer check (goals_for between 0 and 99),
  goals_against integer check (goals_against between 0 and 99),
  outcome text not null check (outcome in ('win','draw','loss')),
  notes text not null default '' check (length(notes) <= 4000),
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  unique(event_id,team_id),
  foreign key (event_id,team_id) references public.team_events(id,team_id) on delete cascade,
  check ((goals_for is null and goals_against is null) or
    (goals_for is not null and goals_against is not null and outcome =
      case when goals_for > goals_against then 'win' when goals_for < goals_against then 'loss' else 'draw' end))
);
create index team_match_reports_team_idx on public.team_match_reports(team_id);
create table public.team_match_awards (
  event_id uuid not null,
  team_id uuid not null,
  player_id uuid not null,
  category text not null check (category in ('players','spectators','opponents')),
  primary key(event_id,category,player_id),
  foreign key(event_id,team_id) references public.team_match_reports(event_id,team_id) on delete cascade,
  foreign key(player_id,team_id) references public.players(id,team_id) on delete cascade
);
create index team_match_awards_team_idx on public.team_match_awards(team_id);
create index team_match_awards_player_idx on public.team_match_awards(player_id);

alter table public.player_position_profiles enable row level security;
alter table public.team_match_reports enable row level security;
alter table public.team_match_awards enable row level security;
create policy profiles_coaches on public.player_position_profiles for all to authenticated
using (public.can_manage_team(team_id)) with check (public.can_manage_team(team_id));
create policy reports_coaches on public.team_match_reports for all to authenticated
using (public.can_manage_team(team_id)) with check (public.can_manage_team(team_id));
create policy awards_coaches on public.team_match_awards for all to authenticated
using (public.can_manage_team(team_id)) with check (public.can_manage_team(team_id));
revoke all on public.player_position_profiles,public.team_match_reports,public.team_match_awards from anon;
grant select,insert,update on public.player_position_profiles,public.team_match_reports to authenticated;
grant select,insert,update,delete on public.team_match_awards to authenticated;
grant all on public.player_position_profiles,public.team_match_reports,public.team_match_awards to service_role;

create function public.save_position_profile(target_player uuid, expected_version integer, profile jsonb)
returns public.player_position_profiles language plpgsql security invoker set search_path = public as $$
declare t uuid; current_version integer; saved public.player_position_profiles;
begin
  select team_id into t from public.players where id=target_player for update;
  if auth.uid() is null or t is null or not public.can_manage_team(t) then raise exception 'Coach access required'; end if;
  select version into current_version from public.player_position_profiles where player_id=target_player;
  if coalesce(current_version,0) <> expected_version then raise exception 'This profile changed elsewhere. Reload before saving.'; end if;
  insert into public.player_position_profiles(player_id,team_id,defence,centre_mid,wide,striker,goalkeeper,all_rounder,notes)
  values(target_player,t,(profile->>'defence')::smallint,(profile->>'centre_mid')::smallint,(profile->>'wide')::smallint,(profile->>'striker')::smallint,(profile->>'goalkeeper')::smallint,coalesce((profile->>'all_rounder')::boolean,false),coalesce(profile->>'notes',''))
  on conflict(player_id) do update set defence=excluded.defence,centre_mid=excluded.centre_mid,wide=excluded.wide,striker=excluded.striker,goalkeeper=excluded.goalkeeper,all_rounder=excluded.all_rounder,notes=excluded.notes,version=player_position_profiles.version+1,updated_at=now(),updated_by=auth.uid()
  returning * into saved;
  return saved;
end $$;

create function public.save_team_match_report(target_event uuid, expected_version integer, report jsonb, awards jsonb)
returns public.team_match_reports language plpgsql security invoker set search_path = public as $$
declare t uuid; current_version integer; saved public.team_match_reports;
begin
  select team_id into t from public.team_events where id=target_event and event_type='match' and status <> 'cancelled' for update;
  if auth.uid() is null or t is null or not public.can_manage_team(t) then raise exception 'A team match and coach access are required'; end if;
  select version into current_version from public.team_match_reports where event_id=target_event;
  if coalesce(current_version,0) <> expected_version then raise exception 'This report changed elsewhere. Reload before saving.'; end if;
  if jsonb_typeof(awards) <> 'array' or awards is null then raise exception 'Awards must be an array'; end if;
  insert into public.team_match_reports(event_id,team_id,goals_for,goals_against,outcome,notes)
  values(target_event,t,(report->>'goals_for')::integer,(report->>'goals_against')::integer,report->>'outcome',coalesce(report->>'notes',''))
  on conflict(event_id) do update set goals_for=excluded.goals_for,goals_against=excluded.goals_against,outcome=excluded.outcome,notes=excluded.notes,version=team_match_reports.version+1,updated_at=now(),updated_by=auth.uid()
  returning * into saved;
  delete from public.team_match_awards where event_id=target_event;
  insert into public.team_match_awards(event_id,team_id,player_id,category)
  select target_event,t,a.player_id,a.category from jsonb_to_recordset(awards) as a(player_id uuid,category text);
  update public.team_events set status='completed' where id=target_event;
  return saved;
end $$;
revoke all on function public.save_position_profile(uuid,integer,jsonb), public.save_team_match_report(uuid,integer,jsonb,jsonb) from public,anon;
grant execute on function public.save_position_profile(uuid,integer,jsonb), public.save_team_match_report(uuid,integer,jsonb,jsonb) to authenticated;
