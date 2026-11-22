import type { Metadata, Viewport } from "next";
import { Baloo_2, Mukta } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RevealObserver } from "@/components/RevealObserver";
import { site } from "@/data/site";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "devanagari"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: `${site.nameEn} — ${site.taglineEn} | ${site.nameMr}, वर्धा`,
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
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: `${site.nameEn} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.nameEn} — ${site.taglineEn}`,
    description: site.descriptionMr,
    images: ["/og-image.jpg"],
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
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only-focusable fixed top-3 left-3 z-[100] rounded-full bg-sun px-5 py-3 font-bold text-sun-ink no-underline shadow-lg"
        >
          मुख्य मजकुराकडे जा
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}
