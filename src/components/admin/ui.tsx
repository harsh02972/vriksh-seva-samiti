import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "../ui";

export function PageHeader({
  title,
  titleMr,
  intro,
  actions,
  back,
}: {
  title: string;
  titleMr?: string;
  intro?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-3">
      {back && (
        <Link href={back.href} className="self-start text-[15px] font-semibold">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 lang="en" className="m-0 text-[clamp(28px,4vw,38px)] font-extrabold text-forest-900">
            {title}
            {titleMr && <span className="ml-2 align-middle font-sans text-lg font-semibold text-muted" lang="mr">{titleMr}</span>}
          </h1>
          {intro && <p className="m-0 max-w-[720px] text-muted">{intro}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ children, className, title }: { children: ReactNode; className?: string; title?: ReactNode }) {
  return (
    <section className={cn("rounded-[20px] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6", className)}>
      {title && <h2 className="m-0 mb-4 font-display text-xl font-bold text-forest-900">{title}</h2>}
      {children}
    </section>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
  external?: boolean;
}) {
  const className = cn(
    "inline-flex min-h-[46px] items-center gap-2 rounded-full px-5 font-bold no-underline transition-colors",
    variant === "primary"
      ? "bg-brand text-white hover:bg-brand-dark hover:text-white"
      : "border-2 border-brand bg-white text-brand hover:bg-mint",
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="m-0 rounded-2xl border-2 border-dashed border-line bg-cream p-6 text-center text-muted">{children}</p>;
}

export function Badge({ children, tone = "mint" }: { children: ReactNode; tone?: "mint" | "note" | "red" | "grey" }) {
  const tones = {
    mint: "bg-mint text-brand",
    note: "bg-note text-note-ink",
    red: "bg-[#FBEAE5] text-[#7A2E1C]",
    grey: "bg-[#eef0ea] text-ink-soft",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold", tones[tone])}>{children}</span>;
}

/** Shown on the admin when the database can't be read. */
export function LoadError({ what }: { what: string }) {
  return (
    <p className="m-0 rounded-2xl bg-[#FBEAE5] p-4 font-semibold text-[#7A2E1C]">
      {what} वाचता आले नाही · Could not load {what}. Check that all SQL migrations were run, then reload.
    </p>
  );
}

/** Admin-only private value marker. */
export function PrivateTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0cc] px-2 py-0.5 text-xs font-bold text-note-ink" title="Never shown on the public website">
      🔒 Admin only
    </span>
  );
}
