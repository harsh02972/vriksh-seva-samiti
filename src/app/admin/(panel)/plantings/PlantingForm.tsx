"use client";

import { useMemo, useState } from "react";
import { AdminForm, Checkbox, inputClass, SelectInput, TextArea, TextInput } from "@/components/admin/forms";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MapPin, Search } from "@/components/icons";
import type { FormState } from "@/lib/admin/forms";
import { SURVIVAL_STATUSES } from "@/lib/admin/labels";
import type { UploadedImage } from "@/lib/admin/upload";

export type PlantingValues = {
  title_mr?: string;
  place_mr?: string;
  latitude?: number | null;
  longitude?: number | null;
  planted_on?: string;
  trees_planted?: number;
  trees_surviving?: number | null;
  survival_status?: string;
  species_mr?: string[];
  partner_mr?: string | null;
  care_note_mr?: string | null;
  published?: boolean;
  photos?: UploadedImage[];
  donor_ids?: string[];
};

export function PlantingForm({
  action,
  values = { published: true, survival_status: "healthy" },
  donors,
  today,
  submitLabel,
}: {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  values?: PlantingValues;
  donors: { id: string; name: string }[];
  today: string;
  submitLabel?: string;
}) {
  return (
    <AdminForm action={action} submitLabel={submitLabel}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput name="title_mr" label="Title · शीर्षक" defaultValue={values.title_mr} hint="उदा. स्वातंत्र्य दिन — शाळेत वृक्षारोपण" />
        <TextInput name="planted_on" type="date" label="Date · तारीख" defaultValue={values.planted_on ?? today} />
        <TextInput name="place_mr" label="Place in Wardha · ठिकाण" defaultValue={values.place_mr} hint="उदा. पवित्रधाम टेकडी, सिंदी (मेघे)" />
        <TextInput name="trees_planted" type="number" label="Trees planted · लावलेली झाडे" defaultValue={values.trees_planted} />
      </div>

      <MapFields latitude={values.latitude} longitude={values.longitude} />

      <TextInput
        name="species"
        label="Tree species · झाडांच्या जाती"
        defaultValue={values.species_mr?.join(", ")}
        hint="स्वल्पविरामाने वेगळे करा · Separate with commas, e.g. कडुनिंब, वड, पिंपळ"
      />

      <ImageUploader
        name="photos"
        label="Photos · फोटो"
        folder="plantings"
        initial={values.photos}
        hint="The first photo is the main one. Photos are compressed automatically. Up to 20."
      />

      <div className="grid gap-4 rounded-2xl bg-cream p-4 sm:grid-cols-2">
        <TextInput
          name="trees_surviving"
          type="number"
          label="Trees surviving now · जगलेली झाडे"
          defaultValue={values.trees_surviving}
          hint="Leave empty if not checked yet. A survival check (below, after saving) updates this automatically."
        />
        <SelectInput name="survival_status" label="Status · स्थिती" defaultValue={values.survival_status} options={[...SURVIVAL_STATUSES]} />
        <TextArea name="care_note_mr" label="Care note · संगोपन नोंद" defaultValue={values.care_note_mr} rows={2} className="sm:col-span-2" />
      </div>

      <DonorPicker donors={donors} selected={values.donor_ids ?? []} />
      <TextInput
        name="partner_mr"
        label="Partner shown on the website (optional) · सहभाग"
        defaultValue={values.partner_mr}
        hint="Leave empty to show the linked donors' names."
      />

      <Checkbox
        name="published"
        label="Show on the website · वेबसाइटवर दाखवा"
        hint="Untick to keep it as a draft."
        defaultChecked={values.published ?? true}
      />
    </AdminForm>
  );
}

function MapFields({ latitude, longitude }: { latitude?: number | null; longitude?: number | null }) {
  const [lat, setLat] = useState(latitude?.toString() ?? "");
  const [lng, setLng] = useState(longitude?.toString() ?? "");
  const [status, setStatus] = useState("");

  function locate() {
    if (!navigator.geolocation) return setStatus("Location is not available on this device.");
    setStatus("Finding your location… · स्थान शोधत आहे…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setStatus(`✔ Location set (±${Math.round(pos.coords.accuracy)} m)`);
      },
      () => setStatus("Could not get the location. Allow location access, or paste it from Google Maps."),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  return (
    <fieldset className="m-0 flex flex-col gap-3 rounded-2xl border-2 border-line p-4">
      <legend className="px-1 font-semibold text-forest-900">Map location (optional) · नकाशावरील स्थान</legend>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Latitude</span>
          <input name="latitude" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="20.7453" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Longitude</span>
          <input name="longitude" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="78.6022" className={inputClass} />
        </label>
        <button type="button" onClick={locate} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-brand px-4 font-semibold text-brand hover:bg-mint">
          <MapPin size={20} /> Use my location
        </button>
      </div>
      <p className="m-0 text-sm text-muted" aria-live="polite">
        {status || "At the planting site? Tap “Use my location”. Or in Google Maps, long-press the spot and copy the numbers."}
      </p>
    </fieldset>
  );
}

function DonorPicker({ donors, selected }: { donors: { id: string; name: string }[]; selected: string[] }) {
  const [q, setQ] = useState("");
  const [chosen, setChosen] = useState(() => new Set(selected));
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? donors.filter((d) => d.name.toLowerCase().includes(needle) || chosen.has(d.id)) : donors;
  }, [q, donors, chosen]);

  return (
    <fieldset className="m-0 flex flex-col gap-3 rounded-2xl border-2 border-line p-4">
      <legend className="px-1 font-semibold text-forest-900">
        Donors who helped · सहभागी देणगीदार {chosen.size > 0 && <span className="text-brand">({chosen.size})</span>}
      </legend>
      {[...chosen].map((id) => (
        <input key={id} type="hidden" name="donor_ids" value={id} />
      ))}
      {donors.length === 0 ? (
        <p className="m-0 text-sm text-muted">No donors yet. Add donors first, then link them here.</p>
      ) : (
        <>
          <label className="relative">
            <span className="sr-only">Search donors</span>
            <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search · शोधा" className={`${inputClass} pl-10`} />
          </label>
          <ul className="m-0 grid max-h-[240px] gap-1 overflow-y-auto sm:grid-cols-2">
            {shown.map((d) => (
              <li key={d.id}>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-lg px-2 hover:bg-cream">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-brand"
                    checked={chosen.has(d.id)}
                    onChange={(e) =>
                      setChosen((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(d.id);
                        else next.delete(d.id);
                        return next;
                      })
                    }
                  />
                  {d.name}
                </label>
              </li>
            ))}
          </ul>
          <p className="m-0 text-sm text-muted">Only donors visible on the leaderboard are named on the website.</p>
        </>
      )}
    </fieldset>
  );
}
