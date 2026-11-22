import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s · Admin · Vriksh Seva Samiti", default: "Admin · Vriksh Seva Samiti" },
  // Private area: never in search results.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-dvh flex-col bg-cream">{children}</div>;
}
