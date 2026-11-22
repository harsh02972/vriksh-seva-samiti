"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One shared IntersectionObserver for every `.reveal` element on the page.
 * Pages stay Server Components; they only add the `reveal` class.
 * Re-scans after each client-side navigation.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      root.classList.add("reveal-armed");
      return;
    }

    // Anything already on screen animates in right away.
    const viewportHeight = window.innerHeight;
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight && rect.bottom > 0) el.classList.add("is-visible");
    }
    root.classList.add("reveal-armed");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    elements.forEach((el) => {
      if (!el.classList.contains("is-visible")) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
