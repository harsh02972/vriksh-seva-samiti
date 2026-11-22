"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { dbFailure, formObject, success, zBool, zDate, zInt, zodErrors, zOptionalInt, zOptionalText, zText, type FormState } from "@/lib/admin/forms";
import { publish } from "@/lib/admin/publish";

const schema = z
  .object({
    title_en: zText(120, "Title"),
    year_label_mr: zOptionalText(60),
    description_mr: zOptionalText(1000),
    start_date: zDate(),
    end_date: zDate(),
    tree_target: zInt(0, 10_000_000),
    trees_planted_override: zOptionalInt(0, 10_000_000),
    active: zBool(),
  })
  .refine((v) => v.end_date >= v.start_date, { path: ["end_date"], message: "शेवटची तारीख सुरुवातीनंतर हवी · End date must be after the start date" });

const toRow = (v: z.infer<typeof schema>) => ({ ...v, year_label_mr: v.year_label_mr ?? "", description_mr: v.description_mr ?? "" });

/** Only one campaign can be active: switch the others off first. */
async function deactivateOthers(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], keepId?: string) {
  let q = supabase.from("campaigns").update({ active: false }).eq("active", true);
  if (keepId) q = q.neq("id", keepId);
  return q;
}

export async function createCampaign(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = schema.safeParse(formObject(fd));
  if (!parsed.success) return zodErrors(parsed.error);
  if (parsed.data.active) await deactivateOthers(supabase);
  const { data, error } = await supabase.from("campaigns").insert(toRow(parsed.data)).select("id").single();
  if (error) return dbFailure(error);
  publish();
  redirect(`/admin/campaigns/${data.id}?created=1`);
}

export async function updateCampaign(id: string, _: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = schema.safeParse(formObject(fd));
  if (!parsed.success) return zodErrors(parsed.error);
  if (parsed.data.active) await deactivateOthers(supabase, id);
  const { error } = await supabase.from("campaigns").update(toRow(parsed.data)).eq("id", id);
  if (error) return dbFailure(error);
  publish();
  return success();
}

export async function setCampaignActive(id: string, active: boolean) {
  const { supabase } = await requireAdmin();
  if (active) await deactivateOthers(supabase, id);
  await supabase.from("campaigns").update({ active }).eq("id", id);
  publish();
}

export async function deleteCampaign(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("campaigns").delete().eq("id", id);
  publish();
  redirect("/admin/campaigns?deleted=1");
}
