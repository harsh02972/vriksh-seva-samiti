"use client";

import { useState } from "react";
import { AdminForm, Field, inputClass, SelectInput, TextArea, TextInput } from "@/components/admin/forms";
import { PrivateTag } from "@/components/admin/ui";
import type { FormState } from "@/lib/admin/forms";
import { DONOR_TYPES, WASTE_TYPES } from "@/lib/admin/labels";

export type ContributionValues = {
  donor_id?: string;
  contributed_on?: string;
  waste_type?: string;
  kg?: number | string;
  amount_rs?: number | string | null;
  trees_planted?: number | string;
  notes?: string | null;
};

export function ContributionForm({
  action,
  donors,
  values,
  today,
  lockDonor = false,
  resetOnSuccess = false,
  submitLabel,
}: {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  donors: { id: string; name: string; type: string }[];
  values?: ContributionValues;
  today: string;
  lockDonor?: boolean;
  resetOnSuccess?: boolean;
  submitLabel?: string;
}) {
  const [donorId, setDonorId] = useState(values?.donor_id ?? "");
  const isNew = !lockDonor && donorId === "";

  return (
    <AdminForm action={action} resetOnSuccess={resetOnSuccess} submitLabel={submitLabel}>
      {lockDonor ? (
        <input type="hidden" name="donor_id" value={values?.donor_id ?? ""} />
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl bg-cream p-4">
          <Field name="donor_id" label="Donor · देणगीदार" hint="यादीत नाही? “+ New donor” निवडा · Not in the list? Choose “+ New donor”.">
            {(p) => (
              <select
                {...p}
                name="donor_id"
                value={donorId}
                onChange={(e) => setDonorId(e.target.value)}
                className={inputClass}
              >
                <option value="">+ New donor · नवीन देणगीदार</option>
                {donors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          {isNew && (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput name="new_donor_name" label="New donor name · नवीन नाव" />
              <SelectInput name="new_donor_type" label="Type · प्रकार" options={[...DONOR_TYPES]} defaultValue="individual" />
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TextInput name="contributed_on" type="date" label="Date · तारीख" defaultValue={values?.contributed_on ?? today} />
        <SelectInput name="waste_type" label="Waste type · रद्दीचा प्रकार" defaultValue={values?.waste_type ?? "paper"} options={[...WASTE_TYPES]} />
        <TextInput name="kg" type="number" inputMode="decimal" label="Kg collected · किलो" defaultValue={values?.kg} />
        <TextInput
          name="trees_planted"
          type="number"
          label="Trees planted from it · झाडे"
          defaultValue={values?.trees_planted ?? 0}
          hint="Adds to this donor's leaderboard total"
        />
        <TextInput
          name="amount_rs"
          type="number"
          inputMode="decimal"
          label={
            <span className="flex flex-wrap items-center gap-2">
              Amount received ₹ · रक्कम <PrivateTag />
            </span>
          }
          defaultValue={values?.amount_rs}
          hint="Private. Never shown on the website."
        />
      </div>
      <TextArea name="notes" label="Notes · नोंद (admin only)" defaultValue={values?.notes} rows={2} />
    </AdminForm>
  );
}
