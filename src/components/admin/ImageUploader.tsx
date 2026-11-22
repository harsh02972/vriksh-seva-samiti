"use client";

/* eslint-disable @next/next/no-img-element -- admin previews of just-uploaded files (blob: URLs) */
import { useId, useRef, useState } from "react";
import { uploadImage, type UploadedImage } from "@/lib/admin/upload";
import { mediaUrl } from "@/lib/supabase/env";
import { ArrowDown, ArrowUp, Cross, Upload } from "../icons";
import { cn } from "../ui";

type Item = UploadedImage & { key: string };
type Pending = { key: string; name: string; status: "compressing" | "error"; error?: string };

/**
 * Pick photos → they are compressed in the browser and uploaded straight to Storage.
 * The form then submits only the list of uploaded files (as JSON in a hidden input).
 */
export function ImageUploader({
  name,
  label,
  hint,
  folder,
  initial = [],
  multiple = true,
  max = 20,
}: {
  name: string;
  label: string;
  hint?: string;
  folder: string;
  initial?: UploadedImage[];
  multiple?: boolean;
  max?: number;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>(() => initial.map((img, i) => ({ ...img, key: `init-${i}-${img.path}` })));
  const [pending, setPending] = useState<Pending[]>([]);
  const busy = pending.some((p) => p.status === "compressing");

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = multiple ? Math.max(0, max - items.length) : 1;
    const list = [...files].slice(0, room);
    if (!multiple) setItems([]);
    const jobs = list.map((file) => ({ key: `${file.name}-${file.size}-${Math.random()}`, file }));
    setPending((p) => [...p, ...jobs.map((j) => ({ key: j.key, name: j.file.name, status: "compressing" as const }))]);

    // Two at a time: fast, and gentle on phones.
    const queue = [...jobs];
    async function worker() {
      for (let job = queue.shift(); job; job = queue.shift()) {
        const current = job;
        try {
          const uploaded = await uploadImage(current.file, folder);
          setItems((prev) => (multiple ? [...prev, { ...uploaded, key: current.key }] : [{ ...uploaded, key: current.key }]));
          setPending((p) => p.filter((x) => x.key !== current.key));
        } catch (error) {
          setPending((p) =>
            p.map((x) => (x.key === current.key ? { ...x, status: "error", error: (error as Error).message } : x)),
          );
        }
      }
    }
    await Promise.all([worker(), worker()]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, delta: number) {
    setItems((prev) => {
      const next = [...prev];
      const [it] = next.splice(index, 1);
      next.splice(Math.max(0, Math.min(next.length, index + delta)), 0, it);
      return next;
    });
  }

  const value = JSON.stringify(items.map(({ path, width, height, alt }) => ({ path, width, height, alt: alt ?? "" })));

  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold text-forest-900">{label}</span>
      <input type="hidden" name={name} value={value} />
      {busy && <input type="hidden" name="__uploading" value="1" />}

      {items.length > 0 && (
        <ul className="m-0 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((img, i) => (
            <li key={img.key} className="relative overflow-hidden rounded-xl border-2 border-line bg-cream">
              <img src={img.previewUrl ?? mediaUrl(img.path)} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
              {multiple && i === 0 && (
                <span className="absolute top-1.5 left-1.5 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">Main · मुख्य</span>
              )}
              <div className="flex items-center justify-between gap-1 p-1.5">
                {multiple ? (
                  <span className="flex gap-1">
                    <IconButton label="Move left" onClick={() => move(i, -1)} disabled={i === 0}>
                      <ArrowUp size={16} className="-rotate-90" />
                    </IconButton>
                    <IconButton label="Move right" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                      <ArrowDown size={16} className="-rotate-90" />
                    </IconButton>
                  </span>
                ) : (
                  <span />
                )}
                <IconButton label="Remove photo" onClick={() => setItems((prev) => prev.filter((x) => x.key !== img.key))} danger>
                  <Cross size={16} />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pending.length > 0 && (
        <ul className="m-0 flex flex-col gap-1.5" aria-live="polite">
          {pending.map((p) => (
            <li
              key={p.key}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm",
                p.status === "error" ? "bg-[#FBEAE5] text-[#7A2E1C]" : "bg-mint text-brand",
              )}
            >
              <span className="truncate">
                {p.status === "error" ? `✖ ${p.name}: ${p.error}` : `⏳ ${p.name} — compressing & uploading…`}
              </span>
              {p.status === "error" && (
                <button type="button" className="font-semibold underline" onClick={() => setPending((x) => x.filter((y) => y.key !== p.key))}>
                  OK
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {(multiple ? items.length < max : true) && (
        <label
          htmlFor={id}
          className="flex min-h-[64px] cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-brand/50 bg-white px-4 py-3 text-center font-semibold text-brand hover:bg-mint focus-within:outline-2 focus-within:outline-brand"
        >
          <Upload size={22} />
          {multiple ? "Choose photos · फोटो निवडा" : items.length ? "Replace photo · फोटो बदला" : "Choose photo · फोटो निवडा"}
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple={multiple}
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
      )}
      {hint && <p className="m-0 text-sm text-muted">{hint}</p>}
      {busy && <p className="m-0 text-sm font-semibold text-note-ink">Please wait until uploads finish before saving.</p>}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white disabled:opacity-30",
        danger ? "text-[#A4301F] hover:bg-[#FBEAE5]" : "text-ink hover:border-brand",
      )}
    >
      {children}
    </button>
  );
}
