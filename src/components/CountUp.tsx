"use client";

import { useEffect, useRef } from "react";
import { formatNumberMr } from "@/lib/format";

/**
 * Number that counts up when it scrolls into view.
 * - Server HTML contains the real final number (works without JS, good for SEO).
 * - Screen readers always get the final number; the animated digits are aria-hidden.
 * - Updates the text node directly (no React re-render per frame).
 * - Respects prefers-reduced-motion.
 */
export function CountUp({ value, duration = 1600, className }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const finalText = formatNumberMr(value);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      el.textContent = finalText;
      el.classList.remove("countup-pending");
      return;
    }

    el.textContent = formatNumberMr(0);
    el.classList.remove("countup-pending");

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = formatNumberMr(value * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
          else el.textContent = finalText;
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = finalText;
    };
  }, [value, duration]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true" className="countup-pending tabular-nums">
        {formatNumberMr(value)}
      </span>
      <span className="sr-only">{formatNumberMr(value)}</span>
    </span>
  );
}
