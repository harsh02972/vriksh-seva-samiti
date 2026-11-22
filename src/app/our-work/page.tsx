import type { Metadata } from "next";
import { CountUp } from "@/components/CountUp";
import { CtaBanner } from "@/components/CtaBanner";
import { ArrowRight } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { PlantingCard } from "@/components/PlantingCard";
import { LinkButton, revealDelay, SampleNote, Section, SectionHeading } from "@/components/ui";
import { getPlantings } from "@/lib/content";
import { percent, toMarathiDigits } from "@/lib/format";

export const metadata: Metadata = {
  title: "Our Work",
  description: "वर्धा शहरातील आमच्या वृक्षारोपण मोहिमा — ठिकाण, तारीख, झाडांच्या जाती आणि किती झाडे जगली.",
};

export default async function OurWorkPage() {
  const plantings = await getPlantings();
  const planted = plantings.reduce((sum, p) => sum + p.treesPlanted, 0);
  const surviving = plantings.reduce((sum, p) => sum + p.treesSurviving, 0);
  const places = new Set(plantings.map((p) => p.placeMr)).size;
  const species = new Set(plantings.flatMap((p) => p.speciesMr)).size;

  // Group by year, newest first.
  const byYear = new Map<string, typeof plantings>();
  for (const p of plantings) {
    const y = p.date.slice(0, 4);
    byYear.set(y, [...(byYear.get(y) ?? []), p]);
  }

  const summary = [
    { value: planted, label: "या मोहिमांत लावलेली झाडे" },
    { value: surviving, label: `जगलेली झाडे (${toMarathiDigits(percent(surviving, planted))}%)` },
    { value: places, label: "ठिकाणे" },
    { value: species, label: "झाडांच्या देशी जाती" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Plantings Showcase"
        title="Our Work"
        intro="प्रत्येक वृक्षारोपणाची नोंद — कुठे, कधी, कोणती झाडे आणि आज त्यातील किती झाडे जगली आहेत."
      />

      <Section tone="cream" containerClassName="pt-4 pb-6 md:pt-6 md:pb-8" labelledBy="summary-title">
        <h2 id="summary-title" lang="en" className="sr-only">
          Summary
        </h2>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {summary.map((s, i) => (
            <li key={s.label} className="reveal rounded-[20px] bg-white p-5 shadow-[var(--shadow-card)]" style={revealDelay(i)}>
              <span className="font-display text-4xl font-extrabold text-brand">
                <CountUp value={s.value} />
              </span>
              <p className="m-0 text-[15px] text-muted">{s.label}</p>
            </li>
          ))}
        </ul>
        {plantings.some((p) => p.isSample) && (
          <div className="mt-4">
            <SampleNote>नमुना मोहिमा व चित्रे — खरी माहिती नंतर भरली जाईल</SampleNote>
          </div>
        )}
      </Section>

      {[...byYear.entries()].map(([year, items]) => (
        <Section key={year} tone="cream" labelledBy={`year-${year}`} containerClassName="py-10 md:py-12">
          <div className="flex flex-col gap-6">
            <div className="reveal flex items-center gap-4">
              <h2 id={`year-${year}`} className="m-0 text-3xl font-extrabold">
                {toMarathiDigits(year)}
              </h2>
              <span aria-hidden className="h-[3px] flex-1 rounded-full bg-mint-line" />
              <span className="text-[15px] text-muted">{toMarathiDigits(items.length)} मोहिमा</span>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p, i) => (
                <li key={p.id}>
                  <PlantingCard planting={p} style={revealDelay(i, 100)} showCare />
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ))}

      <Section tone="white" labelledBy="care-title">
        <div className="flex flex-col items-center gap-5 text-center">
          <SectionHeading
            id="care-title"
            eyebrow="Beyond Planting"
            title="We Care Until It Grows"
            intro="झाड लावल्यानंतर पहिली दोन-तीन वर्षे सर्वात महत्त्वाची असतात. उन्हाळ्यात पाणी, जनावरांपासून संरक्षण आणि नियमित पाहणी — म्हणूनच आमच्या झाडांचे जगण्याचे प्रमाण जास्त आहे."
          />
          <LinkButton href="/gallery" variant="outline" className="reveal">
            फोटो गॅलरी पहा <ArrowRight size={18} />
          </LinkButton>
        </div>
      </Section>

      <CtaBanner title="Want a Planting at Your School?" text="तुमच्या शाळा, महाविद्यालय किंवा परिसरात रद्दी संकलन व वृक्षारोपण मोहीम घ्यायची आहे? आमच्याशी संपर्क करा." />
    </>
  );
}
