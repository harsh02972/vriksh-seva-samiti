-- 0002 — Donors and contributions
-- contributions.amount_rs is PRIVATE: only admins can ever read it (see 0006 for grants
-- and the security tests in tests/security.test.mjs).

do $$ begin
  create type public.donor_type as enum ('school', 'college', 'individual', 'organisation');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.waste_type as enum ('paper', 'cardboard', 'books', 'plastic', 'metal', 'mixed', 'other');
exception when duplicate_object then null; end $$;

create table if not exists public.donors (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null check (char_length(btrim(name)) between 1 and 200),
  type                public.donor_type not null,
  area                text check (char_length(area) <= 200),
  show_on_leaderboard boolean not null default true,
  notes               text check (char_length(notes) <= 2000),
  -- Optional English spelling so visitors can search the leaderboard in English. Never displayed.
  search_alias        text check (char_length(search_alias) <= 200),
  -- Maintained automatically from contributions (trigger below). Do not edit by hand.
  trees_planted       integer not null default 0,
  waste_kg            numeric(12, 2) not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists donors_leaderboard_idx on public.donors (show_on_leaderboard, trees_planted desc);

create table if not exists public.contributions (
  id             uuid primary key default gen_random_uuid(),
  donor_id       uuid not null references public.donors (id) on delete cascade,
  contributed_on date not null default current_date,
  waste_type     public.waste_type not null default 'paper',
  kg             numeric(10, 2) not null check (kg >= 0),
  amount_rs      numeric(12, 2) check (amount_rs >= 0),          -- PRIVATE (admins only)
  trees_planted  integer not null default 0 check (trees_planted >= 0),
  notes          text check (char_length(notes) <= 2000),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists contributions_donor_idx on public.contributions (donor_id);
create index if not exists contributions_date_idx on public.contributions (contributed_on desc);

drop trigger if exists donors_touch on public.donors;
create trigger donors_touch before update on public.donors
  for each row execute function public.touch_updated_at();

drop trigger if exists contributions_touch on public.contributions;
create trigger contributions_touch before update on public.contributions
  for each row execute function public.touch_updated_at();

-- Recalculate a donor's trees and kg from their contributions.
create or replace function public.refresh_donor_totals(p_donor uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.donors d
     set trees_planted = coalesce((select sum(c.trees_planted) from public.contributions c where c.donor_id = p_donor), 0),
         waste_kg      = coalesce((select sum(c.kg)            from public.contributions c where c.donor_id = p_donor), 0)
   where d.id = p_donor;
$$;

create or replace function public.contributions_after_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.refresh_donor_totals(old.donor_id);
  end if;
  if tg_op = 'INSERT' or (tg_op = 'UPDATE' and new.donor_id is distinct from old.donor_id) then
    perform public.refresh_donor_totals(new.donor_id);
  end if;
  return null;
end;
$$;

drop trigger if exists contributions_totals on public.contributions;
create trigger contributions_totals
  after insert or update or delete on public.contributions
  for each row execute function public.contributions_after_change();

revoke all on function public.refresh_donor_totals(uuid) from public, anon, authenticated;
revoke all on function public.contributions_after_change() from public, anon, authenticated;
