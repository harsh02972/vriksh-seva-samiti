"use client";

import { AdminForm, Checkbox, SelectInput, TextInput } from "@/components/admin/forms";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { FormState } from "@/lib/admin/forms";
import { GALLERY_CATEGORIES } from "@/lib/admin/labels";

type Action = (state: FormState, fd: FormData) => Promise<FormState>;

export type PhotoDetails = {
  caption_mr?: string;
  place_mr?: string | null;
  taken_on?: string | null;
  category?: string;
  show_on_home?: boolean;
  published?: boolean;
};

function DetailFields({ values, today }: { values?: PhotoDetails; today?: string }) {
  return (
    <>
      <TextInput name="caption_mr" label="Caption · माहिती" defaultValue={values?.caption_mr} hint="उदा. नव्या रोपांना सकाळचे पाणी" />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextInput name="place_mr" label="Place · ठिकाण" defaultValue={values?.place_mr} />
        <TextInput name="taken_on" type="date" label="Date · तारीख" defaultValue={values?.taken_on ?? today} />
        <SelectInput name="category" label="Category · प्रकार" defaultValue={values?.category} options={[...GALLERY_CATEGORIES]} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox name="show_on_home" label="Show on Home · मुख्य पानावर" defaultChecked={values?.show_on_home ?? false} />
        <Checkbox name="published" label="Show in gallery · गॅलरीत दाखवा" defaultChecked={values?.published ?? true} />
      </div>
    </>
  );
}

export function AddPhotosForm({ action, today }: { action: Action; today: string }) {
  return (
    <AdminForm action={action} resetOnSuccess submitLabel="Add to gallery · जोडा" key="add">
      <ImageUploader
        name="photos"
        label="Photos · फोटो"
        folder="gallery"
        max={40}
        hint="एकाच वेळी अनेक फोटो निवडता येतात; खालील माहिती सर्वांना लागू होईल. · Pick several photos at once; the details below apply to all of them (you can edit each one later)."
      />
      <DetailFields today={today} />
    </AdminForm>
  );
}

export function EditPhotoForm({ action, values }: { action: Action; values: PhotoDetails }) {
  return (
    <AdminForm action={action}>
      <DetailFields values={values} />
    </AdminForm>
  );
}
