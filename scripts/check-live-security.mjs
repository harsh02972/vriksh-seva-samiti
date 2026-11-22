#!/usr/bin/env node
/**
 * LIVE security check against your real Supabase project, as an anonymous visitor.
 * Uses ONLY the publishable key (the same key every website visitor has).
 *
 *   npm run test:live
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from .env.local.
 * Exits with code 1 if anything private is reachable.
 */
import { existsSync, readFileSync } from "node:fs";

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local first.");
  process.exit(2);
}

const headers = { apikey: key, "Content-Type": "application/json" };
const AMOUNT = /amount|rupee/i;
let failures = 0;
const ok = (msg) => console.log(`  ✔ ${msg}`);
const fail = (msg) => {
  failures++;
  console.log(`  ✖ ${msg}`);
};

async function get(path) {
  const res = await fetch(`${url}${path}`, { headers });
  let body = null;
  try {
    body = await res.json();
  } catch {}
  return { status: res.status, body };
}

const denied = (r) => r.status >= 400 || (Array.isArray(r.body) && r.body.length === 0);

console.log(`Checking ${url} as an anonymous visitor…\n`);

console.log("Private data must be blocked:");
for (const path of [
  "/rest/v1/contributions?select=amount_rs",
  "/rest/v1/contributions?select=*",
  "/rest/v1/donors?select=*",
  "/rest/v1/donors?select=notes",
  "/rest/v1/admin_users?select=*",
  "/rest/v1/site_stats?select=*",
  "/rest/v1/planting_updates?select=*",
]) {
  const r = await get(path);
  denied(r) ? ok(`${path} → blocked (${r.status})`) : fail(`${path} → returned data! ${JSON.stringify(r.body).slice(0, 200)}`);
}

{
  const res = await fetch(`${url}/rest/v1/rpc/admin_dashboard_totals`, { method: "POST", headers, body: "{}" });
  const body = await res.text();
  res.status >= 400 || body.trim() === "[]" ? ok(`rpc/admin_dashboard_totals → blocked (${res.status})`) : fail(`rpc/admin_dashboard_totals → ${body.slice(0, 200)}`);
}

console.log("\nPublic views must work and contain no amounts:");
for (const view of [
  "public_leaderboard",
  "public_plantings",
  "public_gallery",
  "public_featured_video",
  "public_campaign",
  "public_site_stats",
  "public_site_content",
]) {
  const r = await get(`/rest/v1/${view}?select=*`);
  if (r.status !== 200) {
    fail(`${view} → status ${r.status} (did you run all migrations?) ${JSON.stringify(r.body).slice(0, 160)}`);
    continue;
  }
  const keys = new Set((r.body ?? []).flatMap((row) => Object.keys(row)));
  const bad = [...keys].filter((k) => AMOUNT.test(k));
  bad.length ? fail(`${view} has amount columns: ${bad.join(", ")}`) : ok(`${view} → ${r.body.length} rows, no amount columns`);
}

console.log("\nAPI description must not mention amounts:");
{
  const res = await fetch(`${url}/rest/v1/`, { headers });
  const text = await res.text();
  if (res.status >= 400) ok(`OpenAPI description not available to anon (${res.status})`);
  else /amount_rs/.test(text) ? fail("OpenAPI description lists amount_rs") : ok("OpenAPI description has no amount_rs");
}
{
  const res = await fetch(`${url}/graphql/v1`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: "{ __schema { types { name fields { name } } } }" }),
  });
  const text = await res.text();
  /amount_?rs/i.test(text) ? fail("GraphQL schema exposes an amount field") : ok(`GraphQL schema has no amount field (${res.status})`);
}

console.log("\nUploads must be blocked:");
{
  const res = await fetch(`${url}/storage/v1/object/public-media/security-check-${Date.now()}.webp`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "image/webp" },
    body: new Uint8Array([1, 2, 3]),
  });
  res.status >= 400 ? ok(`anonymous upload → blocked (${res.status})`) : fail(`anonymous upload succeeded (${res.status}) — check 0007_storage.sql`);
}

console.log(failures ? `\n✖ ${failures} problem(s) found.` : "\n✔ All live checks passed. Amounts are not readable by the public.");
process.exit(failures ? 1 : 0);
