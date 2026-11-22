"use client";

import { AdminForm, Checkbox, SelectInput, TextArea, TextInput } from "@/components/admin/forms";
import type { FormState } from "@/lib/admin/forms";
import { DONOR_TYPES } from "@/lib/admin/labels";

export type DonorValues = {
  name?: string;
  type?: string;
  area?: string | null;
  search_alias?: string | null;
  show_on_leaderboard?: boolean;
  notes?: string | null;
};

export function DonorForm({
  action,
  values = { show_on_leaderboard: true },
  submitLabel,
}: {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  values?: DonorValues;
  submitLabel?: string;
}) {
  return (
    <AdminForm action={action} submitLabel={submitLabel}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput name="name" label="Name · नाव" defaultValue={values.name} hint="मराठीत, जसे लीडरबोर्डवर दिसावे · As it should appear on the leaderboard" required />
        <SelectInput name="type" label="Type · प्रकार" defaultValue={values.type} options={[...DONOR_TYPES]} />
        <TextInput name="area" label="Area · परिसर" defaultValue={values.area} hint="Admin only" />
        <TextInput
          name="search_alias"
          label="English spelling (optional)"
          defaultValue={values.search_alias}
          lang="en"
          hint="So visitors can search the leaderboard in English. Never shown."
        />
      </div>
      <Checkbox
        name="show_on_leaderboard"
        label="Show on public leaderboard · लीडरबोर्डवर दाखवा"
        hint="Untick if the donor does not want their name shown. Only name, type and trees are ever public."
        defaultChecked={values.show_on_leaderboard ?? true}
      />
      <TextArea name="notes" label="Notes · नोंद (admin only)" defaultValue={values.notes} rows={3} />
    </AdminForm>
  );
}
