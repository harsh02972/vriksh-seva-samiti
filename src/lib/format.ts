/**
 * Deterministic Marathi formatting helpers.
 * We do not rely on Intl locale data so server and browser always produce
 * identical text (no hydration mismatches).
 */

const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toMarathiDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => DEVANAGARI_DIGITS[Number(d)]);
}

/** Indian digit grouping (12,34,567) with Marathi digits. */
export function formatNumberMr(value: number): string {
  const rounded = Math.round(value);
  const negative = rounded < 0;
  const digits = String(Math.abs(rounded));
  let grouped = digits;
  if (digits.length > 3) {
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    grouped = `${rest},${last3}`;
  }
  return toMarathiDigits(`${negative ? "-" : ""}${grouped}`);
}

const MONTHS_MR = [
  "जानेवारी",
  "फेब्रुवारी",
  "मार्च",
  "एप्रिल",
  "मे",
  "जून",
  "जुलै",
  "ऑगस्ट",
  "सप्टेंबर",
  "ऑक्टोबर",
  "नोव्हेंबर",
  "डिसेंबर",
];

/** "2026-07-07" → "७ जुलै २०२६" */
export function formatDateMr(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${toMarathiDigits(d)} ${MONTHS_MR[m - 1]} ${toMarathiDigits(y)}`;
}

/** "2026-07-07" → "जुलै २०२६" */
export function formatMonthYearMr(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  if (!y || !m) return iso;
  return `${MONTHS_MR[m - 1]} ${toMarathiDigits(y)}`;
}

export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((part / whole) * 100)));
}
