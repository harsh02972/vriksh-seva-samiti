import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminEnabled } from "@/lib/flags";

export const metadata: Metadata = {
  title: { template: "%s · Admin · Vriksh Seva Samiti", default: "Admin · Vriksh Seva Samiti" },
  // Private area: never in search results.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  // Admin switched off (ADMIN_ENABLED is not "true"): every admin page is a 404.
  if (!isAdminEnabled()) notFound();
  return <div className="flex min-h-dvh flex-col bg-cream">{children}</div>;
}
