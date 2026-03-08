alter table public.players enable row level security;
alter table public.fixtures enable row level security;
alter table public.availability enable row level security;
alter table public.squad_selections enable row level security;
alter table public.quarter_assignments enable row level security;

create policy "players read write" on public.players for all using (true) with check (true);
create policy "fixtures read write" on public.fixtures for all using (true) with check (true);
create policy "availability read write" on public.availability for all using (true) with check (true);
create policy "selections read write" on public.squad_selections for all using (true) with check (true);
create policy "quarters read write" on public.quarter_assignments for all using (true) with check (true);
