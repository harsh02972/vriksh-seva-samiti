"use client";

import { useState } from "react";
import { AdminForm, Checkbox, TextArea, TextInput } from "@/components/admin/forms";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Upload } from "@/components/icons";
import type { FormState } from "@/lib/admin/forms";
import { captureFrame, MAX_VIDEO_SECONDS, uploadImage, uploadVideo, validateVideo, type UploadedImage } from "@/lib/admin/upload";
import { mediaUrl } from "@/lib/supabase/env";

export type VideoValues = {
  video_path?: string | null;
  duration_sec?: number | null;
  video_bytes?: number | null;
  poster_path?: string | null;
  poster_width?: number | null;
  poster_height?: number | null;
  title_en?: string;
  caption_mr?: string;
  transcript_mr?: string;
  muted_preview?: boolean;
};

type NewVideo = { path: string; bytes: number; duration: number; width: number; height: number; previewUrl: string };

export function VideoForm({ action, values }: { action: (s: FormState, fd: FormData) => Promise<FormState>; values?: VideoValues | null }) {
  const [video, setVideo] = useState<NewVideo | null>(null);
  const [status, setStatus] = useState<{ busy?: boolean; error?: string; text?: string }>({});
  const initialPoster: UploadedImage[] =
    values?.poster_path && values.poster_width && values.poster_height
      ? [{ path: values.poster_path, width: values.poster_width, height: values.poster_height }]
      : [];
  const [poster, setPoster] = useState<UploadedImage[]>(initialPoster);
  const [posterKey, setPosterKey] = useState(0);

  async function onVideo(file: File | undefined) {
    if (!file) return;
    setStatus({ busy: true, text: "Checking video… · तपासत आहे…" });
    try {
      const meta = await validateVideo(file);
      setStatus({ busy: true, text: `Uploading ${(file.size / 1048576).toFixed(1)} MB… · अपलोड होत आहे…` });
      const path = await uploadVideo(file);
      setVideo({ path, bytes: file.size, duration: Math.round(meta.duration * 100) / 100, width: meta.width, height: meta.height, previewUrl: URL.createObjectURL(file) });
      if (!poster.length) {
        setStatus({ busy: true, text: "Making a poster from the video… · पोस्टर तयार करत आहे…" });
        try {
          const frame = await captureFrame(file);
          const img = await uploadImage(frame, "video");
          setPoster([img]);
          setPosterKey((k) => k + 1);
        } catch {
          /* poster is optional; the admin can upload one */
        }
      }
      setStatus({ text: "✔ Video uploaded. Press Save to put it on the website. · आता जतन करा." });
    } catch (error) {
      setStatus({ error: (error as Error).message });
    }
  }

  const currentSrc = video?.previewUrl ?? (values?.video_path ? mediaUrl(values.video_path) : null);

  return (
    <AdminForm action={action} submitLabel="Save video · जतन करा">
      {video && (
        <>
          <input type="hidden" name="video_path" value={video.path} />
          <input type="hidden" name="video_bytes" value={video.bytes} />
          <input type="hidden" name="duration_sec" value={video.duration} />
          <input type="hidden" name="video_width" value={video.width} />
          <input type="hidden" name="video_height" value={video.height} />
        </>
      )}
      {status.busy && <input type="hidden" name="__uploading" value="1" />}

      <div className="flex flex-col gap-3">
        <span className="font-semibold text-forest-900">Video file · व्हिडिओ</span>
        {currentSrc ? (
          <video
            key={currentSrc}
            src={currentSrc}
            poster={poster[0] ? (poster[0].previewUrl ?? mediaUrl(poster[0].path)) : undefined}
            controls
            muted
            playsInline
            preload="metadata"
            className="max-h-[420px] w-full rounded-xl bg-forest-950 object-contain"
          />
        ) : (
          <p className="m-0 rounded-xl bg-cream p-4 text-muted">No video yet. The Home page shows the sample video section until you add one.</p>
        )}
        <label className="flex min-h-[64px] cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-brand/50 bg-white px-4 py-3 text-center font-semibold text-brand hover:bg-mint focus-within:outline-2 focus-within:outline-brand">
          <Upload size={22} />
          {currentSrc ? "Replace video · व्हिडिओ बदला" : "Choose video · व्हिडिओ निवडा"}
          <input type="file" accept="video/mp4" className="sr-only" disabled={status.busy} onChange={(e) => onVideo(e.target.files?.[0])} />
        </label>
        <p className="m-0 text-sm text-muted">
          MP4 only · max 15 MB · max {MAX_VIDEO_SECONDS} seconds (20–25 s is ideal). Tip: record in 720p or use a free compressor app if the phone video is too big.
        </p>
        {(status.text || status.error) && (
          <p className={`m-0 rounded-lg px-3 py-2 text-sm font-semibold ${status.error ? "bg-[#FBEAE5] text-[#7A2E1C]" : "bg-mint text-brand"}`} aria-live="polite">
            {status.error ? `✖ ${status.error}` : status.text}
          </p>
        )}
      </div>

      <ImageUploader
        key={posterKey}
        name="poster"
        label="Poster image · पोस्टर"
        folder="video"
        multiple={false}
        initial={poster}
        hint="Shown before the video plays. Made automatically from the video if you don't choose one."
      />

      <TextInput name="title_en" label="Heading (English)" defaultValue={values?.title_en ?? "See Our Work in 20 Seconds"} />
      <TextInput name="caption_mr" label="Caption · माहिती" defaultValue={values?.caption_mr} />
      <TextArea
        name="transcript_mr"
        label="What is said / shown (optional) · व्हिडिओतील मजकूर"
        defaultValue={values?.transcript_mr}
        rows={3}
        hint="Helps people who cannot hear or play the video."
      />
      <Checkbox
        name="muted_preview"
        label="Play silently on its own when visible · आवाजाशिवाय आपोआप सुरू"
        hint="Visitors can still tap to play with sound."
        defaultChecked={values?.muted_preview ?? true}
      />
    </AdminForm>
  );
}
