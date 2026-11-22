"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { dbFailure, formObject, success, zOptionalInt, zodErrors, type FormState } from "@/lib/admin/forms";
import { publish } from "@/lib/admin/publish";

const schema = z.object({
  trees_planted_override: zOptionalInt(0, 100_000_000),
  trees_surviving_override: zOptionalInt(0, 100_000_000),
  waste_kg_override: zOptionalInt(0, 1_000_000_000),
  donors_override: zOptionalInt(0, 10_000_000),
  next_milestone: zOptionalInt(1, 100_000_000),
});

export async function saveStats(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = schema.safeParse(formObject(fd));
  if (!parsed.success) return zodErrors(parsed.error);
  const { error } = await supabase.from("site_stats").upsert({ id: 1, ...parsed.data });
  if (error) return dbFailure(error);
  publish();
  return success("आकडे जतन झाले · Numbers saved. Empty boxes are calculated automatically.");
}
