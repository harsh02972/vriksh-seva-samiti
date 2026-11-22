/**
 * SECURITY TESTS — run with `npm run test:security`.
 *
 * Applies the real migration files (supabase/migrations/*.sql) to an in-memory Postgres
 * that behaves like Supabase, then proves:
 *   1. An anonymous visitor cannot read money amounts in any way.
 *   2. An anonymous visitor cannot write anything or upload files.
 *   3. A signed-in user who is NOT an admin gets nothing extra.
 *   4. Admins can do their work, and the automatic totals work.
 */
import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { as, createDatabase, SECRET_AMOUNTS } from "./helpers/supabase-sim.mjs";

let db;
before(async () => {
  db = await createDatabase();
});
after(async () => {
  await db?.close();
});

const PUBLIC_VIEWS = [
  "public_leaderboard",
  "public_plantings",
  "public_gallery",
  "public_featured_video",
  "public_campaign",
  "public_site_stats",
  "public_site_content",
];

async function rows(who, sql, params) {
  return as(db, who, async (tx) => (await tx.query(sql, params)).rows);
}

async function expectDenied(who, sql, pattern = /permission denied|row-level security/) {
  await assert.rejects(() => rows(who, sql), pattern, `expected "${sql}" to be denied for ${who}`);
}

function containsSecretAmount(value) {
  const text = JSON.stringify(value);
  return SECRET_AMOUNTS.some((n) => text.includes(String(n)) || text.includes(n.toFixed(0)));
}

describe("anonymous visitor (the public website) — money is never readable", () => {
  test("cannot read the contributions table at all", async () => {
    await expectDenied("anon", "select * from public.contributions");
    await expectDenied("anon", "select amount_rs from public.contributions");
    await expectDenied("anon", "select sum(amount_rs) from public.contributions");
    await expectDenied("anon", "select count(*) from public.contributions");
  });

  test("cannot read private donor columns (notes, area) or whole donor rows", async () => {
    await expectDenied("anon", "select * from public.donors");
    await expectDenied("anon", "select notes from public.donors");
    await expectDenied("anon", "select area from public.donors");
  });

  test("cannot read admin-only tables", async () => {
    for (const t of ["admin_users", "site_stats", "planting_updates"]) {
      await expectDenied("anon", `select * from public.${t}`);
    }
  });

  test("no column anywhere that anon can read is an amount column", async () => {
    const found = await rows(
      "anon",
      `select table_name, column_name
         from information_schema.columns
        where table_schema = 'public'
          and column_name ~* '(amount|rupee|money|_rs$)'
          and has_column_privilege('anon', format('public.%I', table_name), column_name, 'SELECT')`,
    );
    assert.deepEqual(found, []);
  });

  test("every public view works, has no amount column and never contains an amount value", async () => {
    for (const view of PUBLIC_VIEWS) {
      const result = await rows("anon", `select * from public.${view}`);
      for (const row of result) {
        for (const key of Object.keys(row)) assert.doesNotMatch(key, /amount|rupee|_rs$/i, `${view}.${key}`);
      }
      assert.equal(containsSecretAmount(result), false, `${view} leaked an amount`);
    }
  });

  test("no function callable by anon returns or exposes amounts", async () => {
    const fns = await rows(
      "anon",
      `select p.proname, pg_get_function_result(p.oid) as result
         from pg_proc p join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'EXECUTE')`,
    );
    const names = fns.map((f) => f.proname).sort();
    assert.deepEqual(names, ["campaign_trees", "site_stats_public"], "unexpected anon-callable functions");
    for (const f of fns) assert.doesNotMatch(f.result, /amount/i, f.proname);
    await expectDenied("anon", "select * from public.admin_dashboard_totals()");
    await expectDenied("anon", "select public.is_admin()");
    const stats = await rows("anon", "select * from public.site_stats_public()");
    assert.equal(containsSecretAmount(stats), false);
  });

  test("hidden donors and unpublished items stay hidden", async () => {
    const board = await rows("anon", "select name from public.public_leaderboard order by trees_planted desc");
    assert.deepEqual(board.map((r) => r.name), ["आदर्श विद्यालय", "राहुल पाटील"]);
    const plantings = await rows("anon", "select title_mr, donor_names from public.public_plantings");
    assert.equal(plantings.length, 1);
    assert.deepEqual(plantings[0].donor_names, ["आदर्श विद्यालय"], "hidden donor name leaked via planting");
    const gallery = await rows("anon", "select caption_mr from public.public_gallery");
    assert.deepEqual(gallery.map((g) => g.caption_mr), ["रोपांना पाणी"]);
    const campaign = await rows("anon", "select title_en from public.public_campaign");
    assert.deepEqual(campaign.map((c) => c.title_en), ["Current Campaign"]);
  });

  test("cannot write anything", async () => {
    await expectDenied("anon", "insert into public.donors (name, type) values ('x', 'school')");
    await expectDenied("anon", "update public.donors set trees_planted = 9999");
    await expectDenied("anon", "delete from public.plantings");
    await expectDenied("anon", "insert into public.contributions (donor_id, kg) select id, 1 from public.public_leaderboard limit 1");
    await expectDenied("anon", "update public.site_content set value = '{}'");
    await expectDenied("anon", "insert into public.admin_users (user_id) values (gen_random_uuid())");
  });

  test("cannot upload, replace or delete files", async () => {
    await expectDenied("anon", "insert into storage.objects (bucket_id, name) values ('public-media', 'gallery/evil.webp')");
    const visible = await rows("anon", "select * from storage.objects");
    assert.deepEqual(visible, []);
  });
});

