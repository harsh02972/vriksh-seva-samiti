"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, type AdminSession } from "@/lib/admin/auth";
import {
  dbFailure,
  failure,
  formObject,
  success,
  zBool,
  zDate,
  zInt,
  zodErrors,
  zOptionalDecimal,
  zOptionalInt,
  zOptionalText,
  zText,
  type FormState,
} from "@/lib/admin/forms";
import { imageList, removeFiles } from "@/lib/admin/media";
import { publish } from "@/lib/admin/publish";

const statuses = z.enum(["healthy", "needs_care", "replanting", "established"]);

const plantingSchema = z
  .object({
    title_mr: zText(200, "शीर्षक"),
    place_mr: zText(200, "ठिकाण"),
    latitude: zOptionalDecimal(-90, 90),
    longitude: zOptionalDecimal(-180, 180),
    planted_on: zDate(),
    trees_planted: zInt(0, 1_000_000),
    trees_surviving: zOptionalInt(0, 1_000_000),
    survival_status: statuses,
    species: zOptionalText(1000),
    partner_mr: zOptionalText(200),
    care_note_mr: zOptionalText(1000),
    published: zBool(),
    photos: imageList(20),
  })
  .refine((v) => v.trees_surviving == null || v.trees_surviving <= v.trees_planted, {
    path: ["trees_surviving"],
    message: "जगलेली झाडे लावलेल्यांपेक्षा जास्त असू शकत नाहीत · Cannot be more than trees planted",
  })
  .refine((v) => (v.latitude == null) === (v.longitude == null), {
    path: ["latitude"],
    message: "दोन्ही भरा किंवा दोन्ही रिकामे ठेवा · Fill both latitude and longitude, or neither",
  });

function parse(fd: FormData) {
  return plantingSchema.safeParse({ ...formObject(fd), photos: fd.get("photos") });
}

const toRow = (v: z.infer<typeof plantingSchema>) => ({
  title_mr: v.title_mr,
  place_mr: v.place_mr,
  latitude: v.latitude,
  longitude: v.longitude,
  planted_on: v.planted_on,
  trees_planted: v.trees_planted,
  trees_surviving: v.trees_surviving,
  survival_status: v.survival_status,
  species_mr: (v.species ?? "")
    .split(/[,\n،]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30),
  partner_mr: v.partner_mr,
  care_note_mr: v.care_note_mr,
  published: v.published,
});

async function saveChildren(supabase: AdminSession["supabase"], plantingId: string, v: z.infer<typeof plantingSchema>, donorIds: string[]) {
  const photoRows = v.photos.map((p, i) => ({
    planting_id: plantingId,
    storage_path: p.path,
    width: p.width,
    height: p.height,
    alt_mr: p.alt || v.title_mr,
    sort_order: i,
  }));
  const del = await supabase.from("planting_photos").delete().eq("planting_id", plantingId);
  if (del.error) return del.error;
  if (photoRows.length) {
    const ins = await supabase.from("planting_photos").insert(photoRows);
    if (ins.error) return ins.error;
  }
  const delLinks = await supabase.from("planting_donors").delete().eq("planting_id", plantingId);
  if (delLinks.error) return delLinks.error;
  const ids = [...new Set(donorIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id)))];
  if (ids.length) {
    const insLinks = await supabase.from("planting_donors").insert(ids.map((donor_id) => ({ planting_id: plantingId, donor_id })));
    if (insLinks.error) return insLinks.error;
  }
  return null;
}

export async function createPlanting(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  if (fd.get("__uploading")) return failure("फोटो अपलोड पूर्ण होऊ द्या · Wait for the photo uploads to finish.");
  const parsed = parse(fd);
  if (!parsed.success) return zodErrors(parsed.error);
  const { data, error } = await supabase.from("plantings").insert(toRow(parsed.data)).select("id").single();
  if (error) return dbFailure(error);
  const childError = await saveChildren(supabase, data.id, parsed.data, fd.getAll("donor_ids").map(String));
  if (childError) return dbFailure(childError);
  publish();
  redirect(`/admin/plantings/${data.id}?created=1`);
}

export async function updatePlanting(id: string, _: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  if (fd.get("__uploading")) return failure("फोटो अपलोड पूर्ण होऊ द्या · Wait for the photo uploads to finish.");
  const parsed = parse(fd);
  if (!parsed.success) return zodErrors(parsed.error);
  const { data: before } = await supabase.from("planting_photos").select("storage_path").eq("planting_id", id);
  const { error } = await supabase.from("plantings").update(toRow(parsed.data)).eq("id", id);
  if (error) return dbFailure(error);
  const childError = await saveChildren(supabase, id, parsed.data, fd.getAll("donor_ids").map(String));
  if (childError) return dbFailure(childError);
  const keep = new Set(parsed.data.photos.map((p) => p.path));
  await removeFiles(supabase, (before ?? []).map((r) => r.storage_path).filter((p) => !keep.has(p)));
  publish();
  return success();
}

export async function deletePlanting(id: string) {
  const { supabase } = await requireAdmin();
  const { data: photos } = await supabase.from("planting_photos").select("storage_path").eq("planting_id", id);
  const { error } = await supabase.from("plantings").delete().eq("id", id);
  if (!error) await removeFiles(supabase, (photos ?? []).map((p) => p.storage_path));
  publish();
  redirect("/admin/plantings?deleted=1");
}

/* ---------------- Survival updates ---------------- */

const updateSchema = z.object({
  checked_on: zDate(),
  trees_surviving: zInt(0, 1_000_000),
  status: statuses,
  note_mr: zOptionalText(1000),
});

export async function addSurvivalUpdate(plantingId: string, _: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = updateSchema.safeParse(formObject(fd));
  if (!parsed.success) return zodErrors(parsed.error);
  const { data: planting } = await supabase.from("plantings").select("trees_planted").eq("id", plantingId).maybeSingle();
  if (planting && parsed.data.trees_surviving > planting.trees_planted)
    return failure("लावलेल्या झाडांपेक्षा जास्त · More than the trees planted.", { trees_surviving: `Max ${planting.trees_planted}` });
  const { error } = await supabase.from("planting_updates").insert({ planting_id: plantingId, ...parsed.data });
  if (error) return dbFailure(error);
  publish();
  return success("पाहणी नोंदवली — वेबसाइटवरील आकडे अपडेट झाले · Check saved. The website now shows these numbers.");
}

export async function deleteSurvivalUpdate(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("planting_updates").delete().eq("id", id);
  publish();
}
