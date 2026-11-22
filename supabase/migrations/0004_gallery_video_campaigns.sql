-- 0004 — Gallery photos, the featured video, campaigns

do $$ begin
  create type public.gallery_category as enum ('collection', 'planting', 'care', 'schools');
exception when duplicate_object then null; end $$;

create table if not exists public.gallery_photos (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,
  width        integer not null check (width > 0),
  height       integer not null check (height > 0),
  caption_mr   text not null check (char_length(btrim(caption_mr)) between 1 and 300),
  place_mr     text not null default '' check (char_length(place_mr) <= 200),
  taken_on     date,
  category     public.gallery_category not null default 'planting',
  show_on_home boolean not null default false,
  sort_order   integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists gallery_order_idx on public.gallery_photos (sort_order, taken_on desc);

drop trigger if exists gallery_touch on public.gallery_photos;
create trigger gallery_touch before update on public.gallery_photos
  for each row execute function public.touch_updated_at();

-- Exactly one row (id is always 1).
create table if not exists public.featured_video (
  id               smallint primary key default 1 check (id = 1),
  video_path       text,                                   -- MP4 in the "public-media" bucket
  video_bytes      integer check (video_bytes between 1 and 15728640),   -- max 15 MB
  duration_sec     numeric(5, 2) check (duration_sec > 0 and duration_sec <= 30),
  video_width      integer check (video_width > 0),
  video_height     integer check (video_height > 0),
  poster_path      text,
  poster_width     integer check (poster_width > 0),
  poster_height    integer check (poster_height > 0),
  title_en         text not null default 'See Our Work in 20 Seconds' check (char_length(title_en) <= 120),
  caption_mr       text not null default '' check (char_length(caption_mr) <= 400),
  transcript_mr    text not null default '' check (char_length(transcript_mr) <= 3000),
  muted_preview    boolean not null default true,
  updated_at       timestamptz not null default now()
);

drop trigger if exists featured_video_touch on public.featured_video;
create trigger featured_video_touch before update on public.featured_video
  for each row execute function public.touch_updated_at();

create table if not exists public.campaigns (
  id             uuid primary key default gen_random_uuid(),
  title_en       text not null default 'Current Campaign' check (char_length(btrim(title_en)) between 1 and 120),
  year_label_mr  text not null default '' check (char_length(year_label_mr) <= 60),
  description_mr text not null default '' check (char_length(description_mr) <= 1000),
  start_date     date not null,
  end_date       date not null,
  tree_target    integer not null default 0 check (tree_target >= 0),
  -- null = count automatically from plantings between start_date and end_date.
  trees_planted_override integer check (trees_planted_override >= 0),
  active         boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint campaign_dates check (end_date >= start_date)
);

-- Only one campaign can be active at a time.
create unique index if not exists campaigns_one_active on public.campaigns (active) where active;

drop trigger if exists campaigns_touch on public.campaigns;
create trigger campaigns_touch before update on public.campaigns
  for each row execute function public.touch_updated_at();
