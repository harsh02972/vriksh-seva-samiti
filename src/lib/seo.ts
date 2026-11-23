import type { Metadata } from "next";
import { site } from "@/data/site";

/** Share image: the logo on Samiti green, 1200×630 (public/og-image.jpg). */
export const SHARE_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: `${site.nameEn} (${site.nameMr}) logo`,
};

export const HOME_TITLE = `${site.nameEn} — ${site.taglineEn} | ${site.nameMr}, वर्धा`;

/**
 * Metadata for one public page: title, description, canonical URL and its own
 * Open Graph / Twitter card. Relative URLs resolve against NEXT_PUBLIC_SITE_URL
 * (metadataBase in the root layout).
 */
export function pageMetadata({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  const fullTitle = title ? `${title} | ${site.nameEn}` : HOME_TITLE;
  return {
    title: title ?? { absolute: HOME_TITLE },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "mr_IN",
      siteName: site.nameEn,
      url: path,
      title: fullTitle,
      description,
      images: [SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [SHARE_IMAGE.url] },
  };
}
