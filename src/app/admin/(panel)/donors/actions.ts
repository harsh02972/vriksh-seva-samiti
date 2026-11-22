"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import {
  dbFailure,
  formObject,
  success,
  zBool,
  zDate,
  zDecimal,
  zInt,
  zodErrors,
  zOptionalDecimal,
  zOptionalText,
  zText,
  type FormState,
} from "@/lib/admin/forms";
import { publish } from "@/lib/admin/publish";

const donorTypes = z.enum(["school", "college", "individual", "organisation"], { error: "प्रकार निवडा · Pick a type" });
const wasteTypes = z.enum(["paper", "cardboard", "books", "plastic", "metal", "mixed", "other"]);

const donorSchema = z.object({
  name: zText(200, "नाव"),
  type: donorTypes,
  area: zOptionalText(200),
  search_alias: zOptionalText(200),
  show_on_leaderboard: zBool(),
  notes: zOptionalText(2000),
});

export async function createDonor(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = donorSchema.safeParse(formObject(fd));
  if (!parsed.success) return zodErrors(parsed.error);
  const { data, error } = await supabase.from("donors").insert(parsed.data).select("id").single();
  if (error) return dbFailure(error);
  publish();
  redirect(`/admin/donors/${data.id}?created=1`);
}

export async function updateDonor(id: string, _: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = donorSchema.safeParse(formObject(fd));
  if (!parsed.success) return zodErrors(parsed.error);
  const { error } = await supabase.from("donors").update(parsed.data).eq("id", id);
  if (error) return dbFailure(error);
  publish();
  return success();
}

export async function deleteDonor(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("donors").delete().eq("id", id);
  publish();
  redirect("/admin/donors?deleted=1");
}

export async function setLeaderboardVisibility(id: string, visible: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("donors").update({ show_on_leaderboard: visible }).eq("id", id);
  publish();
}

/* ---------------- Contributions ---------------- */

const contributionSchema = z
  .object({
    donor_id: z.string().optional(),
    new_donor_name: zOptionalText(200),
    new_donor_type: donorTypes.optional(),
    contributed_on: zDate(),
    waste_type: wasteTypes,
    kg: zDecimal(0, 1_000_000),
    amount_rs: zOptionalDecimal(0, 100_000_000),
    trees_planted: zInt(0, 1_000_000),
    notes: zOptionalText(2000),
  })
  .refine((v) => Boolean(v.donor_id) || Boolean(v.new_donor_name), {
    path: ["donor_id"],
    message: "देणगीदार निवडा किंवा नवीन नाव लिहा · Pick a donor or type a new name",
  });

async function resolveDonor(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  v: z.infer<typeof contributionSchema>,
) {
  if (v.donor_id) return { id: v.donor_id };
  const { data, error } = await supabase
    .from("donors")
    .insert({ name: v.new_donor_name, type: v.new_donor_type ?? "individual", show_on_leaderboard: true })
    .select("id")
    .single();
  return error ? { error } : { id: data.id as string };
}

const contributionRow = (v: z.infer<typeof contributionSchema>, donorId: string) => ({
  donor_id: donorId,
  contributed_on: v.contributed_on,
  waste_type: v.waste_type,
  kg: v.kg,
  amount_rs: v.amount_rs,
  trees_planted: v.trees_planted,
  notes: v.notes,
});

export async function createContribution(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = contributionSchema.safeParse(formObject(fd));
  if (!parsed.success) return zodErrors(parsed.error);
  const donor = await resolveDonor(supabase, parsed.data);
  if ("error" in donor) return dbFailure(donor.error ?? null);
  const { error } = await supabase.from("contributions").insert(contributionRow(parsed.data, donor.id));
  if (error) return dbFailure(error);
  publish();
  return success("नोंद जतन झाली — लीडरबोर्ड अपडेट झाला · Saved. Donor trees and leaderboard updated.");
}

export async function updateContribution(id: string, _: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = contributionSchema.safeParse(formObject(fd));
  if (!parsed.success) return zodErrors(parsed.error);
  const donor = await resolveDonor(supabase, parsed.data);
  if ("error" in donor) return dbFailure(donor.error ?? null);
  const { error } = await supabase.from("contributions").update(contributionRow(parsed.data, donor.id)).eq("id", id);
  if (error) return dbFailure(error);
  publish();
  return success();
}

export async function deleteContribution(id: string, returnTo: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("contributions").delete().eq("id", id);
  publish();
  redirect(returnTo.startsWith("/admin") ? returnTo : "/admin/contributions");
}
