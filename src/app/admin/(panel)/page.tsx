import type { Metadata } from "next";
import Link from "next/link";
import { Badge, ButtonLink, Card, Empty, PageHeader, PrivateTag } from "@/components/admin/ui";
import { Coins, ImageIcon, Plus, Recycle, Sprout, Tree, Users } from "@/components/icons";
import { requireAdmin } from "@/lib/admin/auth";
import { fmt, labelOf, rupees, shortDate, WASTE_TYPES } from "@/lib/admin/labels";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase, email } = await requireAdmin();
  const [{ data: totalsRows }, { data: publicStats }, { data: recent }, { data: plantings }] = await Promise.all([
    supabase.rpc("admin_dashboard_totals"),
    supabase.from("public_site_stats").select("*").maybeSingle(),
    supabase
      .from("contributions")
      .select("id, contributed_on, kg, trees_planted, amount_rs, waste_type, donors(name)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("plantings").select("id, title_mr, place_mr, planted_on, trees_planted, published").order("created_at", { ascending: false }).limit(5),
  ]);
  const t = (Array.isArray(totalsRows) ? totalsRows[0] : totalsRows) as Record<string, number> | null;

  const cards = [
    { label: "Trees planted", mr: "लावलेली झाडे", value: fmt(t?.trees_planted), Icon: Tree, note: `${fmt(t?.plantings)} plantings` },
    { label: "Trees surviving", mr: "जगलेली झाडे", value: fmt(t?.trees_surviving), Icon: Sprout },
    { label: "Kg collected", mr: "किलो रद्दी", value: fmt(t?.waste_kg, 1), Icon: Recycle, note: `${fmt(t?.contributions)} entries` },
    { label: "Donors", mr: "देणगीदार", value: fmt(t?.donors), Icon: Users },
    { label: "Total amount received", mr: "एकूण रक्कम", value: rupees(t?.amount_rs), Icon: Coins, private: true },
    { label: "Gallery photos", mr: "फोटो", value: fmt(t?.gallery_photos), Icon: ImageIcon },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        titleMr="मुख्य पान"
        intro={<>नमस्कार! Signed in as <strong lang="en">{email}</strong>.</>}
        actions={
          <>
            <ButtonLink href="/admin/contributions">
              <Plus size={18} /> Contribution · रद्दी नोंद
            </ButtonLink>
            <ButtonLink href="/admin/plantings/new" variant="outline">
              <Plus size={18} /> Planting · वृक्षारोपण
            </ButtonLink>
          </>
        }
      />

      {!publicStats?.has_data && (
        <p className="m-0 rounded-2xl bg-note p-4 text-note-ink">
          <strong>वेबसाइटवर अजून नमुना आकडे दिसत आहेत.</strong> पहिली रद्दी नोंद किंवा वृक्षारोपण जोडल्यावर खरे आकडे दिसतील. · The website still
          shows sample numbers. They switch to real numbers after your first contribution or planting.
        </p>
      )}

      <ul className="m-0 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map(({ label, mr, value, Icon, note, private: isPrivate }) => (
          <li key={label} className={`flex flex-col gap-1 rounded-[20px] p-5 shadow-[var(--shadow-card)] ${isPrivate ? "border-2 border-[#EAD9A0] bg-note" : "bg-white"}`}>
            <span className="flex items-center justify-between gap-2">
              <Icon size={24} className="text-brand" />
              {isPrivate && <PrivateTag />}
            </span>
            <span className="font-display text-[clamp(24px,3.4vw,34px)] font-extrabold break-all text-forest-900">{value}</span>
            <span className="text-sm leading-tight font-semibold">
              <span lang="en">{label}</span> · {mr}
            </span>
            {note && <span className="text-xs text-muted">{note}</span>}
          </li>
        ))}
      </ul>

      {publicStats && (
        <Card title="What the website shows · वेबसाइटवरील आकडे">
          <p className="m-0 mb-3 text-sm text-muted">
            Auto-calculated, unless you set a manual number on{" "}
            <Link href="/admin/stats" className="font-semibold">
              Site numbers
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge>{fmt(publicStats.trees_planted)} trees planted</Badge>
            <Badge>{fmt(publicStats.trees_surviving)} surviving</Badge>
            <Badge>{fmt(publicStats.waste_kg)} kg</Badge>
            <Badge>{fmt(publicStats.donors)} donors</Badge>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={<span className="flex flex-wrap items-center gap-2">Recent contributions <PrivateTag /></span>}>
          {!recent?.length ? (
            <Empty>No contributions yet.</Empty>
          ) : (
            <ul className="m-0 flex flex-col divide-y divide-line">
              {recent.map((c) => {
                const donor = (Array.isArray(c.donors) ? c.donors[0] : c.donors) as { name?: string } | null;
                return (
                  <li key={c.id}>
                    <Link href={`/admin/contributions/${c.id}`} className="flex flex-col gap-0.5 py-2.5 text-ink no-underline hover:bg-cream">
                      <span className="font-semibold text-forest-900">{donor?.name ?? "—"}</span>
                      <span className="text-sm text-muted">
                        {shortDate(c.contributed_on)} · {labelOf(WASTE_TYPES, c.waste_type)} · {fmt(c.kg, 1)} kg · {fmt(c.trees_planted)} trees
                        {c.amount_rs != null && ` · ${rupees(c.amount_rs)}`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href="/admin/contributions" className="mt-3 inline-block font-semibold">
            All contributions →
          </Link>
        </Card>

        <Card title="Recent plantings">
          {!plantings?.length ? (
            <Empty>No plantings yet.</Empty>
          ) : (
            <ul className="m-0 flex flex-col divide-y divide-line">
              {plantings.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/plantings/${p.id}`} className="flex flex-col gap-0.5 py-2.5 text-ink no-underline hover:bg-cream">
                    <span className="font-semibold text-forest-900">
                      {p.title_mr} {!p.published && <Badge tone="note">Draft</Badge>}
                    </span>
                    <span className="text-sm text-muted">
                      {shortDate(p.planted_on)} · {p.place_mr} · {fmt(p.trees_planted)} trees
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/plantings" className="mt-3 inline-block font-semibold">
            All plantings →
          </Link>
        </Card>
      </div>
    </>
  );
}
