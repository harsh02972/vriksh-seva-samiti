"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryCategory, GalleryPhoto } from "@/data/site";
import { formatDateMr, toMarathiDigits } from "@/lib/format";
import { Calendar, ChevronLeft, ChevronRight, Cross, MapPin } from "./icons";
import { cn } from "./ui";

const CATEGORIES: { id: "all" | GalleryCategory; labelMr: string }[] = [
  { id: "all", labelMr: "सर्व" },
  { id: "planting", labelMr: "वृक्षारोपण" },
  { id: "care", labelMr: "संगोपन" },
  { id: "collection", labelMr: "रद्दी संकलन" },
  { id: "schools", labelMr: "शाळा व महाविद्यालये" },
];

export function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const [category, setCategory] = useState<"all" | GalleryCategory>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const visible = category === "all" ? photos : photos.filter((p) => p.category === category);

  const close = useCallback(() => {
    const trigger = openIndex !== null ? triggerRefs.current[openIndex] : null;
    setOpenIndex(null);
    // Return focus to the photo that opened the viewer.
    requestAnimationFrame(() => trigger?.focus());
  }, [openIndex]);

  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label="फोटो प्रकार निवडा" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {CATEGORIES.map((c) => {
          const count = c.id === "all" ? photos.length : photos.filter((p) => p.category === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "min-h-[44px] shrink-0 rounded-full border-2 px-4 font-semibold whitespace-nowrap transition-colors",
                category === c.id
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-white text-ink hover:border-brand hover:text-brand",
              )}
            >
              {c.labelMr} <span className="opacity-75">({toMarathiDigits(count)})</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {toMarathiDigits(visible.length)} फोटो दाखवले आहेत
      </p>

      <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((photo, i) => (
          <li key={photo.id} className="gallery-item" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
            <button
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative block aspect-square w-full overflow-hidden rounded-[18px] bg-mint text-left"
              aria-label={`फोटो मोठा पहा: ${photo.captionMr}`}
            >
              <Image
                src={photo.image.src}
                alt={photo.image.alt}
                fill
                sizes="(min-width: 1024px) 285px, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/85 to-transparent px-3 pt-8 pb-2.5 text-[14px] leading-snug font-semibold text-white sm:text-[15px]">
                {photo.captionMr}
                <span className="block text-[12px] font-normal text-on-dark sm:text-[13px]">{formatDateMr(photo.date)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && visible[openIndex] && (
        <Lightbox photos={visible} index={openIndex} onIndexChange={setOpenIndex} onClose={close} />
      )}
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: GalleryPhoto[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [dragX, setDragX] = useState(0);
  const photo = photos[index];
  const count = photos.length;

  const go = useCallback(
    (delta: number) => onIndexChange((index + delta + count) % count),
    [index, count, onIndexChange],
  );

  // Keyboard: arrows, Escape, and a simple focus trap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Focus the close button and lock page scroll while open.
  useEffect(() => {
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) setDragX(dx);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    setDragX(0);
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onClose(); // swipe down to close
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`फोटो ${toMarathiDigits(index + 1)} / ${toMarathiDigits(count)}: ${photo.captionMr}`}
      className="lightbox fixed inset-0 z-[100] flex flex-col bg-[rgba(11,31,17,0.97)] text-white"
    >
      <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5">
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold tabular-nums">
          {toMarathiDigits(index + 1)} / {toMarathiDigits(count)}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <Cross size={24} />
          <span className="sr-only">बंद करा</span>
        </button>
      </div>

      <div
        className="relative flex-1 touch-pan-y select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          key={photo.id}
          className="lightbox-photo absolute inset-2 sm:inset-x-20 sm:inset-y-2"
          style={dragX ? { transform: `translateX(${dragX}px)`, transition: "none" } : undefined}
        >
          <Image
            src={photo.image.src}
            alt={photo.image.alt}
            fill
            sizes="100vw"
            preload
            className="object-contain"
          />
        </div>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 hover:bg-white/25 sm:inline-flex"
            >
              <ChevronLeft size={30} />
              <span className="sr-only">मागील फोटो</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute top-1/2 right-2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 hover:bg-white/25 sm:inline-flex"
            >
              <ChevronRight size={30} />
              <span className="sr-only">पुढील फोटो</span>
            </button>
          </>
        )}
      </div>

      <div className="px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto flex max-w-[900px] flex-col gap-1.5">
          <p className="m-0 text-lg font-semibold">{photo.captionMr}</p>
          <p className="m-0 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-on-dark">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={17} /> {photo.placeMr}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={17} /> <time dateTime={photo.date}>{formatDateMr(photo.date)}</time>
            </span>
            {photo.isSample && <span className="rounded bg-note px-2 text-[13px] font-semibold text-note-ink">नमुना चित्र</span>}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3 sm:hidden">
            <button type="button" onClick={() => go(-1)} className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-white/10 px-4">
              <ChevronLeft size={20} /> मागील
            </button>
            <span className="text-xs text-on-dark-soft">बाजूला स्वाइप करा</span>
            <button type="button" onClick={() => go(1)} className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-white/10 px-4">
              पुढील <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
