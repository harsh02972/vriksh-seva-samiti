-- 0001 — Admin accounts and shared helpers
-- Run the migration files in order (0001, 0002, ...) in the Supabase SQL Editor, or with `supabase db push`.
--
-- Security model (applies to every migration):
--   * There is NO visitor login. The public website reads as the `anon` role.
--   * Only users listed in public.admin_users are admins. Everyone else (anon, or a
--     signed-in non-admin) gets nothing beyond the public, money-free data.
--   * Supabase grants ALL privileges on new public tables to anon/authenticated by
--     default, so every table explicitly REVOKEs and then grants only what is needed.

-- Stop Supabase's default "grant everything to anon/authenticated" for objects created from now on.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated, public;

-- ---------------------------------------------------------------------------
-- Admin users
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "admin_users: read own row" on public.admin_users;
create policy "admin_users: read own row"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

-- True when the signed-in user is an admin. SECURITY DEFINER so policies can call it
-- without giving anyone read access to admin_users.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.touch_updated_at() from public, anon, authenticated;
