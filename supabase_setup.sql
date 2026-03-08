create extension if not exists pgcrypto;

drop view if exists public.player_fairness_summary;
drop table if exists public.quarter_assignments cascade;
drop table if exists public.squad_selections cascade;
drop table if exists public.availability cascade;
drop table if exists public.fixtures cascade;
drop table if exists public.players cascade;

create table public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_goalkeeper boolean not null default false,
  can_cover_goal boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.fixtures (
  id uuid primary key default gen_random_uuid(),
  match_date date not null,
  opponent text not null,
  venue text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null check (status in ('available', 'unavailable', 'unknown')),
  note text,
  created_at timestamptz not null default now(),
  unique (fixture_id, player_id)
);

create table public.squad_selections (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  selection_status text not null check (selection_status in ('selected', 'reserve', 'not_available')),
  reason text,
  created_at timestamptz not null default now(),
  unique (fixture_id, player_id)
);

create table public.quarter_assignments (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  quarter int not null check (quarter between 1 and 4),
  role text not null check (role in ('GK', 'OUTFIELD', 'BENCH')),
  created_at timestamptz not null default now(),
  unique (fixture_id, player_id, quarter)
);

create index idx_availability_fixture on public.availability(fixture_id);
create index idx_squad_fixture on public.squad_selections(fixture_id);
create index idx_quarters_fixture on public.quarter_assignments(fixture_id);

insert into public.players (name, is_goalkeeper, can_cover_goal)
values
('Bella Bainbridge', false, false),
('Poppy Bennett', false, true),
('Bailee Dowler-Rowles', false, true),
('Evelyn Evans', false, false),
('Elsy Harmer', false, false),
('Olivia Hassall', false, false),
('Connie Luff', false, false),
('Isabella Ogden', false, false),
('Betsy Rowland', false, true),
('Darcy-Rae Russell', true, false),
('Ruby Salter', false, false),
('Martha Scrivens', false, false),
('Lyra Twinning', false, false),
('Ella Wilson', false, false);

create or replace view public.player_fairness_summary as
with selection_stats as (
  select
    ss.player_id,
    count(*) filter (where ss.selection_status = 'selected') as selected_count,
    count(*) filter (where ss.selection_status = 'reserve') as reserve_count
  from public.squad_selections ss
  group by ss.player_id
),
quarter_stats as (
  select
    qa.player_id,
    count(*) filter (where qa.role in ('GK', 'OUTFIELD')) as quarters_played,
    count(*) filter (where qa.role = 'BENCH') as bench_quarters
  from public.quarter_assignments qa
  group by qa.player_id
)
select
  p.id,
  p.name,
  p.is_goalkeeper,
  p.can_cover_goal,
  coalesce(s.selected_count, 0) as selected_count,
  coalesce(s.reserve_count, 0) as reserve_count,
  coalesce(q.quarters_played, 0) as quarters_played,
  coalesce(q.bench_quarters, 0) as bench_quarters,
  (
    coalesce(s.reserve_count, 0) * 100
    - coalesce(s.selected_count, 0) * 10
    - coalesce(q.quarters_played, 0)
  ) as fairness_score
from public.players p
left join selection_stats s on s.player_id = p.id
left join quarter_stats q on q.player_id = p.id;

create or replace function public.generate_match_plan(p_fixture_id uuid)
returns table (
  fixture_id uuid,
  player_name text,
  selection_status text,
  q1 text,
  q2 text,
  q3 text,
  q4 text
)
language plpgsql
as $$
declare
  v_gk_id uuid;
  v_player uuid;
  v_idx int;
  v_quarter int;
  arr_three_quarters uuid[];
  arr_two_quarters uuid[];
  arr_all_selected_outfield uuid[];
  bench_q1 uuid[];
  bench_q2 uuid[];
  bench_q3 uuid[];
  bench_q4 uuid[];
