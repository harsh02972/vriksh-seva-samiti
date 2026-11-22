import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, Empty, LoadError, PageHeader } from "@/components/admin/ui";
import { Search } from "@/components/icons";
import { requireAdmin } from "@/lib/admin/auth";
import { DONOR_TYPES, fmt, labelOf } from "@/lib/admin/labels";
import { createDonor } from "./actions";
import { DonorForm } from "./DonorForm";

export const metadata: Metadata = { title: "Donors" };

export default async function DonorsPage({ searchParams }: PageProps<"/admin/donors">) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const type = typeof params.type === "string" ? params.type : "";

  let query = supabase
    .from("donors")
    .select("id, name, type, area, trees_planted, waste_kg, show_on_leaderboard")
    .order("trees_planted", { ascending: false })
    .order("name");
  if (q) query = query.or(`name.ilike.%${q.replace(/[%,()]/g, " ")}%,search_alias.ilike.%${q.replace(/[%,()]/g, " ")}%`);
  if (DONOR_TYPES.some((t) => t.value === type)) query = query.eq("type", type);
  const { data: donors, error } = await query.limit(500);

  return (
    <>
      <PageHeader
        title="Donors"
        titleMr="देणगीदार"
        intro="शाळा, महाविद्यालये, संस्था आणि व्यक्ती. झाडे व किलो आपोआप रद्दी नोंदींमधून मोजले जातात. · Trees and kg are added up automatically from contributions."
      />
      {params.deleted && <p className="m-0 rounded-xl bg-mint p-3 font-semibold text-brand">देणगीदार हटवला · Donor deleted.</p>}

      <details className="group rounded-[20px] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <summary className="cursor-pointer list-none font-display text-xl font-bold text-forest-900 marker:hidden">
          + Add a donor · नवीन देणगीदार
        </summary>
        <div className="mt-4">
          <DonorForm action={createDonor} submitLabel="Add donor · जोडा" />
        </div>
      </details>

      <Card>
        <form className="mb-4 flex flex-col gap-3 sm:flex-row" role="search">
          <label className="relative flex-1">
            <span className="sr-only">Search donors</span>
            <Search size={20} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
            <input
              name="q"
              defaultValue={q}
              placeholder="नाव शोधा · Search name"
              className="min-h-[48px] w-full rounded-xl border-2 border-line pr-3 pl-11 outline-none focus:border-brand"
            />
          </label>
          <select name="type" defaultValue={type} className="min-h-[48px] rounded-xl border-2 border-line px-3 outline-none focus:border-brand">
            <option value="">All types · सर्व</option>
            {DONOR_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button type="submit" className="min-h-[48px] rounded-full bg-brand px-6 font-bold text-white">
            Search
          </button>
        </form>

        {error ? (
          <LoadError what="donors" />
        ) : !donors?.length ? (
          <Empty>{q || type ? "No donors match. · काहीही सापडले नाही." : "No donors yet. Add the first one above. · अजून कोणी नाही."}</Empty>
        ) : (
          <ul className="m-0 flex flex-col divide-y divide-line">
            {donors.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/admin/donors/${d.id}`}
                  className="flex flex-col gap-1 py-3 text-ink no-underline hover:bg-cream sm:flex-row sm:items-center sm:gap-4 sm:px-2"
                >
                  <span className="flex-1 font-semibold text-forest-900">
                    {d.name}
                    {d.area && <span className="ml-2 text-sm font-normal text-muted">{d.area}</span>}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge tone="grey">{labelOf(DONOR_TYPES, d.type)}</Badge>
                    <Badge>{fmt(d.trees_planted)} trees</Badge>
                    <Badge tone="grey">{fmt(d.waste_kg, 1)} kg</Badge>
                    {!d.show_on_leaderboard && <Badge tone="note">Hidden</Badge>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
