-- Football OS team schedule, availability and guardian linkage
-- Creates the everyday event model needed for matches, training and team events.

create table if not exists public.team_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_type text not null default 'event'
    check (event_type in ('match','training','event','tournament','meeting')),
  title text not null,
  starts_at timestamptz not null,
  meet_at timestamptz,
  ends_at timestamptz,
  location_name text,
  notes text,
  status text not null default 'scheduled'
    check (status in ('scheduled','cancelled','completed')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists team_events_team_starts_idx
  on public.team_events(team_id, starts_at);

create table if not exists public.player_guardians (
  player_id uuid not null references public.players(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  relationship text not null default 'guardian',
  can_manage_availability boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (player_id, user_id)
);

create index if not exists player_guardians_user_idx
  on public.player_guardians(user_id);

create table if not exists public.event_responses (
  event_id uuid not null references public.team_events(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  response text not null default 'unanswered'
    check (response in ('available','maybe','unavailable','unanswered')),
  note text,
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  updated_at timestamptz not null default now(),
  primary key (event_id, player_id)
);

create index if not exists event_responses_event_idx
  on public.event_responses(event_id);

alter table public.team_events enable row level security;
alter table public.player_guardians enable row level security;
alter table public.event_responses enable row level security;

drop policy if exists "team_events_read" on public.team_events;
create policy "team_events_read" on public.team_events
for select to authenticated
using (public.can_access_team(team_id));

drop policy if exists "team_events_write" on public.team_events;
create policy "team_events_write" on public.team_events
for all to authenticated
using (public.can_manage_team(team_id))
with check (public.can_manage_team(team_id));

drop policy if exists "player_guardians_read" on public.player_guardians;
create policy "player_guardians_read" on public.player_guardians
for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.players player
    where player.id = player_id
      and public.can_manage_team(player.team_id)
  )
);

drop policy if exists "player_guardians_write" on public.player_guardians;
create policy "player_guardians_write" on public.player_guardians
for all to authenticated
using (
  exists (
    select 1
    from public.players player
    where player.id = player_id
      and public.can_manage_team(player.team_id)
  )
)
with check (
  exists (
    select 1
    from public.players player
    where player.id = player_id
      and public.can_manage_team(player.team_id)
  )
);

drop policy if exists "event_responses_read" on public.event_responses;
create policy "event_responses_read" on public.event_responses
for select to authenticated
using (
  exists (
    select 1
    from public.team_events event
    where event.id = event_id
      and public.can_access_team(event.team_id)
  )
);

drop policy if exists "event_responses_write" on public.event_responses;
create policy "event_responses_write" on public.event_responses
for all to authenticated
using (
  exists (
    select 1
    from public.team_events event
    where event.id = event_id
      and public.can_manage_team(event.team_id)
  )
  or exists (
    select 1
    from public.player_guardians guardian
    where guardian.player_id = event_responses.player_id
      and guardian.user_id = auth.uid()
      and guardian.can_manage_availability
  )
)
with check (
  (
    exists (
      select 1
      from public.team_events event
      where event.id = event_id
        and public.can_manage_team(event.team_id)
    )
    or exists (
      select 1
      from public.player_guardians guardian
      where guardian.player_id = event_responses.player_id
        and guardian.user_id = auth.uid()
        and guardian.can_manage_availability
    )
  )
);

create or replace function public.enforce_event_response_team()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_team uuid;
  player_team uuid;
begin
  select team_id into event_team from public.team_events where id = new.event_id;
  select team_id into player_team from public.players where id = new.player_id;

  if event_team is null or player_team is null or event_team <> player_team then
    raise exception 'Event and player must belong to the same team';
  end if;

  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists event_response_team_guard on public.event_responses;
create trigger event_response_team_guard
before insert or update on public.event_responses
for each row execute function public.enforce_event_response_team();

revoke all on function public.enforce_event_response_team() from public, anon, authenticated;

drop trigger if exists team_events_updated_at on public.team_events;
create trigger team_events_updated_at
before update on public.team_events
for each row execute function public.set_updated_at();

comment on table public.team_events is 'Team-scoped matches, training and events for the Football OS Schedule.';
comment on table public.player_guardians is 'Explicit guardian-to-player linkage used for parent-safe availability actions.';
comment on table public.event_responses is 'Per-player RSVP/availability for a team event.';
