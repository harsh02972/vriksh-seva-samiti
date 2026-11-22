import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink, Card, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { CONTENT_KEYS, PAGE_TEXTS, type ContentKey, type FieldDef } from "@/lib/page-text";
import { saveContent } from "../actions";
import { ContentForm, type FieldSpec } from "../ContentForm";

export const metadata: Metadata = { title: "Edit page text" };

export default async function ContentEditPage({ params }: PageProps<"/admin/content/[key]">) {
  const { supabase } = await requireAdmin();
  const { key } = await params;
  if (!CONTENT_KEYS.includes(key as ContentKey)) notFound();
  const k = key as ContentKey;
  const page = PAGE_TEXTS[k];
  const { data: row } = await supabase.from("site_content").select("value").eq("key", k).maybeSingle();

  const fields: FieldSpec[] = Object.entries(page.fields as Record<string, FieldDef>).map(([name, def]) => ({
    name,
    kind: def.kind,
    label: def.label,
    group: def.group,
    help: def.help,
    ...(def.kind === "image" ? { defaultImage: { src: def.default.src, alt: def.default.alt } } : { defaultText: def.default }),
  }));

  return (
    <>
      <PageHeader
        title={page.titleEn}
        back={{ href: "/admin/content", label: "All pages · सर्व पाने" }}
        actions={
          <ButtonLink href={page.path} external variant="outline">
            View page ↗
          </ButtonLink>
        }
      />
      <Card>
        <ContentForm action={saveContent.bind(null, k)} fields={fields} stored={(row?.value as Record<string, unknown>) ?? {}} />
      </Card>
    </>
  );
}
