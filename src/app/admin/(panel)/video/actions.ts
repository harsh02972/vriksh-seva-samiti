"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { dbFailure, failure, formObject, success, zBool, zodErrors, zOptionalText, zText, type FormState } from "@/lib/admin/forms";
import { imageList, removeFiles, videoPath } from "@/lib/admin/media";
import { publish } from "@/lib/admin/publish";

const num = (min: number, max: number) => z.coerce.number().min(min).max(max);

const newVideo = z.object({
  video_path: videoPath,
  video_bytes: num(1, 15 * 1024 * 1024).int(),
  duration_sec: num(0.1, 26),
  video_width: num(1, 10000).int(),
  video_height: num(1, 10000).int(),
});

const details = z.object({
  title_en: zText(120, "Title"),
  caption_mr: zOptionalText(400),
  transcript_mr: zOptionalText(3000),
  muted_preview: zBool(),
});

export async function saveVideo(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  if (fd.get("__uploading")) return failure("अपलोड पूर्ण होऊ द्या · Wait for the upload to finish.");
  const raw = formObject(fd);
  const d = details.safeParse(raw);
  if (!d.success) return zodErrors(d.error);
  const poster = imageList(1).safeParse(fd.get("poster"));
  if (!poster.success) return zodErrors(poster.error);

  const { data: current } = await supabase.from("featured_video").select("video_path, poster_path").eq("id", 1).maybeSingle();
  const row: Record<string, unknown> = {
    id: 1,
    title_en: d.data.title_en,
    caption_mr: d.data.caption_mr ?? "",
    transcript_mr: d.data.transcript_mr ?? "",
    muted_preview: d.data.muted_preview,
  };

  if (raw.video_path) {
    const v = newVideo.safeParse(raw);
    if (!v.success) return zodErrors(v.error);
    Object.assign(row, v.data);
  }
  const p = poster.data[0];
  Object.assign(row, p ? { poster_path: p.path, poster_width: p.width, poster_height: p.height } : { poster_path: null, poster_width: null, poster_height: null });

  if (!row.video_path && !current?.video_path) return failure("आधी व्हिडिओ निवडा · Choose a video first.", { video: "Required" });

  const { error } = await supabase.from("featured_video").upsert(row);
  if (error) return dbFailure(error);
  await removeFiles(supabase, [
    row.video_path && current?.video_path !== row.video_path ? current?.video_path : null,
    current?.poster_path && current.poster_path !== row.poster_path ? current.poster_path : null,
  ]);
  publish();
  return success("व्हिडिओ जतन झाला · Video saved. It is live on the Home page.");
}

export async function removeVideo() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("featured_video").select("video_path, poster_path").eq("id", 1).maybeSingle();
  const { error } = await supabase.from("featured_video").delete().eq("id", 1);
  if (!error && data) await removeFiles(supabase, [data.video_path, data.poster_path]);
  publish();
}
