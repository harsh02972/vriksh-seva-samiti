"use client";

import { AdminForm, TextInput } from "@/components/admin/forms";
import { saveStats } from "./actions";

type Auto = { trees_planted: number; trees_surviving: number; waste_kg: number; donors: number; next_milestone: number };

const ROWS = [
  { name: "trees_planted_override", auto: "trees_planted", label: "Trees planted · लावलेली झाडे" },
  { name: "trees_surviving_override", auto: "trees_surviving", label: "Trees surviving · जगलेली झाडे" },
  { name: "waste_kg_override", auto: "waste_kg", label: "Kg of waste collected · किलो रद्दी" },
  { name: "donors_override", auto: "donors", label: "Donors · देणगीदार" },
] as const;

const n = (v: number) => new Intl.NumberFormat("en-IN").format(v);

export function StatsForm({ overrides, auto }: { overrides: Record<string, unknown>; auto: Auto }) {
  return (
    <AdminForm action={saveStats} submitLabel="Save numbers · जतन करा">
      <div className="grid gap-4 sm:grid-cols-2">
        {ROWS.map((r) => (
          <TextInput
            key={r.name}
            name={r.name}
            type="number"
            label={r.label}
            placeholder={`Automatic: ${n(auto[r.auto])}`}
            defaultValue={(overrides[r.name] as number | null) ?? undefined}
            hint={`Automatic now: ${n(auto[r.auto])}. Leave empty to use it.`}
          />
        ))}
        <TextInput
          name="next_milestone"
          type="number"
          label="Next tree milestone · पुढील टप्पा"
          placeholder="Automatic: next thousand"
          defaultValue={(overrides.next_milestone as number | null) ?? undefined}
          hint={`Shown as the goal on the progress bar. Now: ${n(auto.next_milestone)}.`}
        />
      </div>
    </AdminForm>
  );
}