describe("signed-in user who is NOT an admin", () => {
  test("sees no contributions, no amounts, no admin totals", async () => {
    assert.deepEqual(await rows("user", "select * from public.contributions"), []);
    assert.deepEqual(await rows("user", "select * from public.admin_dashboard_totals()"), []);
    assert.deepEqual(await rows("user", "select * from public.donors"), []);
    assert.equal(await rows("user", "select public.is_admin() as ok").then((r) => r[0].ok), false);
  });

  test("cannot write or upload", async () => {
    await expectDenied("user", "insert into public.donors (name, type) values ('x', 'school')");
    await expectDenied("user", "insert into storage.objects (bucket_id, name) values ('public-media', 'x.webp')");
    await expectDenied("user", "insert into public.admin_users (user_id) values (auth.uid())");
  });
});

describe("admin", () => {
  test("can read amounts and the private dashboard total", async () => {
    const [totals] = await rows("admin", "select * from public.admin_dashboard_totals()");
    assert.equal(Number(totals.amount_rs), 12345.67 + 9876.54 + 5555.55);
    assert.equal(totals.donors, 3);
  });

  test("adding a contribution updates the donor's trees and the leaderboard automatically", async () => {
    const donor = "10000000-0000-4000-8000-000000000002";
    await rows("admin", `insert into public.contributions (donor_id, kg, amount_rs, trees_planted) values ('${donor}', 100, 2000, 50)`);
    const board = await rows("anon", "select name, trees_planted from public.public_leaderboard order by trees_planted desc");
    assert.deepEqual(board[0], { name: "राहुल पाटील", trees_planted: 54 });
    // Editing and deleting also keep the totals right.
    await rows("admin", `update public.contributions set trees_planted = 10 where donor_id = '${donor}' and kg = 100`);
    await rows("admin", `delete from public.contributions where donor_id = '${donor}' and kg = 35`);
    const [d] = await rows("admin", `select trees_planted, waste_kg from public.donors where id = '${donor}'`);
    assert.deepEqual({ trees: d.trees_planted, kg: Number(d.waste_kg) }, { trees: 10, kg: 100 });
  });

  test("site numbers are calculated automatically, and a manual override wins", async () => {
    const [auto] = await rows("anon", "select * from public.public_site_stats");
    assert.equal(auto.trees_planted, 120); // published plantings only
    assert.equal(auto.has_data, true);
    await rows("admin", "update public.site_stats set trees_planted_override = 2500 where id = 1");
    const [manual] = await rows("anon", "select trees_planted, next_milestone from public.public_site_stats");
    assert.deepEqual(manual, { trees_planted: 2500, next_milestone: 3000 });
    await rows("admin", "update public.site_stats set trees_planted_override = null where id = 1");
  });

  test("a survival update becomes the planting's current numbers", async () => {
    const id = "20000000-0000-4000-8000-000000000001";
    await rows("admin", `insert into public.planting_updates (planting_id, checked_on, trees_surviving, status) values ('${id}', '2026-11-01', 111, 'healthy')`);
    const [p] = await rows("anon", `select trees_surviving, last_checked_on from public.public_plantings where id = '${id}'`);
    assert.equal(p.trees_surviving, 111);
  });

  test("campaign progress counts plantings between its dates", async () => {
    const [c] = await rows("anon", "select trees_planted from public.public_campaign");
    assert.equal(c.trees_planted, 120);
  });

  test("only one campaign can be active", async () => {
    await assert.rejects(() => rows("admin", "update public.campaigns set active = true"), /duplicate key|unique/);
  });

  test("can upload to the public-media bucket only", async () => {
    await rows("admin", "insert into storage.objects (bucket_id, name) values ('public-media', 'gallery/new.webp')");
    await rows("admin", "insert into storage.buckets (id, name) values ('other', 'other') on conflict do nothing").catch(() => {});
    await expectDenied("admin", "insert into storage.objects (bucket_id, name) values ('other', 'x.webp')");
  });

  test("the video row enforces the 15 MB limit", async () => {
    await assert.rejects(() => rows("admin", "update public.featured_video set video_bytes = 16000000 where id = 1"), /check constraint/);
  });
});
