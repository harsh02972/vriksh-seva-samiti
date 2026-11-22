import type { ReactNode } from "react";
import { LeafDecor } from "./LeafDecor";
import { Container, Eyebrow } from "./ui";

/** Top banner for inner pages: English H1 + Marathi intro. */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby="page-title" className="relative overflow-hidden bg-mint">
      <LeafDecor />
      <svg
        aria-hidden
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute right-0 bottom-0 left-0 h-6 w-full text-cream md:h-10"
      >
        <path d="M0 60V30c240-30 480-30 720 0s480 30 720 0v30z" fill="currentColor" />
      </svg>
      <Container className="relative flex flex-col items-start gap-3 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="reveal flex flex-col items-start gap-3">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 id="page-title" lang="en" className="m-0 text-[clamp(36px,5.2vw,60px)] font-extrabold">
            {title}
          </h1>
          <p className="m-0 max-w-[680px] text-lg text-ink-soft md:text-xl">{intro}</p>
          {children}
        </div>
      </Container>
    </section>
  );
}
