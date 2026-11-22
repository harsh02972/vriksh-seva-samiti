"use client";

/* eslint-disable @next/next/no-img-element -- preview of the built-in photo */
import { AdminForm, TextArea, TextInput } from "@/components/admin/forms";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { FormState } from "@/lib/admin/forms";
import type { UploadedImage } from "@/lib/admin/upload";

export type FieldSpec = {
  name: string;
  kind: string;
  label: string;
  group: string;
  help?: string;
  defaultText?: string;
  defaultImage?: { src: string; alt: string };
};

type Stored = Record<string, unknown>;

const MULTILINE = new Set(["mr-long", "lines", "faq"]);
const KIND_HINT: Record<string, string> = {
  lines: "एका ओळीत एक गोष्ट · One item per line.",
  "mr-long": "नवीन ओळ = नवीन परिच्छेद · A new line starts a new paragraph.",
  en: "English",
};

export function ContentForm({
  action,
  fields,
  stored,
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  fields: FieldSpec[];
  stored: Stored;
}) {
  const groups = [...new Set(fields.map((f) => f.group))];
  return (
    <AdminForm action={action} submitLabel="Save page · जतन करा">
      {groups.map((group) => (
        <fieldset key={group} className="m-0 flex flex-col gap-4 rounded-2xl border-2 border-line p-4 sm:p-5">
          <legend className="px-1 font-display text-lg font-bold text-forest-900">{group}</legend>
          {fields
            .filter((f) => f.group === group)
            .map((f) => {
              const hint = [f.help, KIND_HINT[f.kind]].filter(Boolean).join(" ");
              if (f.kind === "image") {
                const v = stored[f.name] as { path?: string; width?: number; height?: number } | undefined;
                const initial: UploadedImage[] = v?.path && v.width && v.height ? [{ path: v.path, width: v.width, height: v.height }] : [];
                return (
                  <div key={f.name} className="flex flex-col gap-2">
                    {!initial.length && f.defaultImage && (
                      <p className="m-0 flex items-center gap-3 text-sm text-muted">
                        <img src={f.defaultImage.src} alt="" className="h-14 w-20 rounded-lg object-cover" />
                        Using the built-in photo. Upload one to replace it.
                      </p>
                    )}
                    <ImageUploader name={f.name} label={f.label} folder="pages" multiple={false} initial={initial} hint={hint || undefined} />
                  </div>
                );
              }
              const current = typeof stored[f.name] === "string" && stored[f.name] ? (stored[f.name] as string) : (f.defaultText ?? "");
              const rows = f.kind === "faq" ? 14 : f.kind === "lines" ? Math.min(12, Math.max(4, current.split("\n").length + 1)) : 4;
              return MULTILINE.has(f.kind) ? (
                <TextArea key={f.name} name={f.name} label={f.label} defaultValue={current} rows={rows} hint={hint || undefined} />
              ) : (
                <TextInput
                  key={f.name}
                  name={f.name}
                  label={f.label}
                  defaultValue={current}
                  type={f.kind === "email" ? "email" : f.kind === "url" ? "url" : f.kind === "phone" ? "tel" : "text"}
                  lang={f.kind === "en" ? "en" : undefined}
                  hint={hint || undefined}
                />
              );
            })}
        </fieldset>
      ))}
      <p className="m-0 text-sm text-muted">रिकामा ठेवलेला मजकूर मूळ मजकुरावर परत जातो · Anything left empty goes back to the original text.</p>
    </AdminForm>
  );
}
