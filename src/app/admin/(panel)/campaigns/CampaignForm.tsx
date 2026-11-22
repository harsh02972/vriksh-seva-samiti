"use client";

import { AdminForm, Checkbox, TextArea, TextInput } from "@/components/admin/forms";
import type { FormState } from "@/lib/admin/forms";

export type CampaignValues = {
  title_en?: string;
  year_label_mr?: string;
  description_mr?: string;
  start_date?: string;
  end_date?: string;
  tree_target?: number;
  trees_planted_override?: number | null;
  active?: boolean;
};

export function CampaignForm({
  action,
  values,
  autoTrees,
  submitLabel,
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  values?: CampaignValues;
  autoTrees?: number;
  submitLabel?: string;
}) {
  return (
    <AdminForm action={action} submitLabel={submitLabel}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput name="title_en" label="Title (English)" defaultValue={values?.title_en ?? "Current Campaign"} />
        <TextInput name="year_label_mr" label="Label · लेबल" defaultValue={values?.year_label_mr} hint="उदा. पावसाळा २०२६" />
        <TextInput name="start_date" type="date" label="Start · सुरुवात" defaultValue={values?.start_date} />
        <TextInput name="end_date" type="date" label="End · शेवट" defaultValue={values?.end_date} />
        <TextInput name="tree_target" type="number" label="Tree target · लक्ष्य" defaultValue={values?.tree_target ?? 0} />
        <TextInput
          name="trees_planted_override"
          type="number"
          label="Trees planted (manual, optional)"
          defaultValue={values?.trees_planted_override}
          hint={
            autoTrees != null
              ? `Leave empty to count automatically from plantings between the dates (now ${autoTrees}).`
              : "Leave empty to count automatically from plantings between the dates."
          }
        />
      </div>
      <TextArea name="description_mr" label="Description · माहिती" defaultValue={values?.description_mr} rows={3} />
      <Checkbox
        name="active"
        label="Show on the website now · सध्याची मोहीम"
        hint="Only one campaign can be active. Turning this on switches the others off."
        defaultChecked={values?.active ?? false}
      />
    </AdminForm>
  );
}
