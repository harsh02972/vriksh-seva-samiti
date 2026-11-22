"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { LeaderboardEntry } from "@/data/site";
import { formatNumberMr, toMarathiDigits } from "@/lib/format";
import { FILTERS, matchesSearch, rankEntries, type LeaderboardFilter } from "@/lib/leaderboard";
import { Cross, Search } from "./icons";
import { LeaderboardRow } from "./LeaderboardRow";
import { cn } from "./ui";

/**
 * Interactive leaderboard.
 * Rank is computed within the selected type filter; search only narrows the
 * list, so a searched name keeps its real rank.
 * Rows animate to their new positions (FLIP via Web Animations API).
 */
export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  const [filter, setFilter] = useState<LeaderboardFilter>("all");
  const [query, setQuery] = useState("");
  const searchId = useId();

  const ranked = useMemo(() => rankEntries(entries, filter), [entries, filter]);
  const shown = useMemo(() => ranked.filter((e) => matchesSearch(e, query)), [ranked, query]);
  const maxTrees = ranked[0]?.trees ?? 0;
  const totalTrees = ranked.reduce((s, e) => s + e.trees, 0);

  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const prevTops = useRef(new Map<string, number>());

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextTops = new Map<string, number>();
    rowRefs.current.forEach((el, id) => {
      const top = el.offsetTop;
      nextTops.set(id, top);
      if (reduceMotion || typeof el.animate !== "function") return;
      const prev = prevTops.current.get(id);
      if (prev === undefined) {
        if (prevTops.current.size > 0) {
          el.animate([{ opacity: 0, transform: "translateY(12px) scale(0.98)" }, { opacity: 1, transform: "none" }], {
            duration: 380,
            easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
          });
        }
      } else if (prev !== top) {
        el.animate([{ transform: `translateY(${prev - top}px)` }, { transform: "none" }], {
          duration: 520,
          easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        });
      }
    });
    prevTops.current = nextTops;
  }, [shown]);

  const activeLabel = FILTERS.find((f) => f.id === filter)?.labelMr ?? "";

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-col gap-4 rounded-[22px] border border-line bg-white p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="प्रकारानुसार गाळा" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:pb-0">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "min-h-[44px] shrink-0 rounded-full border-2 px-4 font-semibold whitespace-nowrap transition-colors",
                filter === f.id ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand hover:text-brand",
              )}
            >
              {f.labelMr}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:max-w-[320px]">
          <label htmlFor={searchId} className="sr-only">
            नाव शोधा
          </label>
          <Search size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="नाव शोधा (मराठी / English)"
            autoComplete="off"
            className="min-h-[48px] w-full rounded-full border-2 border-line bg-cream py-2 pr-11 pl-11 text-base text-ink placeholder:text-muted focus:border-brand focus:bg-white focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-mint hover:text-brand"
            >
              <Cross size={18} />
              <span className="sr-only">शोध पुसा</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-1 text-[15px] text-muted">
        <span>
          <strong className="text-forest-900">{activeLabel}</strong> · {toMarathiDigits(ranked.length)} नावे ·{" "}
          {formatNumberMr(totalTrees)} झाडे
        </span>
        <span aria-live="polite">
          {query ? `${toMarathiDigits(shown.length)} नावे सापडली` : "जास्त झाडे → वरचा क्रमांक"}
        </span>
      </div>

      {/* List */}
      {shown.length > 0 ? (
        <ol className="relative flex flex-col gap-2.5" aria-label={`लीडरबोर्ड — ${activeLabel}`}>
          {shown.map((entry) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              maxTrees={maxTrees}
              ref={(el: HTMLLIElement | null) => {
                if (el) rowRefs.current.set(entry.id, el);
                else rowRefs.current.delete(entry.id);
              }}
            />
          ))}
        </ol>
      ) : (
        <div className="rounded-[22px] border-2 border-dashed border-line bg-white p-8 text-center">
          <p className="m-0 font-semibold text-forest-900">“{query}” नावाचे कोणी सापडले नाही.</p>
          <p className="m-0 mt-1 text-muted">स्पेलिंग तपासा किंवा “सर्व” निवडा.</p>
        </div>
      )}
    </div>
  );
}
