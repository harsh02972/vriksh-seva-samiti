-- 0005 — Site numbers (auto-calculated + optional manual override) and editable page texts

-- Exactly one row (id is always 1). Every *_override that is null means "calculate automatically".
create table if not exists public.site_stats (
  id                      smallint primary key default 1 check (id = 1),
  trees_planted_override  integer check (trees_planted_override >= 0),
  trees_surviving_override integer check (trees_surviving_override >= 0),
  waste_kg_override       integer check (waste_kg_override >= 0),
  donors_override         integer check (donors_override >= 0),
  next_milestone          integer check (next_milestone > 0),   -- null = next round thousand
  updated_at              timestamptz not null default now()
);

insert into public.site_stats (id) values (1) on conflict (id) do nothing;

drop trigger if exists site_stats_touch on public.site_stats;
create trigger site_stats_touch before update on public.site_stats
  for each row execute function public.touch_updated_at();

-- Editable texts. One row per section: 'home', 'about', 'how_it_works', 'get_involved',
-- 'contact' (page texts) and 'contact_details' (phone, email, address, WhatsApp group, social links).
-- value is a flat JSON object of strings; anything missing falls back to the built-in text.
create table if not exists public.site_content (
  key        text primary key check (key in ('home', 'about', 'how_it_works', 'get_involved', 'contact', 'contact_details')),
  value      jsonb not null default '{}'::jsonb check (jsonb_typeof(value) = 'object'),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_updated_at();

-- Public numbers for the website. SECURITY DEFINER so it can add up kg from contributions
-- (which visitors cannot read), but it returns ONLY totals — never amounts.
create or replace function public.site_stats_public()
returns table (
  trees_planted   integer,
  trees_surviving integer,
  waste_kg        integer,
  donors          integer,
  next_milestone  integer,
  auto_trees_planted   integer,
  auto_trees_surviving integer,
  auto_waste_kg        integer,
  auto_donors          integer,
  has_data        boolean,
  updated_at      timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with auto as (
    select
      coalesce((select sum(p.trees_planted) from public.plantings p where p.published), 0)::integer as trees_planted,
      coalesce((select sum(coalesce(p.trees_surviving, p.trees_planted)) from public.plantings p where p.published), 0)::integer as trees_surviving,
      coalesce((select round(sum(c.kg)) from public.contributions c), 0)::integer as waste_kg,
      (select count(*) from public.donors d where exists (select 1 from public.contributions c where c.donor_id = d.id))::integer as donors,
      greatest(
        coalesce((select max(p.updated_at) from public.plantings p), 'epoch'),
        coalesce((select max(c.updated_at) from public.contributions c), 'epoch')
      ) as data_updated_at
  ),
  s as (select * from public.site_stats where id = 1)
  select
    coalesce(s.trees_planted_override, a.trees_planted),
    coalesce(s.trees_surviving_override, a.trees_surviving),
    coalesce(s.waste_kg_override, a.waste_kg),
    coalesce(s.donors_override, a.donors),
    coalesce(
      s.next_milestone,
      ((coalesce(s.trees_planted_override, a.trees_planted) / 1000) + 1) * 1000
    ),
    a.trees_planted, a.trees_surviving, a.waste_kg, a.donors,
    (a.trees_planted + a.waste_kg + a.donors) > 0
      or s.trees_planted_override is not null or s.trees_surviving_override is not null
      or s.waste_kg_override is not null or s.donors_override is not null,
    greatest(a.data_updated_at, coalesce(s.updated_at, 'epoch'))
  from auto a
  left join s on true;
$$;

-- Trees planted during a campaign = sum of published plantings between its dates (unless overridden).
-- SECURITY INVOKER: callers only see plantings they are allowed to see.
create or replace function public.campaign_trees(p_start date, p_end date)
returns integer
language sql
stable
set search_path = ''
as $$
  select coalesce(sum(p.trees_planted), 0)::integer
    from public.plantings p
   where p.published and p.planted_on between p_start and p_end;
$$;
