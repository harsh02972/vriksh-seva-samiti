import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/forms";
import { Badge, ButtonLink, Card, Empty, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { fmt, labelOf, shortDate, SURVIVAL_STATUSES, todayIST } from "@/lib/admin/labels";
import { deletePlanting, deleteSurvivalUpdate, updatePlanting } from "../actions";
import { PlantingForm } from "../PlantingForm";
import { SurvivalUpdateForm } from "./SurvivalUpdateForm";

export const metadata: Metadata = { title: "Edit planting" };

export default async function PlantingPage({ params, searchParams }: PageProps<"/admin/plantings/[id]">) {
  const { supabase } = await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [{ data: p }, { data: photos }, { data: links }, { data: updates }, { data: donors }] = await Promise.all([
    supabase.from("plantings").select("*").eq("id", id).maybeSingle(),
    supabase.from("planting_photos").select("storage_path, width, height, alt_mr").eq("planting_id", id).order("sort_order"),
    supabase.from("planting_donors").select("donor_id").eq("planting_id", id),
    supabase.from("planting_updates").select("*").eq("planting_id", id).order("checked_on", { ascending: false }),
    supabase.from("donors").select("id, name").order("name").limit(2000),
  ]);
  if (!p) notFound();

  return (
    <>
      <PageHeader
        title={p.title_mr}
        intro={
          <span className="flex flex-wrap gap-2">
            <Badge>{fmt(p.trees_planted)} planted</Badge>
            <Badge tone="grey">{p.trees_surviving == null ? "survival not checked" : `${fmt(p.trees_surviving)} surviving`}</Badge>
            {!p.published && <Badge tone="note">Draft — not on the website</Badge>}
          </span>
        }
        back={{ href: "/admin/plantings", label: "All plantings · सर्व" }}
        actions={<ButtonLink href="/our-work" external variant="outline">View on website ↗</ButtonLink>}
      />
      {sp.created && <p className="m-0 rounded-xl bg-mint p-3 font-semibold text-brand">वृक्षारोपण जतन झाले · Planting saved and live on the website.</p>}

      <Card title="Survival check · पाहणी नोंद">
        <p className="m-0 mb-4 text-muted">
          झाडांची पाहणी केल्यावर किती जगली ते नोंदवा. सर्वात नवीन नोंद वेबसाइटवर दिसते. · After checking the trees, record how many survive. The newest
          check is what the website shows.
        </p>
        <SurvivalUpdateForm plantingId={p.id} today={todayIST()} max={p.trees_planted} />
        {updates && updates.length > 0 && (
          <ul className="m-0 mt-5 flex flex-col divide-y divide-line">
            {updates.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <span className="w-28 font-semibold">{shortDate(u.checked_on)}</span>
                <span className="flex-1">
                  {fmt(u.trees_surviving)} / {fmt(p.trees_planted)} · {labelOf(SURVIVAL_STATUSES, u.status)}
                  {u.note_mr && <span className="block text-sm text-muted">{u.note_mr}</span>}
                </span>
                <ConfirmButton action={deleteSurvivalUpdate.bind(null, u.id)} confirmText="Delete this check?" variant="plain">
                  Delete
                </ConfirmButton>
              </li>
            ))}
          </ul>
        )}
        {!updates?.length && <div className="mt-4"><Empty>No checks recorded yet.</Empty></div>}
      </Card>

      <Card title="Details & photos · माहिती व फोटो">
        <PlantingForm
          action={updatePlanting.bind(null, p.id)}
          donors={donors ?? []}
          today={todayIST()}
          values={{
            ...p,
            photos: (photos ?? []).map((ph) => ({ path: ph.storage_path, width: ph.width, height: ph.height, alt: ph.alt_mr })),
            donor_ids: (links ?? []).map((l) => l.donor_id),
          }}
        />
      </Card>

      <Card title="Delete · हटवा" className="border-[#F0C9BF]">
        <p className="m-0 mb-3 text-muted">Deletes this planting, its photos and its survival checks. To hide it instead, untick “Show on the website”.</p>
        <ConfirmButton action={deletePlanting.bind(null, p.id)} confirmText={`Delete “${p.title_mr}” and its photos? This cannot be undone.`} />
      </Card>
    </>
  );
}
