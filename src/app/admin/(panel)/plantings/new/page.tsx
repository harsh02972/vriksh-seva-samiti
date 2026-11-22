import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { todayIST } from "@/lib/admin/labels";
import { createPlanting } from "../actions";
import { PlantingForm } from "../PlantingForm";

export const metadata: Metadata = { title: "New planting" };

export default async function NewPlantingPage() {
  const { supabase } = await requireAdmin();
  const { data: donors } = await supabase.from("donors").select("id, name").order("name").limit(2000);
  return (
    <>
      <PageHeader title="New planting" titleMr="नवीन वृक्षारोपण" back={{ href: "/admin/plantings", label: "All plantings · सर्व" }} />
      <Card>
        <PlantingForm action={createPlanting} donors={donors ?? []} today={todayIST()} submitLabel="Save planting · जतन करा" />
      </Card>
    </>
  );
}
