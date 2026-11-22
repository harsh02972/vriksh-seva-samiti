import Image from "next/image";
import Link from "next/link";
import { CampaignCard } from "@/components/CampaignCard";
import { CtaBanner } from "@/components/CtaBanner";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { ImpactStats } from "@/components/home/ImpactStats";
import { TreeCounterCard } from "@/components/home/TreeCounterCard";
import { ArrowRight } from "@/components/icons";
import { LeafDecor } from "@/components/LeafDecor";
import { LeaderboardRow } from "@/components/LeaderboardRow";
import { PlantingCard } from "@/components/PlantingCard";
import { Container, LinkButton, revealDelay, SampleNote, Section, SectionHeading } from "@/components/ui";
import { WorkflowSteps } from "@/components/WorkflowSteps";
import {
  getContact,
  getCurrentCampaign,
  getFeaturedVideo,
  getImpactStats,
  getLeaderboard,
  getPlantings,
  getSiteInfo,
  getValues,
  getWorkflow,
} from "@/lib/content";
import { rankEntries } from "@/lib/leaderboard";

export default async function HomePage() {
  const [site, contact, stats, steps, video, plantings, leaderboard, campaign, values] = await Promise.all([
    getSiteInfo(),
    getContact(),
    getImpactStats(),
    getWorkflow(),
    getFeaturedVideo(),
    getPlantings(3),
    getLeaderboard(),
    getCurrentCampaign(),
    getValues(),
  ]);
  const top5 = rankEntries(leaderboard).slice(0, 5);
  const maxTrees = top5[0]?.trees ?? 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: site.nameEn,
    alternateName: site.nameMr,
    slogan: site.mottoMr,
    url: site.siteUrl,
    logo: `${site.siteUrl}/logo.png`,
    address: { "@type": "PostalAddress", addressLocality: "Sindi (Meghe), Wardha", addressRegion: "Maharashtra", addressCountry: "IN" },
    ...(contact.isPlaceholder ? {} : { telephone: contact.phoneE164, email: contact.email }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden bg-mint">
        <LeafDecor />
        <Container className="relative grid items-center gap-10 py-12 md:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div className="hero-enter flex flex-col gap-5">
            <span className="self-start rounded-full border border-mint-line bg-white px-4 py-1.5 text-[15px] font-semibold text-brand">
              {site.placeMr} · हिरव्या वर्ध्यासाठी
            </span>
            <h1
              id="hero-title"
              lang="en"
              className="m-0 text-[clamp(40px,6vw,68px)] leading-[1.04] font-extrabold text-forest-900"
            >
              Your Scrap Can
              <br />
              Grow a <span className="text-brand underline decoration-leaf decoration-[6px] underline-offset-[10px]">Forest</span>
            </h1>
            <p className="m-0 max-w-[560px] text-lg text-ink-soft md:text-xl">
              शाळा, महाविद्यालये आणि नागरिकांकडून मिळालेली रद्दी, पेपर आणि भंगार आम्ही विकतो आणि त्या पैशातून वर्धा शहरात झाडे लावतो.
              प्रत्येक झाड मोठे होईपर्यंत आमची टीम त्याला पाणी घालते आणि त्याची काळजी घेते.
            </p>
            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <LinkButton href="/get-involved" size="lg">
                रद्दी दान करा <ArrowRight size={20} />
              </LinkButton>
              <LinkButton href="/our-work" variant="outline" size="lg">
                आमचे काम पहा
              </LinkButton>
            </div>
            <p className="m-0 text-base text-muted italic">“{site.mottoMr}”</p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <TreeCounterCard stats={stats} />
          </div>
        </Container>
      </section>

      {/* IMPACT NUMBERS */}
      <ImpactStats stats={stats} />

      {/* ABOUT PREVIEW */}
      <Section tone="white" labelledBy="about-title">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-14">
          <div className="reveal flex justify-center">
            <div className="relative flex aspect-square w-full max-w-[420px] items-center justify-center rounded-[32px] bg-mint">
              <Image
                src="/logo.png"
                alt="वृक्ष सेवा समिती, वर्धा — लोगो"
                width={334}
                height={319}
                sizes="(min-width: 1024px) 330px, 78vw"
                className="h-[78%] w-[78%] rounded-3xl object-contain"
              />
              <span className="absolute -right-2 -bottom-4 rounded-2xl bg-sun px-4 py-2 font-display text-lg font-bold text-sun-ink shadow-lg sm:-right-4">
                🌱 रद्दी → झाड
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <SectionHeading id="about-title" eyebrow="About Us" title="Planting Trees, Caring for Life" align="left" />
            <p className="reveal m-0 text-ink-soft">
              वृक्ष सेवा समिती, सिंदी (मेघे), वर्धा ही पर्यावरणासाठी काम करणारी समिती आहे. “{site.mottoMr}” हे आमचे ब्रीदवाक्य आहे.
              आम्ही फक्त झाडे लावत नाही, तर ती मोठी होईपर्यंत त्यांची काळजी घेतो.
            </p>
            <p className="reveal m-0 text-ink-soft">
              लोकांकडून मिळालेली रद्दी आणि भंगार विकून येणारा पैसा वृक्षारोपणासाठी वापरला जातो. त्यामुळे कचरा कमी होतो आणि हिरवळ
              वाढते — दोन्ही एकाच वेळी.
            </p>
            <ul className="mt-1 grid gap-3 sm:grid-cols-3">
              {values.map((v, i) => (
                <li key={v.titleEn} className="reveal rounded-2xl border border-line p-4" style={revealDelay(i)}>
                  <h3 lang="en" className="m-0 text-xl font-bold text-brand">
                    {v.titleEn}
                  </h3>
                  <p className="m-0 text-[15px] text-muted">{v.textMr}</p>
                </li>
              ))}
            </ul>
            <Link href="/about" className="reveal mt-1 inline-flex items-center gap-2 self-start font-bold">
              आमच्याबद्दल अधिक वाचा <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </Section>

      {/* WORKFLOW */}
      <Section tone="cream" labelledBy="how-title">
        <div className="flex flex-col gap-10">
          <SectionHeading
            id="how-title"
            eyebrow="Our Workflow"
            title="How It Works"
            intro="रद्दी देण्यापासून झाड मोठे होईपर्यंत — फक्त ५ सोप्या पायऱ्या."
          />
          <WorkflowSteps steps={steps} />
          <div className="reveal flex justify-center">
            <LinkButton href="/how-it-works" variant="outline">
              संपूर्ण प्रक्रिया पहा <ArrowRight size={18} />
            </LinkButton>
          </div>
        </div>
      </Section>

      {/* FEATURED VIDEO */}
      <Section tone="white" labelledBy="video-title" className="overflow-hidden">
        <div className="flex flex-col gap-10">
          <SectionHeading id="video-title" eyebrow="Watch" title={video.titleEn} intro="एक छोटा व्हिडिओ — आवाजासह. प्ले बटण दाबल्यावरच सुरू होतो." />
          <FeaturedVideo video={video} />
        </div>
      </Section>

      {/* LATEST PLANTINGS */}
      <Section tone="cream" labelledBy="plantings-title">
        <div className="flex flex-col gap-10">
          <SectionHeading
            id="plantings-title"
            eyebrow="Our Work"
            title="Latest Plantings"
            intro="नुकत्याच झालेल्या वृक्षारोपण मोहिमा — आणि त्यातील किती झाडे जगली, तेही."
          />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plantings.map((p, i) => (
              <li key={p.id}>
                <PlantingCard planting={p} style={revealDelay(i, 120)} />
              </li>
            ))}
          </ul>
          <div className="reveal flex justify-center">
            <LinkButton href="/our-work" variant="outline">
              सर्व वृक्षारोपण पहा <ArrowRight size={18} />
            </LinkButton>
          </div>
        </div>
      </Section>

      {/* LEADERBOARD TOP 5 */}
      <Section tone="white" labelledBy="leaders-title">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-14">
          <div className="flex flex-col gap-4">
            <SectionHeading
              id="leaders-title"
              eyebrow="Leaderboard"
              title="Our Green Champions"
              intro="ज्यांच्या रद्दीमुळे सर्वाधिक झाडे लागली — शाळा, महाविद्यालये, संस्था आणि नागरिक. मनःपूर्वक धन्यवाद!"
              align="left"
            />
            <div className="reveal flex flex-col items-start gap-3">
              <LinkButton href="/leaderboard">
                संपूर्ण लीडरबोर्ड पहा <ArrowRight size={18} />
              </LinkButton>
              {top5.some((e) => e.isSample) && <SampleNote>नमुना नावे व आकडे</SampleNote>}
            </div>
          </div>
          <ol className="reveal flex flex-col gap-2.5" aria-label="पहिले ५ योगदानकर्ते">
            {top5.map((entry) => (
              <LeaderboardRow key={entry.id} entry={entry} maxTrees={maxTrees} />
            ))}
          </ol>
        </div>
      </Section>

      {/* CURRENT CAMPAIGN */}
      <section aria-labelledby="campaign-title" className="bg-mint">
        <Container className="py-14 md:py-16">
          <CampaignCard campaign={campaign} />
        </Container>
      </section>

      {/* CALL TO ACTION */}
      <CtaBanner />
    </>
  );
}
