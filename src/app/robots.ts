import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // The admin area is private: keep crawlers out (its pages are also marked noindex).
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/admin/"] },
    sitemap: new URL("/sitemap.xml", site.siteUrl).toString(),
  };
}
