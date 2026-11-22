#!/usr/bin/env node
/**
 * Create an admin account (or make an existing account an admin).
 *
 *   npm run admin:create -- you@example.com
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.
 * Run it on your own computer only. The secret key never goes to Netlify.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const email = (process.argv[2] ?? "").trim().toLowerCase();

if (!url || !secret) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.");
  process.exit(2);
}
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("Usage: npm run admin:create -- you@example.com");
  process.exit(2);
}

const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUser(address) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === address);
    if (hit || data.users.length < 200) return hit ?? null;
  }
  return null;
}

let user = await findUser(email);
let password = null;

if (!user) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const typed = (await rl.question("Choose a password (min 10 characters), or press Enter to generate one: ")).trim();
  rl.close();
  password = typed || randomBytes(12).toString("base64url");
  if (password.length < 10) {
    console.error("Password too short (min 10 characters).");
    process.exit(2);
  }
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    console.error("Could not create the user:", error.message);
    process.exit(1);
  }
  user = data.user;
  console.log(`Created account ${email}.`);
} else {
  console.log(`Account ${email} already exists — making it an admin.`);
}

const { error: insertError } = await supabase
  .from("admin_users")
  .upsert({ user_id: user.id, email }, { onConflict: "user_id" });
if (insertError) {
  console.error("Could not add to admin_users:", insertError.message, "\nDid you run all SQL migrations?");
  process.exit(1);
}

console.log(`\n✔ ${email} is an admin. Sign in at /admin/login`);
if (password && !process.argv.includes("--quiet")) console.log(`  Password: ${password}\n  (Store it in a password manager.)`);
