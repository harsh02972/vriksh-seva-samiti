import type { Metadata } from "next";
import Link from "next/link";
import { Card, Empty, LoadError, PageHeader, PrivateTag } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { fmt, labelOf, rupees, shortDate, todayIST, WASTE_TYPES } from "@/lib/admin/labels";
import { createContribution } from "../donors/actions";
import { ContributionForm } from "./ContributionForm";

export const metadata: Metadata = { title: "Contributions" };

const PAGE_SIZE = 50;

export default async function ContributionsPage({ searchParams }: PageProps<"/admin/contributions">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const [{ data: donors }, { data: rows, error, count }] = await Promise.all([
    supabase.from("donors").select("id, name, type").order("name").limit(2000),
    supabase
      .from("contributions")
      .select("id, contributed_on, waste_type, kg, amount_rs, trees_planted, donors(name)", { count: "exact" })
      .order("contributed_on", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1),
  ]);
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Contributions"
        titleMr="रद्दी नोंदी"
        intro="प्रत्येक वेळी रद्दी मिळाल्यावर येथे नोंद करा. देणगीदाराची झाडे व लीडरबोर्ड आपोआप अपडेट होतात. · Add an entry each time waste is received. The donor's trees and the leaderboard update automatically."
      />

      <Card title="Add contribution · नवीन नोंद">
        <ContributionForm
          action={createContribution}
          donors={(donors ?? []) as { id: string; name: string; type: string }[]}
          today={todayIST()}
          resetOnSuccess
          submitLabel="Add contribution · जोडा"
        />
      </Card>

      <Card title={<span className="flex flex-wrap items-center gap-2">All contributions · सर्व नोंदी <PrivateTag /></span>}>
        {error ? (
          <LoadError what="contributions" />
        ) : !rows?.length ? (
          <Empty>No contributions yet. · अजून नोंद नाही.</Empty>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-line text-sm text-muted">
                  <th className="px-2 py-2 font-semibold">Date</th>
                  <th className="px-2 py-2 font-semibold">Donor</th>
                  <th className="px-2 py-2 font-semibold">Type</th>
                  <th className="px-2 py-2 text-right font-semibold">Kg</th>
                  <th className="px-2 py-2 text-right font-semibold">Trees</th>
                  <th className="px-2 py-2 text-right font-semibold">Amount</th>
                  <th className="px-2 py-2"><span className="sr-only">Edit</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const donor = (Array.isArray(c.donors) ? c.donors[0] : c.donors) as { name?: string } | null;
                  return (
                    <tr key={c.id} className="border-b border-line">
                      <td className="px-2 py-2.5 whitespace-nowrap">{shortDate(c.contributed_on)}</td>
                      <td className="px-2 py-2.5 font-semibold text-forest-900">{donor?.name ?? "—"}</td>
                      <td className="px-2 py-2.5 text-muted">{labelOf(WASTE_TYPES, c.waste_type)}</td>
                      <td className="px-2 py-2.5 text-right">{fmt(c.kg, 1)}</td>
                      <td className="px-2 py-2.5 text-right font-semibold text-brand">{fmt(c.trees_planted)}</td>
                      <td className="px-2 py-2.5 text-right whitespace-nowrap text-muted">{c.amount_rs != null ? rupees(c.amount_rs) : "—"}</td>
                      <td className="px-2 py-2.5 text-right">
                        <Link href={`/admin/contributions/${c.id}`} className="font-semibold">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <nav aria-label="Pages" className="mt-4 flex items-center justify-between gap-3">
            {page > 1 ? <Link href={`?page=${page - 1}`}>← Newer</Link> : <span />}
            <span className="text-sm text-muted">
              Page {page} of {pages}
            </span>
            {page < pages ? <Link href={`?page=${page + 1}`}>Older →</Link> : <span />}
          </nav>
        )}
      </Card>
    </>
  );
}
