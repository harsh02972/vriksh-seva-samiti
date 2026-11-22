"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { dbFailure, failure, success, type FormState } from "@/lib/admin/forms";
import { imageList } from "@/lib/admin/media";
import { publish } from "@/lib/admin/publish";
import { CONTENT_KEYS, PAGE_TEXTS, type ContentKey, type FieldDef } from "@/lib/page-text";

const LIMITS: Record<string, number> = { en: 200, mr: 400, url: 500, phone: 30, email: 200, "mr-long": 3000, lines: 4000, faq: 8000 };

function validate(def: FieldDef, raw: FormDataEntryValue | null): { value?: unknown; error?: string } {
  if (def.kind === "image") {
    const parsed = imageList(1).safeParse(raw);
    if (!parsed.success) return { error: "Invalid photo" };
    const p = parsed.data[0];
    return { value: p ? { path: p.path, width: p.width, height: p.height, alt: def.default.alt } : undefined };
  }
  const text = (typeof raw === "string" ? raw : "").replace(/\r\n/g, "\n").trim();
  if (text.length > (LIMITS[def.kind] ?? 2000)) return { error: `जास्तीत जास्त ${LIMITS[def.kind]} अक्षरे · Too long` };
  if (!text) return { value: "" };
  if (def.kind === "url" && !z.url({ protocol: /^https?$/ }).safeParse(text).success) return { error: "https://… ने सुरू होणारी लिंक · Must be a full https:// link" };
  if (def.kind === "email" && !z.email().safeParse(text).success) return { error: "योग्य ईमेल लिहा · Enter a valid email" };
  if (def.kind === "phone" && !/^\+?[\d\s-]{10,16}$/.test(text)) return { error: "उदा. +91 98765 43210 · Enter a valid phone number" };
  return { value: text };
}

export async function saveContent(key: ContentKey, _: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  if (!CONTENT_KEYS.includes(key)) return failure("Unknown page");
  if (fd.get("__uploading")) return failure("फोटो अपलोड पूर्ण होऊ द्या · Wait for the upload to finish.");

  const fields = PAGE_TEXTS[key].fields as Record<string, FieldDef>;
  const value: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const [name, def] of Object.entries(fields)) {
    const r = validate(def, fd.get(name));
    if (r.error) errors[name] = r.error;
    // Text equal to the built-in default is not stored, so later default updates still apply.
    else if (r.value !== undefined && r.value !== "" && r.value !== (def.kind === "image" ? undefined : def.default)) value[name] = r.value;
  }
  if (Object.keys(errors).length) return failure("काही चुका आहेत · Please fix the marked fields.", errors);

  const { error } = await supabase.from("site_content").upsert({ key, value });
  if (error) return dbFailure(error);
  publish();
  return success("मजकूर जतन झाला — वेबसाइट अपडेट झाली · Saved. The website is updated.");
}