begin
  delete from public.quarter_assignments where fixture_id = p_fixture_id;
  delete from public.squad_selections where fixture_id = p_fixture_id;

  select p.id
  into v_gk_id
  from public.players p
  join public.availability a
    on a.player_id = p.id
   and a.fixture_id = p_fixture_id
  where p.is_goalkeeper = true
    and a.status = 'available'
  limit 1;

  if v_gk_id is null then
    raise exception 'No goalkeeper marked available for this fixture.';
  end if;

  insert into public.squad_selections (fixture_id, player_id, selection_status, reason)
  select
    p_fixture_id,
    p.id,
    case
      when a.status <> 'available' or a.status is null then 'not_available'
      when p.id = v_gk_id then 'selected'
      else 'reserve'
    end,
    case
      when a.status <> 'available' or a.status is null then 'Unavailable'
      when p.id = v_gk_id then 'Goalkeeper locked in'
      else null
    end
  from public.players p
  left join public.availability a
    on a.player_id = p.id
   and a.fixture_id = p_fixture_id
  where p.active = true;

  with ranked_outfield as (
    select
      p.id,
      coalesce(fs.fairness_score, 0) as fairness_score
    from public.players p
    join public.availability a
      on a.player_id = p.id
     and a.fixture_id = p_fixture_id
    left join public.player_fairness_summary fs
      on fs.id = p.id
    where p.active = true
      and p.is_goalkeeper = false
      and a.status = 'available'
    order by fairness_score desc, p.name asc
    limit 9
  )
  update public.squad_selections ss
  set
    selection_status = 'selected',
    reason = 'Auto-selected on fairness'
  from ranked_outfield ro
  where ss.fixture_id = p_fixture_id
    and ss.player_id = ro.id;

  select array_agg(ss.player_id order by fs.fairness_score desc nulls last, p.name asc)
  into arr_all_selected_outfield
  from public.squad_selections ss
  join public.players p on p.id = ss.player_id
  left join public.player_fairness_summary fs on fs.id = p.id
  where ss.fixture_id = p_fixture_id
    and ss.selection_status = 'selected'
    and p.is_goalkeeper = false;

  if arr_all_selected_outfield is null or array_length(arr_all_selected_outfield, 1) <> 9 then
    raise exception 'Need exactly 9 available outfield players to generate the plan.';
  end if;

  insert into public.quarter_assignments (fixture_id, player_id, quarter, role)
  values
    (p_fixture_id, v_gk_id, 1, 'GK'),
    (p_fixture_id, v_gk_id, 2, 'GK'),
    (p_fixture_id, v_gk_id, 3, 'GK'),
    (p_fixture_id, v_gk_id, 4, 'GK');

  arr_three_quarters := arr_all_selected_outfield[1:6];
  arr_two_quarters := arr_all_selected_outfield[7:9];

  bench_q1 := array[arr_two_quarters[1], arr_two_quarters[2], arr_two_quarters[3]];
  bench_q2 := array[arr_three_quarters[1], arr_three_quarters[2], arr_three_quarters[3]];
  bench_q3 := array[arr_three_quarters[4], arr_three_quarters[5], arr_three_quarters[6]];
  bench_q4 := array[arr_three_quarters[1], arr_three_quarters[4], arr_two_quarters[1]];

  for v_idx in 1..array_length(arr_all_selected_outfield, 1) loop
    v_player := arr_all_selected_outfield[v_idx];
    for v_quarter in 1..4 loop
      if (
        (v_quarter = 1 and v_player = any(bench_q1)) or
        (v_quarter = 2 and v_player = any(bench_q2)) or
        (v_quarter = 3 and v_player = any(bench_q3)) or
        (v_quarter = 4 and v_player = any(bench_q4))
      ) then
        insert into public.quarter_assignments (fixture_id, player_id, quarter, role)
        values (p_fixture_id, v_player, v_quarter, 'BENCH');
      else
        insert into public.quarter_assignments (fixture_id, player_id, quarter, role)
        values (p_fixture_id, v_player, v_quarter, 'OUTFIELD');
      end if;
    end loop;
  end loop;

  return query
  select
    p_fixture_id as fixture_id,
    p.name as player_name,
    ss.selection_status,
    max(case when qa.quarter = 1 then qa.role end) as q1,
    max(case when qa.quarter = 2 then qa.role end) as q2,
    max(case when qa.quarter = 3 then qa.role end) as q3,
    max(case when qa.quarter = 4 then qa.role end) as q4
  from public.squad_selections ss
  join public.players p on p.id = ss.player_id
  left join public.quarter_assignments qa
    on qa.fixture_id = ss.fixture_id
   and qa.player_id = ss.player_id
  where ss.fixture_id = p_fixture_id
  group by p.name, ss.selection_status, p.is_goalkeeper
  order by p.is_goalkeeper desc, p.name asc;
end;
$$;
