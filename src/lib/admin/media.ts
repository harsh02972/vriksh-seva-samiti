import "server-only";
import { z } from "zod";
import { MEDIA_BUCKET } from "../supabase/env";
import type { AdminSession } from "./auth";

/** Paths we create are like "gallery/2026/11/<uuid>.webp". Anything else is rejected. */
const safePath = z
  .string()
  .max(300)
  .regex(/^(gallery|plantings|pages|video)\/[\w\-/.]+\.(webp|jpg|jpeg|png|mp4)$/i, "Invalid file")
  .refine((p) => !p.includes(".."), "Invalid file");

export const uploadedImage = z.object({
  path: safePath,
  width: z.number().int().positive().max(20000),
  height: z.number().int().positive().max(20000),
  alt: z.string().max(300).optional().default(""),
});

export const imageList = (max = 30) =>
  z.preprocess((v) => {
    if (typeof v !== "string" || !v) return [];
    try {
      return JSON.parse(v);
    } catch {
      return [];
    }
  }, z.array(uploadedImage).max(max, `जास्तीत जास्त ${max} फोटो · At most ${max} photos`));

export const videoPath = z.string().regex(/^video\/[\w\-/.]+\.mp4$/i, "Invalid video file");

/** Deletes files from the media bucket (ignores failures: an orphan file is harmless). */
export async function removeFiles(supabase: AdminSession["supabase"], paths: (string | null | undefined)[]) {
  const list = [...new Set(paths.filter((p): p is string => Boolean(p)))];
  if (list.length) await supabase.storage.from(MEDIA_BUCKET).remove(list);
}
