-- 0003 — Plantings, their photos, linked donors and survival updates

do $$ begin
  create type public.survival_status as enum ('healthy', 'needs_care', 'replanting', 'established');
exception when duplicate_object then null; end $$;

create table if not exists public.plantings (
  id               uuid primary key default gen_random_uuid(),
  title_mr         text not null check (char_length(btrim(title_mr)) between 1 and 200),
  place_mr         text not null check (char_length(btrim(place_mr)) between 1 and 200),  -- area in Wardha
  latitude         double precision check (latitude between -90 and 90),               -- optional map location
  longitude        double precision check (longitude between -180 and 180),
  planted_on       date not null,
  trees_planted    integer not null check (trees_planted >= 0),
  -- Kept in sync with the newest row in planting_updates (trigger below); can also be set directly.
  trees_surviving  integer check (trees_surviving >= 0),
  survival_status  public.survival_status not null default 'healthy',
  last_checked_on  date,
  species_mr       text[] not null default '{}',
  partner_mr       text check (char_length(partner_mr) <= 200),
  care_note_mr     text check (char_length(care_note_mr) <= 1000),
  published        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint surviving_not_more_than_planted check (trees_surviving is null or trees_surviving <= trees_planted)
);

create index if not exists plantings_date_idx on public.plantings (planted_on desc);

create table if not exists public.planting_photos (
  id           uuid primary key default gen_random_uuid(),
  planting_id  uuid not null references public.plantings (id) on delete cascade,
  storage_path text not null,            -- path inside the "public-media" bucket
  width        integer not null check (width > 0),
  height       integer not null check (height > 0),
  alt_mr       text not null default '' check (char_length(alt_mr) <= 300),
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists planting_photos_planting_idx on public.planting_photos (planting_id, sort_order);

create table if not exists public.planting_donors (
  planting_id uuid not null references public.plantings (id) on delete cascade,
  donor_id    uuid not null references public.donors (id) on delete cascade,
  primary key (planting_id, donor_id)
);

create table if not exists public.planting_updates (
  id              uuid primary key default gen_random_uuid(),
  planting_id     uuid not null references public.plantings (id) on delete cascade,
  checked_on      date not null default current_date,
  trees_surviving integer not null check (trees_surviving >= 0),
  status          public.survival_status not null default 'healthy',
  note_mr         text check (char_length(note_mr) <= 1000),
  created_at      timestamptz not null default now()
);

create index if not exists planting_updates_planting_idx on public.planting_updates (planting_id, checked_on desc);

drop trigger if exists plantings_touch on public.plantings;
create trigger plantings_touch before update on public.plantings
  for each row execute function public.touch_updated_at();

-- The newest survival update becomes the planting's current survival numbers.
create or replace function public.planting_updates_after_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pid uuid := coalesce(new.planting_id, old.planting_id);
  latest record;
begin
  select u.trees_surviving, u.status, u.checked_on
    into latest
    from public.planting_updates u
   where u.planting_id = pid
   order by u.checked_on desc, u.created_at desc
   limit 1;

  if found then
    update public.plantings p
       set trees_surviving = least(latest.trees_surviving, p.trees_planted),
           survival_status = latest.status,
           last_checked_on = latest.checked_on
     where p.id = pid;
  end if;
  return null;
end;
$$;

drop trigger if exists planting_updates_sync on public.planting_updates;
create trigger planting_updates_sync
  after insert or update or delete on public.planting_updates
  for each row execute function public.planting_updates_after_change();

revoke all on function public.planting_updates_after_change() from public, anon, authenticated;
