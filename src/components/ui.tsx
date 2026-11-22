import Link from "next/link";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6", className)}>{children}</div>;
}

type Tone = "white" | "cream" | "mint" | "forest";
const toneClass: Record<Tone, string> = {
  white: "bg-white",
  cream: "bg-cream",
  mint: "bg-mint",
  forest: "bg-forest-900 text-white",
};

export function Section({
  id,
  tone = "white",
  className,
  containerClassName,
  labelledBy,
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  containerClassName?: string;
  labelledBy?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn(toneClass[tone], "relative", className)}>
      <Container className={cn("py-16 md:py-20", containerClassName)}>{children}</Container>
    </section>
  );
}

/** Small uppercase English label above a heading (as in the demo). */
export function Eyebrow({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <span
      lang="en"
      className={cn(
        "inline-block text-[15px] font-bold tracking-[0.06em] uppercase",
        onDark ? "text-sun" : "text-earth",
      )}
    >
      {children}
    </span>
  );
}

/**
 * Section heading: English title (lang="en") + Marathi intro (inherits lang="mr").
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = "center",
  onDark = false,
  as: Tag = "h2",
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  align?: "center" | "left";
  onDark?: boolean;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "reveal flex flex-col gap-2",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>}
      <Tag
        id={id}
        lang="en"
        className={cn(
          "m-0 font-extrabold",
          Tag === "h1" ? "text-[clamp(36px,5vw,60px)]" : "text-[clamp(30px,3.6vw,44px)]",
          onDark && "text-white",
        )}
      >
        {title}
      </Tag>
      {intro && (
        <p className={cn("m-0 max-w-[640px]", onDark ? "text-on-dark" : "text-muted")}>{intro}</p>
      )}
    </div>
  );
}

type ButtonVariant = "primary" | "outline" | "sun" | "ghost-light" | "white";
const buttonClass: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark hover:text-white",
  outline: "border-2 border-brand bg-white text-brand hover:bg-mint hover:text-brand-dark",
  sun: "bg-sun text-sun-ink hover:bg-[#e5b41f] hover:text-sun-ink",
  "ghost-light": "border-2 border-white text-white hover:bg-white/10 hover:text-white",
  white: "bg-white text-brand hover:bg-mint hover:text-brand-dark",
};

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2.5 rounded-full font-bold no-underline transition-colors duration-200",
        size === "lg" ? "min-h-[52px] px-7 py-3 text-lg" : "min-h-[44px] px-5 py-2 text-base",
        buttonClass[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

/** External / protocol links (tel:, mailto:, https://wa.me) styled as buttons. */
export function AnchorButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ComponentProps<"a"> & { variant?: ButtonVariant; size?: "md" | "lg" }) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center gap-2.5 rounded-full font-bold no-underline transition-colors duration-200",
        size === "lg" ? "min-h-[52px] px-7 py-3 text-lg" : "min-h-[44px] px-5 py-2 text-base",
        buttonClass[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}

/**
 * Yellow note shown next to sample numbers / placeholder media.
 * Callers render it only when the data is a placeholder (isSample / isPlaceholder),
 * so it disappears by itself once real data is in the database.
 */
export function SampleNote({
  children = "नमुना माहिती — खरी माहिती नंतर भरली जाईल",
  className,
  force = false,
}: {
  children?: ReactNode;
  className?: string;
  /** Kept for compatibility; notes are always shown when rendered. */
  force?: boolean;
}) {
  void force;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 self-start rounded-lg bg-note px-2.5 py-1 text-[13px] leading-snug font-semibold text-note-ink",
        className,
      )}
    >
      <span aria-hidden>●</span>
      {children}
    </span>
  );
}

/** Wrap English words inside Marathi text. */
export function En({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span lang="en" className={className}>
      {children}
    </span>
  );
}

/** Adds a staggered reveal delay via CSS variable. */
export function revealDelay(index: number, step = 80): CSSProperties {
  return { ["--reveal-delay" as string]: `${index * step}ms` } as CSSProperties;
}
