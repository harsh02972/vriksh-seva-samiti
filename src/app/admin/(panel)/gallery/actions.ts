"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import {
  dbFailure,
  failure,
  formObject,
  success,
  zBool,
  zodErrors,
  zOptionalDate,
  zOptionalText,
  zText,
  type FormState,
} from "@/lib/admin/forms";
import { imageList, removeFiles } from "@/lib/admin/media";
import { publish } from "@/lib/admin/publish";

const categories = z.enum(["planting", "care", "collection", "schools"]);

const detailsSchema = z.object({
  caption_mr: zText(300, "माहिती"),
  place_mr: zOptionalText(200),
  taken_on: zOptionalDate(),
  category: categories,
  show_on_home: zBool(),
  published: zBool(),
});

export async function addGalleryPhotos(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  if (fd.get("__uploading")) return failure("फोटो अपलोड पूर्ण होऊ द्या · Wait for the uploads to finish.");
  const details = detailsSchema.safeParse(formObject(fd));
  const photos = imageList(40).safeParse(fd.get("photos"));
  if (!details.success) return zodErrors(details.error);
  if (!photos.success) return zodErrors(photos.error);
  if (!photos.data.length) return failure("आधी फोटो निवडा · Choose at least one photo.", { photos: "Required" });

  const { data: first } = await supabase.from("gallery_photos").select("sort_order").order("sort_order").limit(1).maybeSingle();
  const start = (first?.sort_order ?? 0) - photos.data.length * 10;
  const rows = photos.data.map((p, i) => ({
    storage_path: p.path,
    width: p.width,
    height: p.height,
    ...details.data,
    place_mr: details.data.place_mr ?? "",
    sort_order: start + i * 10,
  }));
  const { error } = await supabase.from("gallery_photos").insert(rows);
  if (error) return dbFailure(error);
  publish();
  return success(`${rows.length} फोटो जोडले · ${rows.length} photo(s) added to the gallery.`);
}

export async function updateGalleryPhoto(id: string, _: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = detailsSchema.safeParse(formObject(fd));
  if (!parsed.success) return zodErrors(parsed.error);
  const { error } = await supabase
    .from("gallery_photos")
    .update({ ...parsed.data, place_mr: parsed.data.place_mr ?? "" })
    .eq("id", id);
  if (error) return dbFailure(error);
  publish();
  return success();
}

/** Move a photo one place up (-1) or down (+1), then renumber all photos 10, 20, 30… */
export async function moveGalleryPhoto(id: string, delta: -1 | 1) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("gallery_photos")
    .select("id")
    .order("sort_order")
    .order("taken_on", { ascending: false, nullsFirst: false });
  const ids = (data ?? []).map((r) => r.id as string);
  const from = ids.indexOf(id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];
  await Promise.all(ids.map((rowId, i) => supabase.from("gallery_photos").update({ sort_order: (i + 1) * 10 }).eq("id", rowId)));
  publish();
}

export async function toggleHomePhoto(id: string, show: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("gallery_photos").update({ show_on_home: show }).eq("id", id);
  publish();
}

export async function deleteGalleryPhoto(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("gallery_photos").select("storage_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
  if (!error && data) {
    // Keep the file if a planting or page uses the same file (not the case for normal uploads).
    await removeFiles(supabase, [data.storage_path]);
  }
  publish();
}
