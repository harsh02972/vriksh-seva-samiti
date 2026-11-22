import { z } from "zod";

/** What every admin Server Action returns to its form. */
export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Changes on every successful save so forms can reset themselves. */
  savedAt?: number;
};

export const success = (message = "जतन झाले · Saved"): FormState => ({ ok: true, message, savedAt: Date.now() });
export const failure = (message: string, errors?: Record<string, string>): FormState => ({ ok: false, message, errors });

/** Turn zod issues into { field: message }. */
export function zodErrors(error: z.ZodError): FormState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return failure("कृपया लाल रंगातील चुका दुरुस्त करा · Please fix the highlighted fields.", errors);
}

/** Friendly message for database errors. */
export function dbFailure(error: { message?: string; code?: string } | null, fallback = "जतन करता आले नाही · Could not save."): FormState {
  if (!error) return failure(fallback);
  if (error.code === "23505") return failure("हे आधीच अस्तित्वात आहे · This already exists (duplicate).");
  if (error.code === "42501" || /row-level security|permission/i.test(error.message ?? ""))
    return failure("परवानगी नाही · You do not have permission. Please sign in again.");
  if (error.code === "23514") return failure("काही माहिती मर्यादेबाहेर आहे · A value is out of range.");
  return failure(`${fallback} (${error.message ?? "error"})`);
}

/* ---- zod helpers for FormData (everything arrives as strings) ---- */

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

export const zText = (max = 200, label = "हे") =>
  z.string().trim().min(1, `${label} भरा · Required`).max(max, `जास्तीत जास्त ${max} अक्षरे · Too long`);
export const zOptionalText = (max = 2000) =>
  z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().max(max, "खूप मोठे · Too long")).transform((v) => v || null);
export const zInt = (min = 0, max = 10_000_000) =>
  z.coerce.number({ error: "संख्या लिहा · Enter a number" }).int("पूर्ण संख्या · Whole number").min(min, `किमान ${min}`).max(max, "खूप मोठी संख्या · Too large");
export const zOptionalInt = (min = 0, max = 10_000_000) => z.preprocess(emptyToNull, zInt(min, max).nullable());
export const zDecimal = (min = 0, max = 10_000_000) =>
  z.coerce.number({ error: "संख्या लिहा · Enter a number" }).min(min, `किमान ${min}`).max(max, "खूप मोठी संख्या · Too large");
export const zOptionalDecimal = (min = 0, max = 100_000_000) => z.preprocess(emptyToNull, zDecimal(min, max).nullable());
export const zDate = () => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "तारीख निवडा · Pick a date");
export const zOptionalDate = () => z.preprocess(emptyToNull, zDate().nullable());
export const zBool = () => z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export function formObject(fd: FormData) {
  const out: Record<string, FormDataEntryValue> = {};
  for (const [k, v] of fd.entries()) if (!(k in out)) out[k] = v;
  return out;
}
