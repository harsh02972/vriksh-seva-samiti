import type { Metadata } from "next";
import Image from "next/image";
import { AcceptedItems } from "@/components/AcceptedItems";
import { CtaBanner } from "@/components/CtaBanner";
import { ArrowRight, Check } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { LinkButton, revealDelay, Section, SectionHeading } from "@/components/ui";
import { WorkflowSteps } from "@/components/WorkflowSteps";
import { getAcceptedItems, getPageImages, getWorkflow } from "@/lib/content";
import { toMarathiDigits } from "@/lib/format";

export const metadata: Metadata = {
  title: "How It Works",
  description: "रद्दी संकलन, वजन, विक्री, वृक्षारोपण आणि संगोपन — वृक्ष सेवा समितीची ५ पायऱ्यांची प्रक्रिया.",
};

/** Extra detail for each workflow step (by step id). */
const details: Record<string, string[]> = {
  collect: ["शाळा व महाविद्यालयांत संकलन मोहीम", "संकलन केंद्रावर दर आठवड्याला रद्दी स्वीकार", "जास्त रद्दी असल्यास घरून उचल"],
  weigh: ["पेपर, पुठ्ठा, प्लास्टिक, धातू वेगवेगळे केले जाते", "प्रत्येक दात्याच्या नावाने किलोची नोंद", "हीच नोंद लीडरबोर्डसाठी वापरली जाते"],
  sell: ["अधिकृत भंगार व्यापाऱ्यांना विक्री", "मिळालेला निधी फक्त रोपे, जाळी, पाणी यासाठी", "प्रत्येक व्यवहाराची अंतर्गत नोंद"],
  plant: ["जागेची परवानगी व योग्य जागेची निवड", "देशी झाडांची रोपे", "दात्यांना वृक्षारोपणात सहभागी होण्याचे आमंत्रण"],
  care: ["उन्हाळ्यात नियमित पाणी (टँकर / ठिबक)", "संरक्षक जाळी आणि आळे", "झाडांची वेळोवेळी पाहणी व जगलेल्या झाडांची नोंद"],
};

export default async function HowItWorksPage() {
  const [steps, items, images] = await Promise.all([getWorkflow(), getAcceptedItems(), getPageImages()]);

  return (
    <>
      <PageHero
        eyebrow="Our Workflow"
        title="How It Works"
        intro="तुमची रद्दी झाड कशी बनते? गोळा करण्यापासून झाड मोठे होईपर्यंत — ५ सोप्या पायऱ्या."
      />

      <Section tone="cream" labelledBy="overview-title">
        <div className="flex flex-col gap-10">
          <SectionHeading id="overview-title" title="Waste to Tree in 5 Steps" intro="एका नजरेत संपूर्ण प्रवास." />
          <WorkflowSteps steps={steps} />
        </div>
      </Section>

      <Section tone="white" labelledBy="detail-title">
        <div className="flex flex-col gap-10">
          <SectionHeading id="detail-title" eyebrow="Step by Step" title="What Happens at Each Step" />
          <ol className="relative mx-auto flex w-full max-w-[860px] flex-col gap-6 before:absolute before:top-6 before:bottom-6 before:left-[23px] before:w-[3px] before:rounded-full before:bg-mint-line sm:before:left-[27px]">
            {steps.map((step, i) => (
              <li key={step.id} className="reveal relative flex gap-4 sm:gap-6" style={revealDelay(i, 60)}>
                <span className="relative z-10 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand font-display text-xl font-extrabold text-white ring-4 ring-white sm:h-14 sm:w-14 sm:text-2xl">
                  {toMarathiDigits(i + 1)}
                </span>
                <div className="flex-1 rounded-[22px] border border-line bg-cream p-5 sm:p-6">
                  <h3 lang="en" className="m-0 text-2xl font-bold">
                    {step.titleEn}
                  </h3>
                  <p className="m-0 mt-1.5 text-ink-soft">{step.textMr}</p>
                  <ul className="m-0 mt-3 flex flex-col gap-1.5">
                    {(details[step.id] ?? []).map((d) => (
                      <li key={d} className="flex gap-2 text-[16px] text-muted">
                        <Check size={20} className="mt-0.5 shrink-0 text-brand" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="cream" labelledBy="accept-title">
        <div className="flex flex-col gap-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <SectionHeading
              id="accept-title"
              eyebrow="Before You Give"
              title="What We Accept"
              intro="रद्दी स्वच्छ, कोरडी आणि शक्य असल्यास बांधून द्या — त्यामुळे वजन करणे आणि विकणे सोपे होते."
              align="left"
            />
            <div className="reveal relative aspect-[4/3] overflow-hidden rounded-[22px]">
              <Image
                src={images.collectionImage.src}
                alt={images.collectionImage.alt}
                fill
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <AcceptedItems items={items} />
          <div className="reveal flex justify-center">
            <LinkButton href="/get-involved" size="lg">
              रद्दी कशी द्यायची ते पहा <ArrowRight size={20} />
            </LinkButton>
          </div>
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
