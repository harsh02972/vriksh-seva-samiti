import type { ImpactStats as Stats } from "@/data/site";
import { percent, toMarathiDigits } from "@/lib/format";
import { CountUp } from "../CountUp";
import { Droplet, Recycle, Tree, Users } from "../icons";
import { LeafDecor } from "../LeafDecor";
import { revealDelay, SampleNote, Section, SectionHeading } from "../ui";

export function ImpactStats({
  stats,
  headingLevel = "h2",
  title = "Our Green Impact",
  intro = "प्रत्येक किलो रद्दी म्हणजे हिरव्या वर्ध्याकडे एक पाऊल.",
}: {
  stats: Stats;
  headingLevel?: "h2";
  title?: string;
  intro?: string;
}) {
  const items = [
    { value: stats.treesPlanted, titleEn: "Trees Planted", textMr: "वर्धा शहरात लावलेली झाडे", Icon: Tree },
    {
      value: stats.treesSurviving,
      titleEn: "Trees Surviving",
      textMr: `संगोपनामुळे जगलेली झाडे (${toMarathiDigits(percent(stats.treesSurviving, stats.treesPlanted))}%)`,
      Icon: Droplet,
    },
    { value: stats.wasteKg, titleEn: "Kg Waste Collected", textMr: "कचऱ्यात न जाता पुनर्वापरात गेलेली रद्दी (किलो)", Icon: Recycle },
    { value: stats.donors, titleEn: "Donors", textMr: "शाळा, महाविद्यालये, संस्था आणि नागरिक", Icon: Users },
  ];
  return (
    <Section id="impact" tone="forest" labelledBy="impact-title" className="overflow-hidden">
      <LeafDecor tone="dark" />
      <div className="relative flex flex-col gap-8">
        <SectionHeading
          id="impact-title"
          as={headingLevel}
          title={title}
          intro={intro}
          onDark
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {items.map(({ value, titleEn, textMr, Icon }, i) => (
            <li
              key={titleEn}
              className="reveal lift flex flex-col gap-1 rounded-[20px] bg-forest-800 p-6"
              style={revealDelay(i)}
            >
              <Icon size={28} className="mb-2 text-leaf" />
              <span className="font-display text-[44px] leading-tight font-extrabold text-sun">
                <CountUp value={value} />
              </span>
              <h3 lang="en" className="m-0 font-sans text-lg font-bold text-white">
                {titleEn}
              </h3>
              <p className="m-0 text-[15px] text-on-dark">{textMr}</p>
            </li>
          ))}
        </ul>
        {stats.isSample && <SampleNote className="self-center">नमुना आकडे — खरी माहिती नंतर भरली जाईल</SampleNote>}
      </div>
    </Section>
  );
}
