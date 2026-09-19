-- Tighten parent/guardian event availability writes to the linked player only.

drop policy if exists "event_responses_write" on public.event_responses;
create policy "event_responses_write" on public.event_responses
for all to authenticated
using (
  exists (
    select 1
    from public.team_events event
    where event.id = event_responses.event_id
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
  exists (
    select 1
    from public.team_events event
    where event.id = event_responses.event_id
      and public.can_manage_team(event.team_id)
  )
  or exists (
    select 1
    from public.player_guardians guardian
    where guardian.player_id = event_responses.player_id
      and guardian.user_id = auth.uid()
      and guardian.can_manage_availability
  )
);
