import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/forms";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteCampaign, updateCampaign } from "../actions";
import { CampaignForm } from "../CampaignForm";

export const metadata: Metadata = { title: "Edit campaign" };

export default async function CampaignPage({ params, searchParams }: PageProps<"/admin/campaigns/[id]">) {
  const { supabase } = await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { data: c } = await supabase.from("campaigns").select("*").eq("id", id).maybeSingle();
  if (!c) notFound();
  const { data: auto } = await supabase.rpc("campaign_trees", { p_start: c.start_date, p_end: c.end_date });

  return (
    <>
      <PageHeader
        title={c.title_en}
        intro={c.active ? <Badge>Active — shown on the website</Badge> : <Badge tone="grey">Not shown</Badge>}
        back={{ href: "/admin/campaigns", label: "All campaigns · सर्व" }}
      />
      {sp.created && <p className="m-0 rounded-xl bg-mint p-3 font-semibold text-brand">मोहीम जोडली · Campaign added.</p>}
      <Card>
        <CampaignForm action={updateCampaign.bind(null, c.id)} values={c} autoTrees={typeof auto === "number" ? auto : undefined} />
      </Card>
      <Card title="Delete · हटवा" className="border-[#F0C9BF]">
        <ConfirmButton action={deleteCampaign.bind(null, c.id)} confirmText={`Delete “${c.title_en}”?`} />
      </Card>
    </>
  );
}
