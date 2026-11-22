"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { FeaturedVideo as Video } from "@/data/site";
import { toMarathiDigits } from "@/lib/format";
import { Play, Replay } from "./icons";
import { cn } from "./ui";

type Mode = "idle" | "preview" | "loading" | "playing" | "ended" | "error" | "unavailable";

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

function canPreview(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.matchMedia("(min-width: 768px)").matches) return false; // phones: poster only, save data
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && connection.effectiveType !== "4g") return false;
  return true;
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  return toMarathiDigits(`${m}:${s}`);
}

/**
 * One short featured video.
 * - Never autoplays with sound. Sound starts only when the visitor taps play.
 * - Nothing is downloaded until tap (preload="none"), except an optional silent
 *   preview loop on wide screens with a good connection.
 * - Pauses when scrolled out of view.
 */
export function FeaturedVideo({ video }: { video: Video }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setModeState] = useState<Mode>("idle");
  const modeRef = useRef<Mode>("idle");
  const setMode = (next: Mode) => {
    modeRef.current = next;
    setModeState(next);
  };

  const portrait = video.orientation === "portrait";
  const duration = formatDuration(video.durationSec);

  // Silent preview + pause-when-hidden, driven by visibility.
  useEffect(() => {
    const frame = frameRef.current;
    const el = videoRef.current;
    if (!frame || !el || !video.src || !("IntersectionObserver" in window)) return;
    const previewAllowed = video.mutedPreview && canPreview();

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = !!entry?.isIntersecting;
        const current = modeRef.current;
        if (visible) {
          if (previewAllowed && (current === "idle" || current === "preview")) {
            el.muted = true;
            el.loop = true;
            el.preload = "auto";
            el.play().catch(() => {
              /* preview is optional */
            });
          }
        } else if (!el.paused && (current === "preview" || current === "playing")) {
          el.pause();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [video.src, video.mutedPreview]);

  function startWithSound() {
    const el = videoRef.current;
    if (!video.src || !el) {
      setMode("unavailable");
      return;
    }
    const wasPreview = modeRef.current === "preview";
    el.loop = false;
    el.muted = false;
    el.volume = 1;
    if (wasPreview || modeRef.current === "ended") el.currentTime = 0;
    setMode(wasPreview ? "playing" : "loading");
    // play() is called directly inside the tap handler so mobile browsers allow sound.
    el.play()
      .then(() => {
        setMode("playing");
        el.focus({ preventScroll: true });
      })
      .catch(() => setMode("error"));
  }

  const showOverlay = mode === "idle" || mode === "preview" || mode === "ended" || mode === "unavailable" || mode === "error";
  const posterHidden = mode === "preview" || mode === "playing";

  return (
    <figure className="reveal m-0 flex flex-col gap-4">
      <div
        className={cn(
          "relative mx-auto w-full rounded-[32px] bg-forest-900 p-2 shadow-[0_24px_60px_rgba(22,63,33,0.25)] sm:p-3",
          portrait ? "max-w-[380px]" : "max-w-[960px]",
        )}
      >
        {/* Decorative leaves on the frame */}
        <svg aria-hidden viewBox="0 0 40 40" className="absolute -top-5 -left-4 z-10 w-12 rotate-[-20deg] motion-safe:animate-sway">
          <path d="M20 2C8 10 4 22 8 36c14-2 26-14 24-32-4-1-8-1-12-2z" fill="#7BB342" />
        </svg>
        <svg aria-hidden viewBox="0 0 40 40" className="absolute -right-3 -bottom-5 z-10 w-10 rotate-[140deg] motion-safe:animate-float">
          <path d="M20 2C8 10 4 22 8 36c14-2 26-14 24-32-4-1-8-1-12-2z" fill="#F2C230" />
        </svg>

        <div
          ref={frameRef}
          className={cn(
            "relative overflow-hidden rounded-[24px] bg-forest-950",
            portrait ? "aspect-[9/16]" : "aspect-video",
          )}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-contain"
            preload="none"
            playsInline
            controls={mode === "playing" || mode === "loading"}
            aria-label={`${video.titleEn} — व्हिडिओ`}
            onPlaying={() => {
              if (modeRef.current === "idle") setMode("preview");
              else if (modeRef.current === "loading") setMode("playing");
            }}
            onEnded={() => setMode("ended")}
            onError={() => {
              if (modeRef.current === "loading" || modeRef.current === "playing") setMode("error");
            }}
          >
            {video.src && <source src={video.src} type={video.mimeType} />}
          </video>

          <Image
            src={video.poster.src}
            alt={video.poster.alt}
            fill
            sizes={portrait ? "380px" : "(min-width: 1024px) 960px, 100vw"}
            className={cn(
              "object-cover transition-opacity duration-700",
              posterHidden ? "pointer-events-none opacity-0" : "opacity-100",
            )}
          />

          {mode === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-forest-950/40" role="status">
              <span className="h-14 w-14 rounded-full border-4 border-white/30 border-t-sun motion-safe:animate-spin" />
              <span className="sr-only">व्हिडिओ सुरू होत आहे…</span>
            </div>
          )}

          {showOverlay && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-forest-950/85 via-forest-950/25 to-forest-950/10 p-4 text-center">
              {video.isPlaceholder && (
                <span className="absolute top-3 left-3 rounded-lg bg-note px-2.5 py-1 text-[13px] font-semibold text-note-ink">
                  नमुना व्हिडिओ
                </span>
              )}
              <button
                type="button"
                onClick={startWithSound}
                className="group relative inline-flex h-[88px] w-[88px] items-center justify-center rounded-full bg-sun text-sun-ink shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-105 focus-visible:outline-white sm:h-[104px] sm:w-[104px]"
                aria-label={
                  mode === "ended"
                    ? "व्हिडिओ पुन्हा आवाजासह पहा"
                    : `व्हिडिओ आवाजासह सुरू करा (${toMarathiDigits(video.durationSec)} सेकंद)`
                }
              >
                <span aria-hidden className="absolute inset-0 rounded-full bg-sun motion-safe:animate-pulse-ring" />
                {mode === "ended" ? <Replay size={40} className="relative" /> : <Play size={46} className="relative ml-1.5" />}
              </button>
              <span className="text-base font-semibold text-white drop-shadow sm:text-lg">
                {mode === "ended" ? "पुन्हा पहा" : "टॅप करा आणि आवाजासह पहा"} · {duration}
              </span>
              {mode === "unavailable" && (
                <span role="status" className="rounded-xl bg-white/90 px-4 py-2 text-[15px] font-semibold text-forest-900">
                  व्हिडिओ लवकरच उपलब्ध होईल.
                </span>
              )}
              {mode === "error" && (
                <span role="status" className="rounded-xl bg-white/90 px-4 py-2 text-[15px] font-semibold text-forest-900">
                  व्हिडिओ सुरू होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <figcaption className="mx-auto flex max-w-[760px] flex-col items-center gap-3 text-center">
        <p className="m-0 text-ink-soft">{video.captionMr}</p>
        <details className="group w-full rounded-2xl border border-line bg-white px-5 py-3 text-left">
          <summary className="cursor-pointer list-none font-semibold text-brand marker:hidden">
            <span aria-hidden className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
            व्हिडिओमध्ये काय आहे? (मजकूर)
          </summary>
          <p className="m-0 mt-2 text-[16px] text-muted">{video.transcriptMr}</p>
        </details>
      </figcaption>
    </figure>
  );
}
