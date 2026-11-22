import { getPageText } from "@/lib/content";
import { ArrowRight } from "./icons";
import { LeafDecor } from "./LeafDecor";
import { LinkButton, Section } from "./ui";

/** Green call-to-action banner. Without props it uses the texts set for Home in the admin. */
export async function CtaBanner({ title, text }: { title?: string; text?: string }) {
  if (!title || !text) {
    const t = await getPageText("home");
    title ??= t.ctaTitle;
    text ??= t.ctaText;
  }
  return (
    <Section tone="white" labelledBy="cta-title" containerClassName="py-14 md:py-18">
      <div className="reveal relative overflow-hidden rounded-[32px] bg-brand px-6 py-10 text-white sm:px-10 md:py-12">
        <LeafDecor tone="dark" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-[560px] flex-col gap-2">
            <h2 id="cta-title" lang="en" className="m-0 text-[clamp(28px,3.4vw,42px)] font-extrabold text-white">
              {title}
            </h2>
            <p className="m-0 text-lg text-on-dark sm:text-[19px]">{text}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <LinkButton href="/get-involved" variant="sun" size="lg">
              रद्दी दान करा <ArrowRight size={20} />
            </LinkButton>
            <LinkButton href="/get-involved#pickup" variant="ghost-light" size="lg">
              घरून रद्दी उचलण्याची वेळ ठरवा
            </LinkButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
