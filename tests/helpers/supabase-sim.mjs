/**
 * A tiny stand-in for a Supabase database, for tests.
 *
 * Runs a real Postgres (PGlite, in memory) with the same roles Supabase uses
 * (anon = website visitor, authenticated = signed-in user), the same dangerous
 * default ("grant everything on new tables to anon/authenticated"), and minimal
 * auth/storage schemas. Then it applies OUR migration files, unchanged, in order.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const MIGRATIONS_DIR = join(import.meta.dirname, "..", "..", "supabase", "migrations");

const SUPABASE_BOOTSTRAP = /* sql */ `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  -- Supabase's default: anon/authenticated get ALL privileges on new public objects.
  -- Our migrations must undo this; the tests prove they do.
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

  create schema auth;
  grant usage on schema auth to anon, authenticated, service_role;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant execute on function auth.uid() to anon, authenticated, service_role;

  create schema storage;
  grant usage on schema storage to anon, authenticated, service_role;
  create table storage.buckets (
    id text primary key, name text not null, public boolean default false,
    file_size_limit bigint, allowed_mime_types text[]
  );
  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets (id),
    name text not null,
    owner uuid
  );
  alter table storage.objects enable row level security;
  -- Supabase grants table access on storage.objects and relies on RLS policies.
  grant select, insert, update, delete on storage.objects to anon, authenticated;
  grant select on storage.buckets to anon, authenticated;
`;

export const ADMIN_ID = "00000000-0000-4000-8000-00000000a001";
export const NON_ADMIN_ID = "00000000-0000-4000-8000-00000000b002";

/** Distinctive amounts so we can search every public result for them. */
export const SECRET_AMOUNTS = [12345.67, 9876.54];

export function migrationFiles() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d{4}_.+\.sql$/.test(f))
    .sort();
}

export async function createDatabase({ seed = true } = {}) {
  const db = new PGlite();
  await db.exec(SUPABASE_BOOTSTRAP);
  for (const file of migrationFiles()) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    try {
      await db.exec(sql);
    } catch (error) {
      throw new Error(`Migration ${file} failed: ${error.message}`);
    }
  }
  // Running every migration a second time must also work (they are re-runnable).
  for (const file of migrationFiles()) {
    await db.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
  }
  if (seed) await seedData(db);
  return db;
}

async function seedData(db) {
  await db.exec(/* sql */ `
    insert into auth.users (id, email) values
      ('${ADMIN_ID}', 'admin@example.org'),
      ('${NON_ADMIN_ID}', 'someone@example.org');
    insert into public.admin_users (user_id, email) values ('${ADMIN_ID}', 'admin@example.org');

    insert into public.donors (id, name, type, area, notes, show_on_leaderboard, search_alias) values
      ('10000000-0000-4000-8000-000000000001', 'आदर्श विद्यालय', 'school', 'सिंदी', 'principal phone 98xxxx', true, 'Adarsh'),
      ('10000000-0000-4000-8000-000000000002', 'राहुल पाटील', 'individual', 'वर्धा', 'private note', true, 'Rahul Patil'),
      ('10000000-0000-4000-8000-000000000003', 'Hidden Donor', 'organisation', 'वर्धा', 'wants privacy', false, null);

    insert into public.contributions (donor_id, contributed_on, waste_type, kg, amount_rs, trees_planted, notes) values
      ('10000000-0000-4000-8000-000000000001', '2026-10-01', 'paper', 420.5, ${SECRET_AMOUNTS[0]}, 30, 'bill #77'),
      ('10000000-0000-4000-8000-000000000002', '2026-10-05', 'cardboard', 35, ${SECRET_AMOUNTS[1]}, 4, null),
      ('10000000-0000-4000-8000-000000000003', '2026-10-09', 'metal', 80, 5555.55, 9, null);

    insert into public.plantings (id, title_mr, place_mr, planted_on, trees_planted, species_mr, published) values
      ('20000000-0000-4000-8000-000000000001', 'टेकडीवर वृक्षारोपण', 'पवित्रधाम टेकडी', '2026-07-07', 120, '{कडुनिंब,वड}', true),
      ('20000000-0000-4000-8000-000000000002', 'Draft planting', 'Somewhere', '2026-08-01', 50, '{}', false);
    insert into public.planting_photos (planting_id, storage_path, width, height, alt_mr) values
      ('20000000-0000-4000-8000-000000000001', 'plantings/a.webp', 1600, 1200, 'रोपे');
    insert into public.planting_donors (planting_id, donor_id) values
      ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001'),
      ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003');

    insert into public.gallery_photos (storage_path, width, height, caption_mr, place_mr, taken_on, show_on_home, published) values
      ('gallery/1.webp', 1600, 1200, 'रोपांना पाणी', 'वर्धा', '2026-10-12', true, true),
      ('gallery/2.webp', 1600, 1200, 'Hidden photo', 'वर्धा', '2026-10-13', false, false);

    insert into public.featured_video (id, video_path, video_bytes, duration_sec, poster_path, poster_width, poster_height, caption_mr)
      values (1, 'video/featured.mp4', 9000000, 22, 'video/poster.webp', 1600, 900, 'आमचे काम');

    insert into public.campaigns (title_en, year_label_mr, start_date, end_date, tree_target, active) values
      ('Current Campaign', 'वर्ष २ रे', '2026-06-06', '2027-02-19', 1000, true),
      ('Old Campaign', 'वर्ष १ ले', '2025-06-06', '2026-02-19', 500, false);

    insert into public.site_content (key, value) values
      ('home', '{"heroIntro": "नमस्कार"}'),
      ('contact_details', '{"email": "real@example.org"}');
  `);
}

/** Run `fn` as a website visitor (anon), a signed-in non-admin, or an admin. */
export async function as(db, who, fn) {
  const role = who === "anon" ? "anon" : "authenticated";
  const sub = who === "admin" ? ADMIN_ID : who === "user" ? NON_ADMIN_ID : "";
  return db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [sub]);
    await tx.exec(`set local role ${role}`);
    return fn(tx);
  });
}
