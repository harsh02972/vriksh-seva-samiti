import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getInvolved, mainNav, privacy } from "@/lib/nav";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...mainNav, getInvolved, privacy].map((item) => ({
    url: new URL(item.href, site.siteUrl).toString(),
    changeFrequency: item.href === "/" || item.href === "/leaderboard" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.7,
  }));
}
