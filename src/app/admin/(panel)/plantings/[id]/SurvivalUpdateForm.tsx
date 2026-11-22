"use client";

import { AdminForm, SelectInput, TextInput } from "@/components/admin/forms";
import { SURVIVAL_STATUSES } from "@/lib/admin/labels";
import { addSurvivalUpdate } from "../actions";

export function SurvivalUpdateForm({ plantingId, today, max }: { plantingId: string; today: string; max: number }) {
  return (
    <AdminForm action={addSurvivalUpdate.bind(null, plantingId)} resetOnSuccess submitLabel="Save check · नोंद करा">
      <div className="grid gap-4 sm:grid-cols-3">
        <TextInput name="checked_on" type="date" label="Checked on · पाहणी तारीख" defaultValue={today} />
        <TextInput name="trees_surviving" type="number" label={`Trees alive · जगलेली (max ${max})`} />
        <SelectInput name="status" label="Status · स्थिती" options={[...SURVIVAL_STATUSES]} />
      </div>
      <TextInput name="note_mr" label="Note (optional) · नोंद" hint="उदा. उन्हाळ्यात ५ झाडे पुन्हा लावली" />
    </AdminForm>
  );
}
