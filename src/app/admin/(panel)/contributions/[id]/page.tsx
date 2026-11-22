import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/forms";
import { Card, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { todayIST } from "@/lib/admin/labels";
import { deleteContribution, updateContribution } from "../../donors/actions";
import { ContributionForm } from "../ContributionForm";

export const metadata: Metadata = { title: "Edit contribution" };

export default async function ContributionPage({ params }: PageProps<"/admin/contributions/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const [{ data: c }, { data: donors }] = await Promise.all([
    supabase.from("contributions").select("*").eq("id", id).maybeSingle(),
    supabase.from("donors").select("id, name, type").order("name").limit(2000),
  ]);
  if (!c) notFound();

  return (
    <>
      <PageHeader title="Edit contribution" titleMr="नोंद बदला" back={{ href: "/admin/contributions", label: "All contributions · सर्व नोंदी" }} />
      <Card>
        <ContributionForm
          action={updateContribution.bind(null, c.id)}
          donors={(donors ?? []) as { id: string; name: string; type: string }[]}
          values={c}
          today={todayIST()}
        />
      </Card>
      <Card title="Delete · हटवा" className="border-[#F0C9BF]">
        <p className="m-0 mb-3 text-muted">The donor&apos;s trees and the leaderboard will be recalculated.</p>
        <ConfirmButton
          action={deleteContribution.bind(null, c.id, `/admin/donors/${c.donor_id}`)}
          confirmText="Delete this contribution? This cannot be undone."
        />
      </Card>
    </>
  );
}
