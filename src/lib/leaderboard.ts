import type { ContributorType, LeaderboardEntry } from "@/data/site";

export type LeaderboardFilter = "all" | ContributorType;

export interface RankedEntry extends LeaderboardEntry {
  rank: number;
}

export const CONTRIBUTOR_LABEL_MR: Record<ContributorType, string> = {
  school: "शाळा",
  college: "महाविद्यालय",
  individual: "व्यक्ती",
  organisation: "संस्था",
};

export const FILTERS: { id: LeaderboardFilter; labelMr: string }[] = [
  { id: "all", labelMr: "सर्व" },
  { id: "school", labelMr: "शाळा" },
  { id: "college", labelMr: "महाविद्यालये" },
  { id: "individual", labelMr: "व्यक्ती" },
  { id: "organisation", labelMr: "संस्था" },
];

/**
 * Sort by trees (desc) and assign competition ranks: equal trees share a rank
 * (1, 2, 2, 4). Ties are ordered by name so the list is stable.
 */
export function rankEntries(entries: LeaderboardEntry[], filter: LeaderboardFilter = "all"): RankedEntry[] {
  const pool = filter === "all" ? entries : entries.filter((e) => e.type === filter);
  // Code-point comparison (not localeCompare) keeps server and browser order identical.
  const sorted = [...pool].sort(
    (a, b) => b.trees - a.trees || (a.nameMr < b.nameMr ? -1 : a.nameMr > b.nameMr ? 1 : 0),
  );
  let lastTrees = Number.NaN;
  let lastRank = 0;
  return sorted.map((entry, index) => {
    const rank = entry.trees === lastTrees ? lastRank : index + 1;
    lastTrees = entry.trees;
    lastRank = rank;
    return { ...entry, rank };
  });
}

export function matchesSearch(entry: LeaderboardEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return entry.nameMr.toLowerCase().includes(q) || (entry.searchAlias?.toLowerCase().includes(q) ?? false);
}
