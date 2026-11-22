-- 0006 — Row Level Security, privileges and the PUBLIC VIEWS the website reads.
--
-- PRIVACY RULE: contributions.amount_rs must never be readable by the public.
--   * anon (every website visitor) has NO privilege at all on public.contributions.
--   * anon can read only the public_* views below, plus the exact columns those views need.
--     No view and no anon-callable function returns an amount.
--   * Admin access is granted to `authenticated` but every policy requires public.is_admin(),
--     so a signed-in user who is not in admin_users gets nothing.
-- tests/security.test.mjs checks all of this against these exact SQL files.

-- ---------------------------------------------------------------------------
-- 1. Turn on RLS everywhere and start from zero privileges.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'donors', 'contributions', 'plantings', 'planting_photos', 'planting_donors', 'planting_updates',
    'gallery_photos', 'featured_video', 'campaigns', 'site_stats', 'site_content'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated, public', t);
    -- Admins: full read/write, always filtered by the is_admin() policy below.
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('drop policy if exists "admin: full access" on public.%I', t);
    execute format(
      'create policy "admin: full access" on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',
      t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2. What anonymous visitors may read (column by column), and which rows.
--    contributions: nothing. donors: only leaderboard-safe columns of visible donors.
-- ---------------------------------------------------------------------------
grant select (id, name, type, trees_planted, search_alias, show_on_leaderboard) on public.donors to anon;
drop policy if exists "public: visible leaderboard donors" on public.donors;
create policy "public: visible leaderboard donors" on public.donors
  for select to anon using (show_on_leaderboard and trees_planted > 0);

grant select (id, title_mr, place_mr, latitude, longitude, planted_on, trees_planted, trees_surviving,
              survival_status, last_checked_on, species_mr, partner_mr, care_note_mr, published)
  on public.plantings to anon;
drop policy if exists "public: published plantings" on public.plantings;
create policy "public: published plantings" on public.plantings
  for select to anon using (published);

grant select (id, planting_id, storage_path, width, height, alt_mr, sort_order) on public.planting_photos to anon;
drop policy if exists "public: photos of published plantings" on public.planting_photos;
create policy "public: photos of published plantings" on public.planting_photos
  for select to anon using (exists (select 1 from public.plantings p where p.id = planting_id and p.published));

grant select (planting_id, donor_id) on public.planting_donors to anon;
drop policy if exists "public: planting donor links" on public.planting_donors;
create policy "public: planting donor links" on public.planting_donors
  for select to anon using (exists (select 1 from public.plantings p where p.id = planting_id and p.published));

grant select (id, storage_path, width, height, caption_mr, place_mr, taken_on, category, show_on_home, sort_order, published)
  on public.gallery_photos to anon;
drop policy if exists "public: published gallery photos" on public.gallery_photos;
create policy "public: published gallery photos" on public.gallery_photos
  for select to anon using (published);

grant select (id, video_path, duration_sec, video_width, video_height, poster_path, poster_width, poster_height,
              title_en, caption_mr, transcript_mr, muted_preview, updated_at)
  on public.featured_video to anon;
drop policy if exists "public: featured video" on public.featured_video;
create policy "public: featured video" on public.featured_video for select to anon using (true);

grant select (id, title_en, year_label_mr, description_mr, start_date, end_date, tree_target, trees_planted_override, active)
  on public.campaigns to anon;
drop policy if exists "public: active campaign" on public.campaigns;
create policy "public: active campaign" on public.campaigns for select to anon using (active);

grant select (key, value, updated_at) on public.site_content to anon;
drop policy if exists "public: site texts" on public.site_content;
create policy "public: site texts" on public.site_content for select to anon using (true);

-- site_stats: anon reads it only through site_stats_public() (no direct grant).
-- planting_updates: admin only (the newest numbers are copied onto plantings).

grant execute on function public.site_stats_public() to anon, authenticated;
grant execute on function public.campaign_trees(date, date) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Public views. security_invoker = true: they run with the visitor's own
--    (limited) privileges, so they can never show more than the grants above allow.
-- ---------------------------------------------------------------------------
create or replace view public.public_leaderboard with (security_invoker = true) as
  select d.id, d.name, d.type, d.trees_planted, d.search_alias
    from public.donors d
   where d.show_on_leaderboard and d.trees_planted > 0;

create or replace view public.public_plantings with (security_invoker = true) as
  select p.id, p.title_mr, p.place_mr, p.latitude, p.longitude, p.planted_on, p.trees_planted,
         coalesce(p.trees_surviving, p.trees_planted) as trees_surviving,
         p.survival_status, p.last_checked_on, p.species_mr, p.partner_mr, p.care_note_mr,
         coalesce((
           select jsonb_agg(jsonb_build_object('path', ph.storage_path, 'width', ph.width, 'height', ph.height, 'alt', ph.alt_mr)
                            order by ph.sort_order, ph.id)
             from public.planting_photos ph where ph.planting_id = p.id
         ), '[]'::jsonb) as photos,
         coalesce((
           select jsonb_agg(d.name order by d.name)
             from public.planting_donors pd
             join public.donors d on d.id = pd.donor_id and d.show_on_leaderboard and d.trees_planted > 0
            where pd.planting_id = p.id
         ), '[]'::jsonb) as donor_names
    from public.plantings p
   where p.published;

create or replace view public.public_gallery with (security_invoker = true) as
  select g.id, g.storage_path, g.width, g.height, g.caption_mr, g.place_mr, g.taken_on, g.category, g.show_on_home, g.sort_order
    from public.gallery_photos g
   where g.published;

create or replace view public.public_featured_video with (security_invoker = true) as
  select v.video_path, v.duration_sec, v.video_width, v.video_height, v.poster_path, v.poster_width, v.poster_height,
         v.title_en, v.caption_mr, v.transcript_mr, v.muted_preview, v.updated_at
    from public.featured_video v
   where v.id = 1;

create or replace view public.public_campaign with (security_invoker = true) as
  select c.id, c.title_en, c.year_label_mr, c.description_mr, c.start_date, c.end_date, c.tree_target,
         coalesce(c.trees_planted_override, public.campaign_trees(c.start_date, c.end_date)) as trees_planted
    from public.campaigns c
   where c.active;

create or replace view public.public_site_stats with (security_invoker = true) as
  select s.trees_planted, s.trees_surviving, s.waste_kg, s.donors, s.next_milestone, s.has_data, s.updated_at
    from public.site_stats_public() s;

create or replace view public.public_site_content with (security_invoker = true) as
  select c.key, c.value, c.updated_at from public.site_content c;

do $$
declare v text;
begin
  foreach v in array array[
    'public_leaderboard', 'public_plantings', 'public_gallery', 'public_featured_video',
    'public_campaign', 'public_site_stats', 'public_site_content'
  ] loop
    execute format('revoke all on public.%I from anon, authenticated, public', v);
    execute format('grant select on public.%I to anon, authenticated', v);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Admin-only summary (includes the PRIVATE total amount). Returns nothing to non-admins.
-- ---------------------------------------------------------------------------
create or replace function public.admin_dashboard_totals()
returns table (
  donors integer,
  contributions integer,
  waste_kg numeric,
  trees_from_contributions integer,
  amount_rs numeric,
  plantings integer,
  trees_planted integer,
  trees_surviving integer,
  gallery_photos integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (select count(*) from public.donors)::integer,
    (select count(*) from public.contributions)::integer,
    coalesce((select sum(kg) from public.contributions), 0),
    coalesce((select sum(trees_planted) from public.contributions), 0)::integer,
    coalesce((select sum(amount_rs) from public.contributions), 0),
    (select count(*) from public.plantings)::integer,
    coalesce((select sum(trees_planted) from public.plantings), 0)::integer,
    coalesce((select sum(coalesce(trees_surviving, trees_planted)) from public.plantings), 0)::integer,
    (select count(*) from public.gallery_photos)::integer
  where (select public.is_admin());
$$;

revoke all on function public.admin_dashboard_totals() from public, anon;
grant execute on function public.admin_dashboard_totals() to authenticated;
