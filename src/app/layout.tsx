import type { Metadata, Viewport } from "next";
import { Baloo_2, Mukta } from "next/font/google";
import { site } from "@/data/site";
import { HOME_TITLE, SHARE_IMAGE } from "@/lib/seo";
import "./globals.css";

// Baloo 2 is a variable font: one file per subset covers every weight.
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "devanagari"],
  display: "swap",
});

const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["latin", "devanagari"],
  // Only the weights the design uses (each weight is a separate file).
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: HOME_TITLE,
    template: `%s | ${site.nameEn}`,
  },
  description: site.descriptionMr,
  applicationName: site.nameEn,
  openGraph: {
    type: "website",
    locale: "mr_IN",
    siteName: site.nameEn,
    title: `${site.nameEn} — ${site.taglineEn}`,
    description: site.descriptionMr,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.nameEn} — ${site.taglineEn}`,
    description: site.descriptionMr,
    images: [SHARE_IMAGE.url],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1E5A2C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mr" className={`${baloo.variable} ${mukta.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS as available before first paint so scroll-reveal styles apply without a flash. */}
        <script
          dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add("js")` }}
        />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">{children}</body>
    </html>
  );
}
