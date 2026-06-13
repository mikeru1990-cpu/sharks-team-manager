-- Access approval layer for Sharks Team Manager
-- Run this in Supabase SQL editor.

create table if not exists public.app_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'pending' check (role in ('pending', 'parent', 'coach', 'admin')),
  approved boolean not null default false,
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.app_profiles enable row level security;

drop policy if exists "profiles can read own profile" on public.app_profiles;
create policy "profiles can read own profile"
  on public.app_profiles for select
  using (auth.uid() = id);

drop policy if exists "approved admins can read all profiles" on public.app_profiles;
create policy "approved admins can read all profiles"
  on public.app_profiles for select
  using (
    exists (
      select 1 from public.app_profiles admin_profile
      where admin_profile.id = auth.uid()
      and admin_profile.approved = true
      and admin_profile.role = 'admin'
    )
  );

drop policy if exists "approved admins can update profiles" on public.app_profiles;
create policy "approved admins can update profiles"
  on public.app_profiles for update
  using (
    exists (
      select 1 from public.app_profiles admin_profile
      where admin_profile.id = auth.uid()
      and admin_profile.approved = true
      and admin_profile.role = 'admin'
    )
  )
  with check (true);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.app_profiles (id, email, display_name, role, approved)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', ''), 'pending', false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_after_auth_user_created on auth.users;
create trigger create_profile_after_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();
