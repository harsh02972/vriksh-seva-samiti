"use client";

import { getBrowserClient } from "../supabase/browser";
import { MEDIA_BUCKET } from "../supabase/env";

export type UploadedImage = { path: string; width: number; height: number; alt?: string; previewUrl?: string };

export const MAX_VIDEO_BYTES = 15 * 1024 * 1024;
export const MAX_VIDEO_SECONDS = 25;
const MAX_IMAGE_INPUT_BYTES = 40 * 1024 * 1024;

function uid() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Shrinks a photo in the browser before upload: longest side ≤ maxEdge px, WebP (or JPEG
 * on browsers that cannot make WebP), EXIF rotation applied, location data dropped.
 * A 6 MB phone photo usually becomes 200–500 KB.
 */
export async function compressImage(file: Blob, maxEdge = 2000, quality = 0.82) {
  if (file.size > MAX_IMAGE_INPUT_BYTES) throw new Error("फोटो खूप मोठा आहे (40 MB पेक्षा जास्त) · Photo is too large.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("हा फोटो उघडता आला नाही (JPG/PNG/WebP वापरा) · Could not read this photo. Use JPG, PNG or WebP.");
  }
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, "image/webp", quality);
  let ext = "webp";
  if (!blob || blob.type !== "image/webp") {
    blob = await canvasToBlob(canvas, "image/jpeg", 0.85);
    ext = "jpg";
  }
  if (!blob) throw new Error("Could not compress the photo.");
  return { blob, width, height, ext };
}

async function uploadBlob(blob: Blob, folder: string, ext: string) {
  const supabase = getBrowserClient();
  const now = new Date();
  const path = `${folder}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${uid()}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: blob.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    if (/row-level security|unauthori|403/i.test(error.message)) throw new Error("Upload not allowed — please sign in again.");
    throw new Error(`Upload failed: ${error.message}`);
  }
  return path;
}

export async function uploadImage(file: Blob, folder: string): Promise<UploadedImage> {
  const { blob, width, height, ext } = await compressImage(file);
  const path = await uploadBlob(blob, folder, ext);
  return { path, width, height, previewUrl: URL.createObjectURL(blob) };
}

/** Reads duration and size of a video in the browser. */
export function readVideoMeta(file: File) {
  return new Promise<{ duration: number; width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => {
      resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("हा व्हिडिओ वाचता आला नाही (MP4 वापरा) · Could not read this video. Use an MP4 file."));
    };
    video.src = url;
  });
}

/** Grabs one frame (at ~1 s) of a video to use as its poster. */
export function captureFrame(file: File, at = 1) {
  return new Promise<Blob>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(at, Math.max(0, video.duration / 2));
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not capture a frame"))), "image/jpeg", 0.9);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the video"));
    };
    video.src = url;
  });
}

export async function validateVideo(file: File) {
  if (file.type !== "video/mp4" && !file.name.toLowerCase().endsWith(".mp4"))
    throw new Error("फक्त MP4 व्हिडिओ · Only MP4 videos are allowed.");
  if (file.size > MAX_VIDEO_BYTES)
    throw new Error(`व्हिडिओ 15 MB पेक्षा मोठा आहे (${(file.size / 1048576).toFixed(1)} MB) · Video is larger than 15 MB.`);
  const meta = await readVideoMeta(file);
  if (!Number.isFinite(meta.duration) || meta.duration <= 0) throw new Error("Could not read the video length.");
  if (meta.duration > MAX_VIDEO_SECONDS + 0.5)
    throw new Error(`व्हिडिओ ${Math.round(meta.duration)} सेकंदांचा आहे — जास्तीत जास्त ${MAX_VIDEO_SECONDS} सेकंद · Video is ${Math.round(meta.duration)} s; max ${MAX_VIDEO_SECONDS} s.`);
  return meta;
}

export async function uploadVideo(file: File) {
  const blob = file.type === "video/mp4" ? file : new Blob([file], { type: "video/mp4" });
  return uploadBlob(blob, "video", "mp4");
}
