import type { Metadata } from "next";
import Link from "next/link";
import { Badge, ButtonLink, Card, Empty, LoadError, PageHeader } from "@/components/admin/ui";
import { Plus } from "@/components/icons";
import { requireAdmin } from "@/lib/admin/auth";
import { fmt, labelOf, shortDate, SURVIVAL_STATUSES } from "@/lib/admin/labels";
import { mediaUrl } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Plantings" };

export default async function PlantingsPage({ searchParams }: PageProps<"/admin/plantings">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data: rows, error } = await supabase
    .from("plantings")
    .select("id, title_mr, place_mr, planted_on, trees_planted, trees_surviving, survival_status, published, planting_photos(storage_path, sort_order)")
    .order("planted_on", { ascending: false })
    .limit(300);

  return (
    <>
      <PageHeader
        title="Plantings"
        titleMr="वृक्षारोपण"
        intro="प्रत्येक वृक्षारोपण मोहीम — फोटो, ठिकाण, झाडे आणि किती जगली. · Every planting with photos, place, trees and survival."
        actions={
          <ButtonLink href="/admin/plantings/new">
            <Plus size={18} /> New planting · नवीन
          </ButtonLink>
        }
      />
      {sp.deleted && <p className="m-0 rounded-xl bg-mint p-3 font-semibold text-brand">वृक्षारोपण हटवले · Planting deleted.</p>}
      <Card>
        {error ? (
          <LoadError what="plantings" />
        ) : !rows?.length ? (
          <Empty>No plantings yet. Until you add one, the website shows sample plantings. · अजून नोंद नाही.</Empty>
        ) : (
          <ul className="m-0 flex flex-col divide-y divide-line">
            {rows.map((p) => {
              const photos = [...(p.planting_photos ?? [])].sort((a, b) => a.sort_order - b.sort_order);
              return (
                <li key={p.id}>
                  <Link href={`/admin/plantings/${p.id}`} className="flex items-center gap-3 py-3 text-ink no-underline hover:bg-cream sm:px-2">
                    {photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                      <img src={mediaUrl(photos[0].storage_path)} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-mint text-xs text-muted">No photo</span>
                    )}
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="font-semibold text-forest-900">
                        {p.title_mr} {!p.published && <Badge tone="note">Draft</Badge>}
                      </span>
                      <span className="text-sm text-muted">
                        {shortDate(p.planted_on)} · {p.place_mr}
                      </span>
                      <span className="flex flex-wrap gap-1.5 text-sm">
                        <Badge>{fmt(p.trees_planted)} planted</Badge>
                        <Badge tone="grey">{p.trees_surviving == null ? "not checked" : `${fmt(p.trees_surviving)} surviving`}</Badge>
                        <Badge tone="grey">{labelOf(SURVIVAL_STATUSES, p.survival_status)}</Badge>
                        <Badge tone="grey">{photos.length} photos</Badge>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
