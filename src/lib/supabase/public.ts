import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * Client for PUBLIC pages. No cookies, no session: it always acts as an anonymous
 * visitor, so it can only read the public_* views (see supabase/migrations/0006).
 * Safe to use inside "use cache" functions.
 */
let client: SupabaseClient | null = null;

const TIMEOUT_MS = 8000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS) });
}

export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  client ??= createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: fetchWithTimeout },
  });
  return client;
}
