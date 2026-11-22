import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "../supabase/env";
import { getServerClient } from "../supabase/server";

export type AdminSession = {
  supabase: Awaited<ReturnType<typeof getServerClient>>;
  userId: string;
  email: string;
};

/**
 * The signed-in admin, or a redirect to the login page.
 * Checks the session with Supabase Auth (not just the cookie) AND that the user is listed
 * in admin_users. Every admin page and every Server Action calls this.
 * The database enforces the same rule again (is_admin() in every policy).
 */
export const requireAdmin = cache(async (): Promise<AdminSession> => {
  if (!isSupabaseConfigured()) redirect("/admin/login?reason=setup");
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?reason=not-admin");

  return { supabase, userId: user.id, email: user.email ?? "" };
});
