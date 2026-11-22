"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { failure, type FormState } from "@/lib/admin/forms";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getServerClient } from "@/lib/supabase/server";

const credentials = z.object({
  email: z.email("ईमेल तपासा · Check the email"),
  password: z.string().min(1, "पासवर्ड भरा · Enter the password"),
});

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return failure("Supabase is not set up yet (see README → Phase 2 setup).");
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return failure("ईमेल व पासवर्ड भरा · Enter email and password.");

  const supabase = await getServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    // Same message for wrong email or wrong password (do not reveal which).
    return failure("ईमेल किंवा पासवर्ड चुकीचा · Wrong email or password.");
  }
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return failure("हे खाते admin नाही · This account is not an admin.");
  }
  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await getServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
