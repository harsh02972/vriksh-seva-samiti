import type { Metadata } from "next";
import { CtaBanner } from "@/components/CtaBanner";
import { Medal } from "@/components/icons";
import { Leaderboard } from "@/components/Leaderboard";
import { PageHero } from "@/components/PageHero";
import { revealDelay, SampleNote, Section } from "@/components/ui";
import { getLeaderboard } from "@/lib/content";
import { formatNumberMr } from "@/lib/format";
import { CONTRIBUTOR_LABEL_MR, rankEntries } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "ज्यांच्या रद्दीमुळे वर्ध्यात सर्वाधिक झाडे लागली — शाळा, महाविद्यालये, संस्था आणि नागरिक.",
};

export default async function LeaderboardPage() {
  const entries = await getLeaderboard();
  const top3 = rankEntries(entries).slice(0, 3);
  // Podium order: 2nd, 1st, 3rd
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = { 1: "sm:h-[220px]", 2: "sm:h-[180px]", 3: "sm:h-[150px]" } as const;

  return (
    <>
      <PageHero
        eyebrow="Thank You"
        title="Leaderboard"
        intro="ज्यांच्या रद्दीमुळे सर्वाधिक झाडे लागली त्यांची यादी. इथे फक्त नाव, प्रकार आणि झाडांची संख्या दाखवली जाते."
      >
        {entries.some((e) => e.isSample) && <SampleNote>नमुना नावे व आकडे — खरी यादी नंतर भरली जाईल</SampleNote>}
      </PageHero>

      <Section tone="cream" labelledBy="podium-title" containerClassName="pt-6 pb-4 md:pt-8 md:pb-6">
        <h2 id="podium-title" lang="en" className="sr-only">
          Top 3
        </h2>
        <ol className="mx-auto grid max-w-[820px] gap-3 sm:grid-cols-3 sm:items-end">
          {podium.map((e, i) => {
            const place = e.rank as 1 | 2 | 3;
            return (
              <li
                key={e.id}
                className={`reveal flex flex-col items-center justify-end gap-2 rounded-[22px] border bg-white p-5 text-center shadow-[var(--shadow-card)] ${heights[place] ?? ""} ${place === 1 ? "order-first border-sun sm:order-none" : "border-line"}`}
                style={revealDelay(place === 1 ? 0 : i + 1, 140)}
              >
                <Medal place={place} size={place === 1 ? 56 : 46} />
                <span className="sr-only">{["पहिला", "दुसरा", "तिसरा"][place - 1]} क्रमांक</span>
                <span className="leading-snug font-bold text-forest-900">{e.nameMr}</span>
                <span className="text-sm text-muted">{CONTRIBUTOR_LABEL_MR[e.type]}</span>
                <span className="font-display text-3xl leading-none font-extrabold text-brand">
                  {formatNumberMr(e.trees)} <span className="text-base font-semibold">झाडे</span>
                </span>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section tone="cream" labelledBy="list-title" containerClassName="pt-6 md:pt-8">
        <div className="mx-auto flex max-w-[860px] flex-col gap-4">
          <h2 id="list-title" lang="en" className="m-0 text-[clamp(26px,3vw,34px)] font-extrabold">
            Full Ranking
          </h2>
          <Leaderboard entries={entries} />
          <p className="m-0 rounded-2xl bg-mint px-4 py-3 text-[15px] text-ink-soft">
            दिलेल्या रद्दीच्या विक्रीतून लागलेल्या झाडांच्या संख्येवर क्रमांक ठरतो. समान झाडे असल्यास समान क्रमांक. तुमचे नाव
            यादीत नको असल्यास किंवा चुकीचे असल्यास आम्हाला कळवा.
          </p>
        </div>
      </Section>

      <CtaBanner title="Get Your Name on the Board" text="तुमची शाळा, महाविद्यालय, संस्था किंवा कुटुंब — रद्दी द्या आणि लीडरबोर्डवर या." />
    </>
  );
}
