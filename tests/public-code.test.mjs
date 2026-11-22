// Static checks that the PUBLIC website code and its built pages never touch money amounts.
// The database already refuses amounts to visitors (see security.test.mjs); this is a second
// guard so nobody accidentally reads amounts with an admin session on a public page.
//
//   node --test tests/public-code.test.mjs     (build first for the output check: npm run build)

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const rel = (p) => relative(root, p).split(sep).join("/");
const isAdmin = (p) => /\/admin\//.test(`/${rel(p)}`);

const publicSources = walk(join(root, "src"))
  .filter((p) => /\.(ts|tsx)$/.test(p))
  .filter((p) => !isAdmin(p));

test("public source files never mention the private amount column or the contributions table", () => {
  assert.ok(publicSources.length > 20, "expected to scan the public source files");
  const offenders = [];
  for (const file of publicSources) {
    const code = readFileSync(file, "utf8");
    if (/amount_rs|["'`]contributions["'`]|₹/.test(code)) offenders.push(rel(file));
  }
  assert.deepEqual(offenders, [], `these public files reference amounts: ${offenders.join(", ")}`);
});

test("public source files never import admin code or the cookie (signed-in) Supabase client", () => {
  const offenders = [];
  for (const file of publicSources) {
    const code = readFileSync(file, "utf8");
    if (/from\s+["'](@\/lib\/admin|@\/app\/admin|@\/components\/admin|@\/lib\/supabase\/server)/.test(code)) offenders.push(rel(file));
  }
  // proxy.ts is the only non-admin file allowed to create a cookie client (it guards /admin).
  assert.deepEqual(offenders.filter((f) => f !== "src/proxy.ts"), []);
});

test("the public content layer reads only the public_* views", () => {
  const code = readFileSync(join(root, "src/lib/content.ts"), "utf8");
  const tables = [...code.matchAll(/\.from\(\s*["'`]([a-z_]+)["'`]/g)].map((m) => m[1]);
  assert.ok(tables.length > 0);
  for (const t of tables) assert.match(t, /^public_/, `content.ts reads "${t}" directly; use a public_* view`);
});

test("built public pages contain no amounts (run after npm run build)", (t) => {
  const appDir = join(root, ".next/server/app");
  if (!existsSync(appDir)) return t.skip("no build output yet");
  const files = walk(appDir).filter((p) => /\.(html|rsc|body)$/.test(p) && !/[\\/]admin([\\/.]|$)/.test(p));
  assert.ok(files.length > 5, "expected prerendered public pages");
  const offenders = files.filter((f) => /amount_rs|₹/.test(readFileSync(f, "utf8"))).map(rel);
  assert.deepEqual(offenders, []);
});
