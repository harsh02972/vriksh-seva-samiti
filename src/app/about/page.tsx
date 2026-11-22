import type { Metadata } from "next";
import Image from "next/image";
import { CampaignCard } from "@/components/CampaignCard";
import { CtaBanner } from "@/components/CtaBanner";
import { ImpactStats } from "@/components/home/ImpactStats";
import { Check, Droplet, School, Sprout, Users } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { Container, revealDelay, SampleNote, Section, SectionHeading } from "@/components/ui";
import { getCurrentCampaign, getImpactStats, getPageImages, getSiteInfo, getValues } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description: "वृक्ष सेवा समिती, सिंदी (मेघे), वर्धा — आमचे ध्येय, आमचे काम आणि आमची टीम.",
};

const promises = [
  { Icon: Sprout, titleEn: "Native Trees", textMr: "वर्ध्याच्या हवामानात चांगली वाढणारी देशी झाडे — कडुनिंब, वड, पिंपळ, करंज, जांभूळ, आंबा." },
  { Icon: Droplet, titleEn: "Care Until Grown", textMr: "झाड लावून थांबत नाही. ते मोठे होईपर्यंत नियमित पाणी, संरक्षक जाळी आणि निगा." },
  { Icon: School, titleEn: "Schools & Colleges", textMr: "विद्यार्थ्यांना रद्दी संकलन आणि वृक्षसंगोपनात सहभागी करून पर्यावरणाचे संस्कार." },
  { Icon: Users, titleEn: "Open to Everyone", textMr: "कोणीही रद्दी देऊ शकतो, कोणीही स्वयंसेवक होऊ शकतो. कोणतीही नोंदणी किंवा लॉगिन नाही." },
];

export default async function AboutPage() {
  const [site, values, stats, campaign, images] = await Promise.all([
    getSiteInfo(),
    getValues(),
    getImpactStats(),
    getCurrentCampaign(),
    getPageImages(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Planting Trees, Caring for Life"
        intro={`“${site.mottoMr}” — हे आमचे ब्रीदवाक्य. सिंदी (मेघे), वर्धा येथील नागरिकांनी सुरू केलेली ही पर्यावरण सेवा समिती आहे.`}
      />

      <Section tone="cream" labelledBy="story-title">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-4">
            <SectionHeading id="story-title" eyebrow="Our Story" title="From Scrap to Shade" align="left" />
            <p className="reveal m-0 text-ink-soft">
              वृक्ष सेवा समिती, सिंदी (मेघे), वर्धा ही पर्यावरणासाठी काम करणारी समिती आहे. घराघरात, शाळांमध्ये आणि कार्यालयांमध्ये
              पडून असलेली रद्दी कचऱ्यात जाऊ नये, आणि तिच्यातून काहीतरी चांगले उभे राहावे — या विचारातून आमचे काम सुरू झाले.
            </p>
            <p className="reveal m-0 text-ink-soft">
              आम्ही शाळा, महाविद्यालये आणि नागरिकांकडून रद्दी पेपर व भंगार गोळा करतो, ते विकतो आणि त्यातून येणारा पैसा फक्त
              वृक्षारोपण व संगोपनासाठी वापरतो. झाड लावणे सोपे आहे; ते जगवणे खरे काम आहे. म्हणूनच आमची टीम प्रत्येक झाडाला ते मोठे
              होईपर्यंत पाणी घालते आणि त्याची काळजी घेते.
            </p>
            <p className="reveal m-0 text-ink-soft">
              आज आमचे सर्व अपडेट्स <span lang="en">WhatsApp</span> वर जातात. ही वेबसाइट आमच्या कामाची पारदर्शक नोंद आहे — किती
              झाडे लागली, किती जगली आणि कोणाच्या मदतीने.
            </p>
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
            title="Plant. Protect. Prove."
            intro="आमच्या कामाची तीन तत्त्वे — प्रत्येक झाडासाठी."
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
          <SectionHeading id="promise-title" eyebrow="What Makes Us Different" title="Our Promise" />
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
              Transparency
            </h3>
            <ul className="m-0 flex flex-col gap-2">
              {[
                "प्रत्येक वृक्षारोपणाचे ठिकाण, तारीख, झाडांची संख्या आणि जगलेली झाडे वेबसाइटवर.",
                "लीडरबोर्डवर फक्त नाव, प्रकार आणि झाडांची संख्या — आर्थिक रक्कम कधीही सार्वजनिक नाही.",
                "दात्यांची माहिती कोणालाही दिली किंवा विकली जात नाही.",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check size={22} className="mt-0.5 shrink-0 text-brand" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <ImpactStats stats={stats} />

      <section aria-labelledby="campaign-title" className="bg-mint">
        <Container className="py-14 md:py-16">
          <CampaignCard campaign={campaign} />
        </Container>
      </section>

      <Section tone="white" labelledBy="team-title">
        <div className="flex flex-col items-center gap-4 text-center">
          <SectionHeading
            id="team-title"
            eyebrow="Our Team"
            title="People Behind the Trees"
            intro="समितीचे पदाधिकारी आणि स्वयंसेवक — नावे व फोटो लवकरच येथे."
          />
          <SampleNote>टीमची माहिती अजून मिळालेली नाही</SampleNote>
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
