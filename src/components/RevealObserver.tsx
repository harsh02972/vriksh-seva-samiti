"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One shared IntersectionObserver for every `.reveal` element on the page.
 * Pages stay Server Components; they only add the `reveal` class.
 *
 * Content is visible in the server HTML. After hydration we hide only the
 * blocks that are still below the fold (the visitor has not seen them yet)
 * and fade them in as they scroll into view. Nothing above the fold is ever
 * hidden, so the Largest Contentful Paint is never delayed by JavaScript.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const viewportHeight = window.innerHeight;
    const pending = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not([data-revealed])")).filter((el) => {
      const rect = el.getBoundingClientRect();
      const belowFold = rect.top > viewportHeight * 0.92;
      if (!belowFold) el.dataset.revealed = "";
      return belowFold;
    });
    pending.forEach((el) => el.classList.add("reveal-pending"));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.remove("reveal-pending");
          el.dataset.revealed = "";
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    pending.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      // Never leave content hidden if this effect is torn down.
      pending.forEach((el) => el.classList.remove("reveal-pending"));
    };
  }, [pathname]);

  return null;
}
