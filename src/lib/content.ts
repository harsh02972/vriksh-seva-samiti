/**
 * Content access layer — the ONLY place public pages get their data from.
 *
 * Reads the public_* views in Supabase as an anonymous visitor (no session, no secret key),
 * so money amounts can never reach a public page: the database does not give them to anon.
 *
 * Every getter is cached ("use cache") and tagged SITE_TAG. Admin saves call
 * updateTag(SITE_TAG), so the live site updates on the next request. Without an admin
 * save (e.g. an edit straight in Supabase) pages refresh within about a minute.
 *
 * Fallback rule: if Supabase is not configured, cannot be reached, or a section has no
 * rows yet, that section shows the built-in Phase 1 placeholders (marked "नमुना").
 */
import { cacheLife, cacheTag } from "next/cache";
import type {
  AcceptedItem,
  Campaign,
  ContactInfo,
  ContributorType,
  FeaturedVideo,
  GalleryCategory,
  GalleryPhoto,
  GiveMethod,
  ImageAsset,
  ImpactStats,
  LeaderboardEntry,
  Planting,
  ValueCard,
  WorkflowStep,
} from "@/data/site";
import {
  contact as fallbackContact,
  currentCampaign as fallbackCampaign,
  featuredVideo as fallbackVideo,
  gallery as fallbackGallery,
  impact as fallbackImpact,
  leaderboard as fallbackLeaderboard,
  plantings as fallbackPlantings,
  site,
} from "@/data/site";
import { labelWithNote, lines, PAGE_TEXTS, type ContentKey, type FieldDef, type PageText } from "./page-text";
import { mediaUrl } from "./supabase/env";
import { getPublicClient } from "./supabase/public";

export const SITE_TAG = "site";

function cached() {
  cacheTag(SITE_TAG);
  cacheLife("minutes");
}

type Row = Record<string, unknown>;

/** Runs a read against Supabase. Returns null when not configured or on any error. */
async function read<T = Row[]>(
  run: (client: NonNullable<ReturnType<typeof getPublicClient>>) => PromiseLike<{ data: unknown; error: unknown }>,
  label: string,
): Promise<T | null> {
  const client = getPublicClient();
  if (!client) return null;
  try {
    const { data, error } = await run(client);
    if (error) {
      console.warn(`[content] ${label}: falling back to built-in content —`, (error as { message?: string }).message ?? error);
      return null;
    }
    return data as T;
  } catch (error) {
    console.warn(`[content] ${label}: database unreachable, using built-in content —`, (error as Error).message);
    return null;
  }
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0) || 0);

/** YYYY-MM-DD in India time. */
function isoDateIST(value: unknown) {
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
}

function imageFromStorage(path: unknown, width: unknown, height: unknown, alt: string): ImageAsset {
  return { src: mediaUrl(String(path)), width: num(width) || 1600, height: num(height) || 1200, alt };
}

/* ------------------------------------------------------------------ */
/* Site info (brand constants stay in code)                            */
/* ------------------------------------------------------------------ */

export async function getSiteInfo() {
  return site;
}

/* ------------------------------------------------------------------ */
/* Page texts                                                          */
/* ------------------------------------------------------------------ */

async function getAllContent(): Promise<Record<string, Row>> {
  "use cache";
  cached();
  const rows = await read<{ key: string; value: Row }[]>((c) => c.from("public_site_content").select("key, value"), "site_content");
  return Object.fromEntries((rows ?? []).map((r) => [r.key, r.value ?? {}]));
}

function resolveField(def: FieldDef, raw: unknown): string | ImageAsset {
  if (def.kind === "image") {
    const v = raw as { path?: string; width?: number; height?: number; alt?: string } | undefined;
    if (v && typeof v.path === "string" && v.path) return imageFromStorage(v.path, v.width, v.height, str(v.alt) || def.default.alt);
    return def.default;
  }
  const text = typeof raw === "string" ? raw.trim() : "";
  return text || def.default;
}

/** Texts for one page: database values where filled in, built-in defaults everywhere else. */
export async function getPageText<K extends ContentKey>(key: K): Promise<PageText<K>> {
  const all = await getAllContent();
  const stored = all[key] ?? {};
  const fields = PAGE_TEXTS[key].fields as Record<string, FieldDef>;
  const out: Record<string, string | ImageAsset> = {};
  for (const [name, def] of Object.entries(fields)) out[name] = resolveField(def, stored[name]);
  return out as PageText<K>;
}

/* ------------------------------------------------------------------ */
/* Contact details                                                     */
/* ------------------------------------------------------------------ */

const digits = (v: string) => v.replace(/[^\d]/g, "");

