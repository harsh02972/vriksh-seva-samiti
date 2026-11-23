import type { Metadata } from "next";
import Image from "next/image";
import { CampaignCard } from "@/components/CampaignCard";
import { CtaBanner } from "@/components/CtaBanner";
import { ImpactStats } from "@/components/home/ImpactStats";
import { Check, Droplet, School, Sprout, Users } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { Container, revealDelay, SampleNote, Section, SectionHeading } from "@/components/ui";
import { getCurrentCampaign, getImpactStats, getPageImages, getPageText, getSiteInfo, getValues } from "@/lib/content";
import { lines } from "@/lib/page-text";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: "वृक्ष सेवा समिती, सिंदी (मेघे), वर्धा — आमचे ध्येय, आमचे काम आणि आमची टीम.",
  path: "/about",
});

const PROMISE_ICONS = [Sprout, Droplet, School, Users];

export default async function AboutPage() {
  const [site, values, stats, campaign, images, t, home] = await Promise.all([
    getSiteInfo(),
    getValues(),
    getImpactStats(),
    getCurrentCampaign(),
    getPageImages(),
    getPageText("about"),
    getPageText("home"),
  ]);
  const promises = PROMISE_ICONS.map((Icon, i) => {
    const n = i + 1;
    return {
      Icon,
      titleEn: t[`promise${n}Title` as "promise1Title"],
      textMr: t[`promise${n}Text` as "promise1Text"],
    };
  });
  const team = lines(t.teamMembers).map((line) => {
    const [name, ...role] = line.split(/\s+[—–-]\s+/);
    return { name, role: role.join(" — ") };
  });

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={t.heroTitle}
        intro={t.heroIntro}
      />

      <Section tone="cream" labelledBy="story-title">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-4">
            <SectionHeading id="story-title" eyebrow="Our Story" title={t.storyTitle} align="left" />
            {lines(t.storyText).map((para, i) => (
              <p key={i} className="reveal m-0 text-ink-soft">
                {para}
              </p>
            ))}
          </div>
          <div className="reveal relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-[var(--shadow-lift)]">
              <Image
                src={images.aboutImage.src}
                alt={images.aboutImage.alt}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-2 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-lift)] sm:-left-6">
              <Image src="/logo.png" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
              <span className="text-sm leading-tight font-semibold text-forest-900">
                {site.nameMr}
                <br />
                <span className="font-normal text-muted">{site.placeMr}</span>
              </span>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="white" labelledBy="mission-title">
        <div className="flex flex-col gap-10">
          <SectionHeading
            id="mission-title"
            eyebrow="Our Mission"
            title={t.missionTitle}
            intro={t.missionIntro}
          />
          <ul className="grid gap-4 md:grid-cols-3">
            {values.map((v, i) => (
              <li key={v.titleEn} className="reveal lift rounded-[22px] border border-line bg-cream p-6" style={revealDelay(i)}>
                <span className="font-display text-5xl font-extrabold text-leaf">{["१", "२", "३"][i]}</span>
                <h3 lang="en" className="m-0 mt-2 text-2xl font-bold text-brand">
                  {v.titleEn}
                </h3>
                <p className="m-0 mt-1 text-muted">{v.textMr}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="cream" labelledBy="promise-title">
        <div className="flex flex-col gap-10">
          <SectionHeading id="promise-title" eyebrow="What Makes Us Different" title={t.promiseTitle} />
          <ul className="grid gap-4 sm:grid-cols-2">
            {promises.map(({ Icon, titleEn, textMr }, i) => (
              <li key={titleEn} className="reveal flex gap-4 rounded-[22px] bg-white p-6 shadow-[var(--shadow-card)]" style={revealDelay(i)}>
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mint text-brand">
                  <Icon size={26} />
                </span>
                <div>
                  <h3 lang="en" className="m-0 text-xl font-bold">
                    {titleEn}
                  </h3>
                  <p className="m-0 mt-1 text-muted">{textMr}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="reveal mx-auto flex max-w-[760px] flex-col gap-3 rounded-[22px] border border-mint-line bg-mint p-6">
            <h3 lang="en" className="m-0 text-xl font-bold">
              {t.transparencyTitle}
            </h3>
            <ul className="m-0 flex flex-col gap-2">
              {lines(t.transparencyPoints).map((point) => (
                <li key={point} className="flex gap-2.5">
                  <Check size={22} className="mt-0.5 shrink-0 text-brand" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <ImpactStats stats={stats} title={home.impactTitle} intro={home.impactIntro} />

      {campaign && (
        <section aria-labelledby="campaign-title" className="bg-mint">
          <Container className="py-14 md:py-16">
            <CampaignCard campaign={campaign} />
          </Container>
        </section>
      )}

      <Section tone="white" labelledBy="team-title">
        <div className="flex flex-col items-center gap-4 text-center">
          <SectionHeading
            id="team-title"
            eyebrow="Our Team"
            title={t.teamTitle}
            intro={t.teamText}
          />
          {team.length > 0 ? (
            <ul className="mt-2 grid w-full gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m, i) => (
                <li key={`${m.name}-${i}`} className="reveal flex items-center gap-3 rounded-[18px] border border-line bg-cream p-4" style={revealDelay(i, 60)}>
                  <span aria-hidden className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint font-display text-lg font-bold text-brand">
                    {m.name.slice(0, 1)}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="font-semibold text-forest-900">{m.name}</span>
                    {m.role && <span className="text-[15px] text-muted">{m.role}</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <SampleNote>टीमची माहिती अजून मिळालेली नाही</SampleNote>
          )}
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
