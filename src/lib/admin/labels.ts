export const DONOR_TYPES = [
  { value: "school", label: "School · शाळा" },
  { value: "college", label: "College · महाविद्यालय" },
  { value: "individual", label: "Individual · व्यक्ती" },
  { value: "organisation", label: "Organisation · संस्था" },
] as const;

export const WASTE_TYPES = [
  { value: "paper", label: "Paper · रद्दी पेपर" },
  { value: "cardboard", label: "Cardboard · पुठ्ठा" },
  { value: "books", label: "Books · वह्या-पुस्तके" },
  { value: "plastic", label: "Plastic · प्लास्टिक" },
  { value: "metal", label: "Metal · धातू भंगार" },
  { value: "mixed", label: "Mixed · मिश्र" },
  { value: "other", label: "Other · इतर" },
] as const;

export const SURVIVAL_STATUSES = [
  { value: "healthy", label: "Healthy · चांगली" },
  { value: "needs_care", label: "Needs care · काळजी हवी" },
  { value: "replanting", label: "Replanting · पुन्हा लागवड" },
  { value: "established", label: "Established · मोठी झाली" },
] as const;

export const GALLERY_CATEGORIES = [
  { value: "planting", label: "Planting · वृक्षारोपण" },
  { value: "care", label: "Care · संगोपन" },
  { value: "collection", label: "Collection · रद्दी संकलन" },
  { value: "schools", label: "Schools & colleges · शाळा व महाविद्यालये" },
] as const;

export const labelOf = (list: readonly { value: string; label: string }[], value: unknown) =>
  list.find((o) => o.value === value)?.label ?? String(value ?? "");

/** Admin numbers use English digits with Indian grouping (1,25,000). */
export const fmt = (n: unknown, digits = 0) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(Number(n ?? 0) || 0);

/** ₹ amount — ADMIN PAGES ONLY. */
export const rupees = (n: unknown) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(n ?? 0) || 0);

export const shortDate = (iso: unknown) => {
  if (!iso) return "—";
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
};

/** Today in India, YYYY-MM-DD. */
export const todayIST = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
