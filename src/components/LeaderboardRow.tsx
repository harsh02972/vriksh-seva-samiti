import type { ReactNode, Ref } from "react";
import { CONTRIBUTOR_LABEL_MR, type RankedEntry } from "@/lib/leaderboard";
import { formatNumberMr, toMarathiDigits } from "@/lib/format";
import { Medal } from "./icons";
import { cn } from "./ui";

const TYPE_STYLE: Record<RankedEntry["type"], string> = {
  school: "bg-[#E6F0FA] text-[#1F4E79]",
  college: "bg-[#F3E8FA] text-[#5B2C83]",
  individual: "bg-[#FFF1E0] text-[#7A4210]",
  organisation: "bg-mint text-forest-900",
};

const RANK_WORD = ["पहिला", "दुसरा", "तिसरा"];

/** Shows ONLY rank, name, type and trees planted. */
export function LeaderboardRow({
  entry,
  maxTrees,
  ref,
  className,
  actions,
}: {
  entry: RankedEntry;
  maxTrees: number;
  ref?: Ref<HTMLLIElement>;
  className?: string;
  /** Admin preview only: extra buttons at the end of the row. */
  actions?: ReactNode;
}) {
  const medal = entry.rank <= 3 ? (entry.rank as 1 | 2 | 3) : null;
  const width = maxTrees > 0 ? Math.max(4, Math.round((entry.trees / maxTrees) * 100)) : 0;
  return (
    <li
      ref={ref}
      className={cn(
        "relative flex items-center gap-3 rounded-2xl border bg-white px-3 py-3 sm:gap-4 sm:px-4",
        medal === 1 ? "border-sun shadow-[0_6px_20px_rgba(242,194,48,0.25)]" : "border-line",
        className,
      )}
    >
      <span className="flex w-11 shrink-0 items-center justify-center">
        {medal ? (
          <>
            <Medal place={medal} size={40} />
            <span className="sr-only">{RANK_WORD[medal - 1]} क्रमांक</span>
          </>
        ) : (
          <span className="font-display text-xl font-bold text-muted">
            <span className="sr-only">क्रमांक </span>
            {toMarathiDigits(entry.rank)}
          </span>
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold leading-snug text-ink">{entry.nameMr}</span>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", TYPE_STYLE[entry.type])}>
            {CONTRIBUTOR_LABEL_MR[entry.type]}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-cream" aria-hidden>
          <div className="lb-bar h-full rounded-full bg-leaf" style={{ width: `${width}%` }} />
        </div>
      </div>
      <span className="shrink-0 text-right leading-tight">
        <span className="block font-display text-2xl font-extrabold text-brand">{formatNumberMr(entry.trees)}</span>
        <span className="block text-xs text-muted">झाडे</span>
      </span>
      {actions}
    </li>
  );
}
