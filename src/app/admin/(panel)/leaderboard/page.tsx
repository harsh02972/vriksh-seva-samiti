import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin/forms";
import { Card, Empty, LoadError, PageHeader } from "@/components/admin/ui";
import { Eye, EyeOff } from "@/components/icons";
import { LeaderboardRow } from "@/components/LeaderboardRow";
import type { ContributorType } from "@/data/site";
import { requireAdmin } from "@/lib/admin/auth";
import { DONOR_TYPES, fmt, labelOf } from "@/lib/admin/labels";
import { rankEntries } from "@/lib/leaderboard";
import { setLeaderboardVisibility } from "../donors/actions";

export const metadata: Metadata = { title: "Leaderboard preview" };

export default async function LeaderboardAdminPage() {
  const { supabase } = await requireAdmin();
  // public_leaderboard is the exact view the website reads (same filters, same columns).
  const [{ data: visible, error }, { data: hidden }] = await Promise.all([
    supabase.from("public_leaderboard").select("id, name, type, trees_planted").order("trees_planted", { ascending: false }),
    supabase.from("donors").select("id, name, type, trees_planted").eq("show_on_leaderboard", false).order("trees_planted", { ascending: false }),
  ]);
  const ranked = rankEntries(
    (visible ?? []).map((d) => ({ id: d.id, nameMr: d.name, type: d.type as ContributorType, trees: d.trees_planted, isSample: false })),
  );
  const maxTrees = ranked[0]?.trees ?? 0;

  return (
    <>
      <PageHeader
        title="Leaderboard"
        titleMr="लीडरबोर्ड"
        intro="वेबसाइटवर नेमके असेच दिसेल — फक्त नाव, प्रकार आणि झाडे. · Exactly what visitors see: name, type and trees only. Donors with 0 trees are not listed."
        actions={
          <Link href="/leaderboard" target="_blank" className="inline-flex min-h-[46px] items-center rounded-full border-2 border-brand px-5 font-bold no-underline">
            Open public page ↗
          </Link>
        }
      />

      <Card title={`Public ranking · ${ranked.length} names`}>
        {error ? (
          <LoadError what="leaderboard" />
        ) : !ranked.length ? (
          <Empty>No names yet. Names appear after a contribution with trees is added. Until then the website shows sample names.</Empty>
        ) : (
          <ol className="m-0 flex flex-col gap-2.5">
            {ranked.map((entry) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                maxTrees={maxTrees}
                className="flex-wrap"
                actions={
                  <ConfirmButton
                    action={setLeaderboardVisibility.bind(null, entry.id, false)}
                    confirmText={`Hide ${entry.nameMr} from the public leaderboard?`}
                    variant="plain"
                  >
                    <EyeOff size={18} /> <span className="sr-only sm:not-sr-only">Hide · लपवा</span>
                  </ConfirmButton>
                }
              />
            ))}
          </ol>
        )}
      </Card>

      <Card title={`Hidden donors · लपवलेले (${hidden?.length ?? 0})`}>
        {!hidden?.length ? (
          <Empty>No hidden donors.</Empty>
        ) : (
          <ul className="m-0 flex flex-col divide-y divide-line">
            {hidden.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-3 py-3">
                <Link href={`/admin/donors/${d.id}`} className="flex-1 font-semibold">
                  {d.name}
                </Link>
                <span className="text-sm text-muted">
                  {labelOf(DONOR_TYPES, d.type)} · {fmt(d.trees_planted)} trees
                </span>
                <ConfirmButton action={setLeaderboardVisibility.bind(null, d.id, true)} variant="plain">
                  <Eye size={18} /> Show · दाखवा
                </ConfirmButton>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
