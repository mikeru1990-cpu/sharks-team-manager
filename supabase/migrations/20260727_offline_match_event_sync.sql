alter table if exists public.match_events
  add column if not exists client_event_id uuid;

update public.match_events
set client_event_id = gen_random_uuid()
where client_event_id is null;

alter table if exists public.match_events
  alter column client_event_id set not null;

create unique index if not exists match_events_client_event_id_key
  on public.match_events (client_event_id);
