/**
 * Content access layer.
 *
 * Phase 1: reads from the single data file src/data/site.ts.
 * Phase 2: replace the bodies of these functions with Supabase queries
 * (e.g. `supabase.from("plantings").select("*").order("date", { ascending: false })`)
 * and add caching ("use cache" + cacheTag) so admin updates can revalidate pages.
 * Page and component code does not need to change.
 */
import {
  acceptedItems,
  aboutImage,
  collectionImage,
  contact,
  currentCampaign,
  featuredVideo,
  gallery,
  giveMethods,
  impact,
  leaderboard,
  plantings,
  site,
  values,
  workflow,
} from "@/data/site";

export async function getSiteInfo() {
  return site;
}

export async function getContact() {
  return contact;
}

export async function getImpactStats() {
  return impact;
}

export async function getWorkflow() {
  return workflow;
}

export async function getAcceptedItems() {
  return acceptedItems;
}

export async function getGiveMethods() {
  return giveMethods;
}

export async function getValues() {
  return values;
}

export async function getCurrentCampaign() {
  return currentCampaign;
}

export async function getFeaturedVideo() {
  return featuredVideo;
}

/** Newest first. */
export async function getPlantings(limit?: number) {
  const sorted = [...plantings].sort((a, b) => b.date.localeCompare(a.date));
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

/** Newest first. */
export async function getGallery() {
  return [...gallery].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getLeaderboard() {
  return leaderboard;
}

export async function getPageImages() {
  return { aboutImage, collectionImage };
}