export async function getContact(): Promise<ContactInfo> {
  const d = await getPageText("contact_details");
  const phone = d.phone.trim();
  const whatsapp = d.whatsapp.trim() || phone;
  const isPlaceholder = !phone || !d.address.trim();
  const e164 = (v: string) => {
    const n = digits(v);
    return n.length === 10 ? `+91${n}` : `+${n}`;
  };
  return {
    phoneDisplay: phone || fallbackContact.phoneDisplay,
    phoneE164: phone ? e164(phone) : fallbackContact.phoneE164,
    whatsappE164: whatsapp ? digits(e164(whatsapp)) : fallbackContact.whatsappE164,
    email: d.email.trim() || fallbackContact.email,
    addressMr: d.address.trim() || fallbackContact.addressMr,
    mapUrl: d.mapUrl.trim() || fallbackContact.mapUrl,
    collectionHoursMr: d.collectionHours.trim() || fallbackContact.collectionHoursMr,
    whatsappGroupUrl: d.whatsappGroup.trim() || undefined,
    socials: {
      facebook: d.facebook.trim() || undefined,
      instagram: d.instagram.trim() || undefined,
      youtube: d.youtube.trim() || undefined,
    },
    isPlaceholder,
  };
}

/* ------------------------------------------------------------------ */
/* Numbers                                                             */
/* ------------------------------------------------------------------ */

export async function getImpactStats(): Promise<ImpactStats> {
  "use cache";
  cached();
  const rows = await read((c) => c.from("public_site_stats").select("*"), "site_stats");
  const s = rows?.[0];
  if (!s || !s.has_data) return fallbackImpact;
  return {
    treesPlanted: num(s.trees_planted),
    treesSurviving: num(s.trees_surviving),
    wasteKg: num(s.waste_kg),
    donors: num(s.donors),
    nextMilestone: num(s.next_milestone) || 1000,
    asOf: isoDateIST(s.updated_at) || isoDateIST(new Date()),
    isSample: false,
  };
}

/** True when the database is reachable and holds real numbers (used to decide whether to show samples). */
async function hasRealData() {
  return !(await getImpactStats()).isSample;
}

/* ------------------------------------------------------------------ */
/* Lists that live in page texts                                       */
/* ------------------------------------------------------------------ */

const STEP_ICONS: WorkflowStep["icon"][] = ["collect", "weigh", "sell", "plant", "care"];

export async function getWorkflow(): Promise<(WorkflowStep & { details: string[] })[]> {
  const t = (await getPageText("how_it_works")) as unknown as Record<string, string>;
  return STEP_ICONS.map((icon, i) => ({
    id: icon,
    icon,
    titleEn: t[`step${i + 1}Title`],
    textMr: t[`step${i + 1}Text`],
    details: lines(t[`step${i + 1}Details`]),
  }));
}

export async function getAcceptedItems(): Promise<AcceptedItem[]> {
  const t = await getPageText("how_it_works");
  const toItems = (text: string, accepted: boolean) =>
    lines(text).map((line, i) => {
      const { label, note } = labelWithNote(line);
      return { id: `${accepted ? "yes" : "no"}-${i}`, labelMr: label, noteMr: accepted ? note : undefined, accepted };
    });
  return [...toItems(t.acceptedItems, true), ...toItems(t.notAcceptedItems, false)];
}

export async function getGiveMethods(): Promise<GiveMethod[]> {
  const t = await getPageText("get_involved");
  return [
    { id: "dropoff", icon: "dropoff", titleEn: t.method1Title, textMr: t.method1Text },
    { id: "school", icon: "school", titleEn: t.method2Title, textMr: t.method2Text },
    { id: "pickup", icon: "pickup", titleEn: t.method3Title, textMr: t.method3Text },
  ];
}

export async function getValues(): Promise<ValueCard[]> {
  const t = await getPageText("about");
  return [
    { titleEn: t.value1Title, textMr: t.value1Text },
    { titleEn: t.value2Title, textMr: t.value2Text },
    { titleEn: t.value3Title, textMr: t.value3Text },
  ];
}

export async function getPageImages() {
  const [about, how] = await Promise.all([getPageText("about"), getPageText("how_it_works")]);
  return { aboutImage: about.storyImage, collectionImage: how.acceptImage };
}

/* ------------------------------------------------------------------ */
/* Campaign                                                            */
/* ------------------------------------------------------------------ */

/** The active campaign. null = the Samiti has real data but no active campaign (section is hidden). */
export async function getCurrentCampaign(): Promise<Campaign | null> {
  "use cache";
  cached();
  const rows = await read((c) => c.from("public_campaign").select("*").limit(1), "campaign");
  const c = rows?.[0];
  if (c) {
    return {
      id: str(c.id),
      titleEn: str(c.title_en) || "Current Campaign",
      yearLabelMr: str(c.year_label_mr),
      descriptionMr: str(c.description_mr),
      startDate: str(c.start_date),
      endDate: str(c.end_date),
      treeTarget: num(c.tree_target),
      treesPlanted: num(c.trees_planted),
      isSample: false,
    };
  }
  return rows && (await hasRealData()) ? null : fallbackCampaign;
}

/* ------------------------------------------------------------------ */
/* Featured video                                                      */
/* ------------------------------------------------------------------ */

