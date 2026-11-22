import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin/forms";
import { Badge, Card, Empty, LoadError, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { fmt, shortDate } from "@/lib/admin/labels";
import { createCampaign, setCampaignActive } from "./actions";
import { CampaignForm } from "./CampaignForm";

export const metadata: Metadata = { title: "Campaigns" };

export default async function CampaignsPage({ searchParams }: PageProps<"/admin/campaigns">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data: rows, error } = await supabase.from("campaigns").select("*").order("start_date", { ascending: false });

  return (
    <>
      <PageHeader
        title="Campaigns"
        titleMr="मोहीम"
        intro="सक्रिय मोहीम वेबसाइटवर लक्ष्य आणि प्रगतीसह दिसते. कोणतीही सक्रिय नसल्यास तो भाग लपतो. · The active campaign is shown with its target and progress. With none active, the section is hidden."
      />
      {sp.deleted && <p className="m-0 rounded-xl bg-mint p-3 font-semibold text-brand">मोहीम हटवली · Campaign deleted.</p>}

      <Card title="All campaigns · सर्व">
        {error ? (
          <LoadError what="campaigns" />
        ) : !rows?.length ? (
          <Empty>No campaigns yet. Until you add one, the website shows the sample campaign.</Empty>
        ) : (
          <ul className="m-0 flex flex-col divide-y divide-line">
            {rows.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
                <Link href={`/admin/campaigns/${c.id}`} className="flex min-w-0 flex-1 flex-col no-underline">
                  <span className="font-semibold text-forest-900">
                    {c.title_en} {c.year_label_mr && <span className="font-normal text-muted">· {c.year_label_mr}</span>}
                  </span>
                  <span className="text-sm text-muted">
                    {shortDate(c.start_date)} – {shortDate(c.end_date)} · target {fmt(c.tree_target)}
                  </span>
                </Link>
                {c.active ? <Badge>Active</Badge> : <Badge tone="grey">Off</Badge>}
                <ConfirmButton action={setCampaignActive.bind(null, c.id, !c.active)} variant="plain">
                  {c.active ? "Switch off" : "Make active"}
                </ConfirmButton>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <details className="rounded-[20px] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6" open={!rows?.length}>
        <summary className="cursor-pointer font-display text-xl font-bold text-forest-900">+ New campaign · नवीन मोहीम</summary>
        <div className="mt-4">
          <CampaignForm action={createCampaign} submitLabel="Add campaign · जोडा" />
        </div>
      </details>
    </>
  );
}
