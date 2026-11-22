"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getInvolved, mainNav } from "@/lib/nav";
import { ArrowRight, Cross, Menu } from "./icons";
import { cn } from "./ui";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1280) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 supports-[backdrop-filter]:bg-white/85 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 text-ink no-underline" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt="वृक्ष सेवा समिती लोगो"
            width={56}
            height={56}
            preload
            className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span lang="en" className="font-display text-[19px] font-extrabold text-brand sm:text-[22px]">
              Vriksh Seva Samiti
            </span>
            <span className="truncate text-[13px] text-muted sm:text-sm">वृक्ष सेवा समिती, वर्धा</span>
          </span>
        </Link>

        <nav aria-label="मुख्य मेनू" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    lang="en"
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-3 py-2 text-[16px] font-semibold no-underline transition-colors",
                      active ? "bg-mint text-brand" : "text-ink hover:bg-cream hover:text-brand",
                    )}
                  >
                    {item.labelEn}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={getInvolved.href}
            className="hidden min-h-[44px] items-center gap-2 rounded-full bg-brand px-5 text-base font-bold text-white no-underline transition-colors hover:bg-brand-dark hover:text-white sm:inline-flex"
          >
            रद्दी दान करा
            <ArrowRight size={18} />
          </Link>
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-line text-brand xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Cross size={22} /> : <Menu size={22} />}
            <span className="sr-only">{open ? "मेनू बंद करा" : "मेनू उघडा"}</span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-line bg-white xl:hidden"
      >
        <nav aria-label="मोबाईल मेनू" className="mx-auto max-w-[1200px] px-4 pt-2 pb-5 sm:px-6">
          <ul className="flex flex-col">
            {[...mainNav, getInvolved].map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className="border-b border-line last:border-0">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-[52px] items-center justify-between gap-3 py-2 no-underline",
                      active ? "text-brand" : "text-ink",
                    )}
                  >
                    <span lang="en" className="font-display text-lg font-bold">
                      {item.labelEn}
                    </span>
                    <span className="text-sm text-muted">{item.labelMr}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href={getInvolved.href}
            onClick={() => setOpen(false)}
            className="mt-4 flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-brand text-lg font-bold text-white no-underline hover:text-white sm:hidden"
          >
            रद्दी दान करा <ArrowRight size={18} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