export async function getFeaturedVideo(): Promise<FeaturedVideo> {
  "use cache";
  cached();
  const rows = await read((c) => c.from("public_featured_video").select("*").limit(1), "featured_video");
  const v = rows?.[0];
  if (!v || !v.video_path) return fallbackVideo;
  const width = num(v.video_width);
  const height = num(v.video_height);
  const version = encodeURIComponent(str(v.updated_at));
  return {
    src: `${mediaUrl(str(v.video_path))}?v=${version}`,
    mimeType: "video/mp4",
    poster: v.poster_path
      ? imageFromStorage(v.poster_path, v.poster_width, v.poster_height, "व्हिडिओचे मुखपृष्ठ")
      : { ...fallbackVideo.poster, alt: "व्हिडिओचे मुखपृष्ठ" },
    titleEn: str(v.title_en) || fallbackVideo.titleEn,
    captionMr: str(v.caption_mr),
    transcriptMr: str(v.transcript_mr),
    durationSec: Math.round(num(v.duration_sec)) || 20,
    orientation: width && height && height > width ? "portrait" : "landscape",
    mutedPreview: v.muted_preview !== false,
    isPlaceholder: false,
  };
}

/* ------------------------------------------------------------------ */
/* Plantings                                                           */
/* ------------------------------------------------------------------ */

const PLANTING_PLACEHOLDER = fallbackPlantings[0].image;

function mapPlanting(r: Row): Planting {
  const title = str(r.title_mr);
  const photos = ((r.photos as Row[] | null) ?? []).map((p) =>
    imageFromStorage(p.path, p.width, p.height, str(p.alt) || title),
  );
  const lat = r.latitude;
  const lng = r.longitude;
  const donors = ((r.donor_names as string[] | null) ?? []).filter(Boolean);
  return {
    id: str(r.id),
    titleMr: title,
    placeMr: str(r.place_mr),
    date: str(r.planted_on),
    treesPlanted: num(r.trees_planted),
    treesSurviving: num(r.trees_surviving),
    speciesMr: ((r.species_mr as string[] | null) ?? []).filter(Boolean),
    partnerMr: str(r.partner_mr) || (donors.length ? donors.join(", ") : undefined),
    careNoteMr: str(r.care_note_mr),
    image: photos[0] ?? { ...PLANTING_PLACEHOLDER, alt: `${title} (फोटो लवकरच)` },
    photos,
    mapUrl:
      lat != null && lng != null
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
        : undefined,
    donorNamesMr: donors,
    isSample: false,
  };
}

/** Newest first. */
export async function getPlantings(limit?: number): Promise<Planting[]> {
  "use cache";
  cached();
  const rows = await read(
    (c) => {
      const q = c.from("public_plantings").select("*").order("planted_on", { ascending: false });
      return typeof limit === "number" ? q.limit(limit) : q;
    },
    "plantings",
  );
  if (rows?.length) return rows.map(mapPlanting);
  const sorted = [...fallbackPlantings].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

const CATEGORIES: GalleryCategory[] = ["collection", "planting", "care", "schools"];

function mapPhoto(r: Row): GalleryPhoto {
  const caption = str(r.caption_mr);
  const category = CATEGORIES.includes(r.category as GalleryCategory) ? (r.category as GalleryCategory) : "planting";
  return {
    id: str(r.id),
    category,
    captionMr: caption,
    placeMr: str(r.place_mr),
    date: str(r.taken_on),
    image: imageFromStorage(r.storage_path, r.width, r.height, caption),
    showOnHome: r.show_on_home === true,
    isSample: false,
  };
}

/** In the admin's chosen order (then newest first). */
export async function getGallery(): Promise<GalleryPhoto[]> {
  "use cache";
  cached();
  const rows = await read(
    (c) =>
      c
        .from("public_gallery")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("taken_on", { ascending: false, nullsFirst: false }),
    "gallery",
  );
  if (rows?.length) return rows.map(mapPhoto);
  return [...fallbackGallery].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Photos the admin ticked "Show on Home". Empty = the Home photo strip is hidden. */
export async function getHomePhotos(limit = 8): Promise<GalleryPhoto[]> {
  const photos = await getGallery();
  return photos.filter((p) => p.showOnHome).slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Leaderboard — ONLY name, type and trees                             */
/* ------------------------------------------------------------------ */

const TYPES: ContributorType[] = ["school", "college", "individual", "organisation"];

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  "use cache";
  cached();
  const rows = await read(
    (c) =>
      c.from("public_leaderboard").select("id, name, type, trees_planted, search_alias").order("trees_planted", { ascending: false }),
    "leaderboard",
  );
  if (!rows?.length) return fallbackLeaderboard;
  return rows.map((r) => ({
    id: str(r.id),
    nameMr: str(r.name),
    type: TYPES.includes(r.type as ContributorType) ? (r.type as ContributorType) : "individual",
    trees: num(r.trees_planted),
    searchAlias: str(r.search_alias) || undefined,
    isSample: false,
  }));
}
