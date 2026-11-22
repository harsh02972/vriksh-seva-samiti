"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { signOut } from "@/app/admin/actions";
import {
  Calendar,
  Coins,
  Dashboard,
  ExternalLink,
  Flag,
  ImageIcon,
  LogOut,
  Medal,
  Menu,
  Cross,
  Sprout,
  Text,
  Tree,
  Users,
  Video,
} from "../icons";
import { cn } from "../ui";

const NAV = [
  { href: "/admin", en: "Dashboard", mr: "मुख्य", Icon: Dashboard },
  { href: "/admin/contributions", en: "Contributions", mr: "रद्दी नोंदी", Icon: Coins },
  { href: "/admin/donors", en: "Donors", mr: "देणगीदार", Icon: Users },
  { href: "/admin/leaderboard", en: "Leaderboard", mr: "लीडरबोर्ड", Icon: ({ size }: { size?: number }) => <Medal place={1} size={size} /> },
  { href: "/admin/plantings", en: "Plantings", mr: "वृक्षारोपण", Icon: Sprout },
  { href: "/admin/gallery", en: "Gallery", mr: "फोटो", Icon: ImageIcon },
  { href: "/admin/video", en: "Video", mr: "व्हिडिओ", Icon: Video },
  { href: "/admin/campaigns", en: "Campaigns", mr: "मोहीम", Icon: Flag },
  { href: "/admin/stats", en: "Site numbers", mr: "आकडे", Icon: Tree },
  { href: "/admin/content", en: "Page texts", mr: "मजकूर व संपर्क", Icon: Text },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

/** The active item needs the URL, which streams in; until then the nav renders without a highlight. */
export function AdminNav() {
  return (
    <Suspense fallback={<NavPanel pathname="" />}>
      <NavWithPath />
    </Suspense>
  );
}

function NavWithPath() {
  return <NavPanel pathname={usePathname()} />;
}

function NavPanel({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="sticky top-0 z-40 border-b border-forest-700 bg-forest-950 text-on-dark lg:h-dvh lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5 lg:py-5">
        <Link href="/admin" className="flex items-center gap-2.5 text-white no-underline">
          <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-xl bg-white object-contain p-0.5" />
          <span className="flex flex-col leading-tight">
            <span lang="en" className="font-display text-lg font-extrabold">
              Samiti Admin
            </span>
            <span className="text-xs text-on-dark-soft">वृक्ष सेवा समिती</span>
          </span>
        </Link>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-forest-700 lg:hidden"
          aria-expanded={open}
          aria-controls="admin-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Cross size={22} /> : <Menu size={22} />}
          <span className="sr-only">मेनू · Menu</span>
        </button>
      </div>
      <nav id="admin-nav" aria-label="Admin" className={cn("px-3 pb-4 lg:block", open ? "block" : "hidden")}>
        <ul className="m-0 flex flex-col gap-1">
          {NAV.map(({ href, en, mr, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[46px] items-center gap-3 rounded-xl px-3 no-underline transition-colors",
                    active ? "bg-forest-800 text-white" : "text-on-dark hover:bg-forest-900 hover:text-white",
                  )}
                >
                  <Icon size={20} />
                  <span className="flex flex-col leading-tight">
                    <span lang="en" className="font-semibold">
                      {en}
                    </span>
                    <span className="text-xs opacity-80">{mr}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-col gap-1 border-t border-forest-700 pt-4">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-on-dark no-underline hover:bg-forest-900 hover:text-white">
            <ExternalLink size={20} /> <span>वेबसाइट पहा · View site</span>
          </a>
          <form action={signOut}>
            <button type="submit" className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-left text-on-dark hover:bg-forest-900 hover:text-white">
              <LogOut size={20} /> <span>बाहेर पडा · Sign out</span>
            </button>
          </form>
        </div>
        <p className="mt-4 hidden px-3 text-xs text-on-dark-soft lg:block">
          <Calendar size={14} className="mr-1 inline" />
          बदल वेबसाइटवर लगेच दिसतात · Changes go live right away.
        </p>
      </nav>
    </aside>
  );
}
