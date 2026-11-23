import type { Metadata } from "next";
import { ArrowRight } from "@/components/icons";
import { LeafDecor } from "@/components/LeafDecor";
import { SiteChrome } from "@/components/SiteChrome";
import { Container, LinkButton } from "@/components/ui";
import { mainNav } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <section aria-labelledby="nf-title" className="relative overflow-hidden bg-mint">
        <LeafDecor />
        <Container className="relative flex flex-col items-center gap-5 py-20 text-center md:py-28">
          <svg aria-hidden viewBox="0 0 120 120" className="w-28 md:w-36">
            <ellipse cx="60" cy="108" rx="34" ry="7" fill="#5A3E22" opacity="0.35" />
            <path d="M60 106V62" stroke="#6B4A2B" strokeWidth="6" strokeLinecap="round" />
            <path d="M60 74C60 56 48 44 30 44c0 18 12 30 30 30z" fill="#7BB342" />
            <path d="M60 86c0-18 12-30 30-30 0 18-12 30-30 30z" fill="#1E5A2C" />
          </svg>
          <p lang="en" className="m-0 font-display text-6xl font-extrabold text-leaf md:text-7xl">
            404
          </p>
          <h1 id="nf-title" lang="en" className="m-0 text-[clamp(30px,4vw,44px)] font-extrabold">
            This Page Hasn&apos;t Grown Yet
          </h1>
          <p className="m-0 max-w-[520px] text-lg text-ink-soft">
            तुम्ही शोधत असलेले पान सापडले नाही. कदाचित पत्ता चुकला असेल किंवा पान हलवले असेल.
          </p>
          <LinkButton href="/" size="lg">
            मुख्यपृष्ठावर जा <ArrowRight size={20} />
          </LinkButton>
          <nav aria-label="इतर पाने" className="mt-4">
            <ul className="flex flex-wrap justify-center gap-2">
              {mainNav.slice(1).map((item) => (
                <li key={item.href}>
                  <LinkButton href={item.href} variant="white" className="text-[15px]">
                    {item.labelMr}
                  </LinkButton>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>
    </SiteChrome>
  );
}
