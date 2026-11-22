import type { Metadata } from "next";
import { StatsForm } from "./StatsForm";
import { Card, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Site numbers" };

export default async function StatsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: overrides }, { data: stats }] = await Promise.all([
    supabase.from("site_stats").select("*").eq("id", 1).maybeSingle(),
    supabase.rpc("site_stats_public"),
  ]);
  const s = (Array.isArray(stats) ? stats[0] : stats) as Record<string, number | boolean | null> | null;

  return (
    <>
      <PageHeader
        title="Site numbers"
        titleMr="वेबसाइटवरील आकडे"
        intro="हे आकडे नोंदींमधून आपोआप मोजले जातात. जुन्या कामाचे आकडे जोडायचे असतील तर स्वतःचा आकडा लिहा; रिकामे ठेवल्यास आपोआप. · Numbers are calculated from your entries. Type a number to override one (e.g. to include older work recorded on paper); leave it empty to go back to automatic."
      />
      <Card>
        <StatsForm
          overrides={overrides ?? {}}
          auto={{
            trees_planted: Number(s?.auto_trees_planted ?? 0),
            trees_surviving: Number(s?.auto_trees_surviving ?? 0),
            waste_kg: Number(s?.auto_waste_kg ?? 0),
            donors: Number(s?.auto_donors ?? 0),
            next_milestone: Number(s?.next_milestone ?? 0),
          }}
        />
      </Card>
    </>
  );
}
