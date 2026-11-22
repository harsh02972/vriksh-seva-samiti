import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { shortDate } from "@/lib/admin/labels";
import { CONTENT_KEYS, PAGE_TEXTS } from "@/lib/page-text";

export const metadata: Metadata = { title: "Page texts" };

export default async function ContentIndexPage() {
  const { supabase } = await requireAdmin();
  const { data: rows } = await supabase.from("site_content").select("key, value, updated_at");
  const byKey = new Map((rows ?? []).map((r) => [r.key as string, r]));

  return (
    <>
      <PageHeader
        title="Page texts"
        titleMr="मजकूर व संपर्क"
        intro="प्रत्येक पानावरील मजकूर, फोटो आणि संपर्क माहिती बदला. · Change the words, photos and contact details on each page."
      />
      <Card>
        <ul className="m-0 flex flex-col divide-y divide-line">
          {CONTENT_KEYS.map((key) => {
            const row = byKey.get(key);
            const edited = row ? Object.keys((row.value as object) ?? {}).length : 0;
            return (
              <li key={key}>
                <Link href={`/admin/content/${key}`} className="flex flex-wrap items-center gap-3 py-3.5 text-ink no-underline hover:bg-cream sm:px-2">
                  <span className="flex-1 font-semibold text-forest-900">{PAGE_TEXTS[key].titleEn}</span>
                  {key === "contact_details" && !edited && <Badge tone="note">Not filled in yet</Badge>}
                  {edited > 0 ? <Badge>{edited} changed</Badge> : <Badge tone="grey">Original text</Badge>}
                  {row?.updated_at && <span className="text-sm text-muted">{shortDate(row.updated_at.slice(0, 10))}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
