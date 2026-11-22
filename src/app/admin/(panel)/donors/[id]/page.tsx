import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/forms";
import { Badge, Card, Empty, PageHeader, PrivateTag } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { fmt, labelOf, rupees, shortDate, todayIST, WASTE_TYPES } from "@/lib/admin/labels";
import { ContributionForm } from "../../contributions/ContributionForm";
import { createContribution, deleteDonor, updateDonor } from "../actions";
import { DonorForm } from "../DonorForm";

export const metadata: Metadata = { title: "Edit donor" };

export default async function DonorPage({ params, searchParams }: PageProps<"/admin/donors/[id]">) {
  const { supabase } = await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [{ data: donor }, { data: contributions }] = await Promise.all([
    supabase.from("donors").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("contributions")
      .select("id, contributed_on, waste_type, kg, amount_rs, trees_planted, notes")
      .eq("donor_id", id)
      .order("contributed_on", { ascending: false }),
  ]);
  if (!donor) notFound();

  const totalAmount = (contributions ?? []).reduce((s, c) => s + Number(c.amount_rs ?? 0), 0);

  return (
    <>
      <PageHeader
        title={donor.name}
        intro={
          <span className="flex flex-wrap gap-2">
            <Badge>{fmt(donor.trees_planted)} trees</Badge>
            <Badge tone="grey">{fmt(donor.waste_kg, 1)} kg</Badge>
            <Badge tone="grey">{(contributions ?? []).length} contributions</Badge>
            {!donor.show_on_leaderboard && <Badge tone="note">Hidden from leaderboard</Badge>}
          </span>
        }
        back={{ href: "/admin/donors", label: "All donors · सर्व देणगीदार" }}
      />
      {sp.created && <p className="m-0 rounded-xl bg-mint p-3 font-semibold text-brand">देणगीदार जोडला · Donor added. Now add their contribution below.</p>}

      <Card title="Add contribution · रद्दी नोंद जोडा">
        <ContributionForm
          action={createContribution}
          donors={[]}
          values={{ donor_id: donor.id }}
          lockDonor
          today={todayIST()}
          resetOnSuccess
          submitLabel="Add contribution · जोडा"
        />
      </Card>

      <Card title="Contributions · नोंदी">
        {!contributions?.length ? (
          <Empty>No contributions yet. · अजून नोंद नाही.</Empty>
        ) : (
          <>
            <p className="m-0 mb-3 flex items-center gap-2 text-sm text-muted">
              Total received: <strong className="text-ink">{rupees(totalAmount)}</strong> <PrivateTag />
            </p>
            <ul className="m-0 flex flex-col divide-y divide-line">
              {contributions.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/contributions/${c.id}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-ink no-underline hover:bg-cream sm:px-2"
                  >
                    <span className="w-28 font-semibold">{shortDate(c.contributed_on)}</span>
                    <span className="flex-1 text-muted">{labelOf(WASTE_TYPES, c.waste_type)}</span>
                    <span>{fmt(c.kg, 1)} kg</span>
                    <span className="font-semibold text-brand">{fmt(c.trees_planted)} trees</span>
                    <span className="text-muted">{c.amount_rs != null ? rupees(c.amount_rs) : "—"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card title="Donor details · माहिती">
        <DonorForm action={updateDonor.bind(null, donor.id)} values={donor} />
      </Card>

      <Card title="Delete · हटवा" className="border-[#F0C9BF]">
        <p className="m-0 mb-3 text-muted">
          This deletes the donor <strong>and all their contributions</strong>. To only hide the name, untick “Show on public leaderboard” instead.
        </p>
        <ConfirmButton action={deleteDonor.bind(null, donor.id)} confirmText={`Delete ${donor.name} and all their contributions? This cannot be undone.`} />
      </Card>
    </>
  );
}
