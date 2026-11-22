import type { Metadata } from "next";
import { AcceptedItems } from "@/components/AcceptedItems";
import { CampaignCard } from "@/components/CampaignCard";
import { ArrowRight, Box, Check, Clock, MapPin, Phone, School, Truck, Users, WhatsApp } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { PickupRequest } from "@/components/PickupRequest";
import { AnchorButton, Container, LinkButton, revealDelay, SampleNote, Section, SectionHeading } from "@/components/ui";
import { getAcceptedItems, getContact, getCurrentCampaign, getGiveMethods } from "@/lib/content";

export const metadata: Metadata = {
  title: "Get Involved — Donate Waste",
  description: "रद्दी, पेपर, पुठ्ठा आणि भंगार दान करा — केंद्रावर आणा, शाळेत मोहीम घ्या किंवा घरून उचल ठरवा. स्वयंसेवक व्हा.",
};

const METHOD_ICONS = { dropoff: Box, school: School, pickup: Truck } as const;

const tips = [
  "रद्दी कोरडी ठेवा — ओली रद्दी विकली जात नाही.",
  "पेपर, पुठ्ठा, प्लास्टिक व धातू वेगवेगळे ठेवा.",
  "पेपरचे गठ्ठे दोरीने बांधा.",
  "पुस्तके चांगल्या स्थितीत असल्यास वेगळी ठेवा — गरजू विद्यार्थ्यांना देता येतील.",
];

export default async function GetInvolvedPage() {
  const [methods, items, contact, campaign] = await Promise.all([
    getGiveMethods(),
    getAcceptedItems(),
    getContact(),
    getCurrentCampaign(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Donate Waste"
        title="Get Involved"
        intro="तुमच्या घरातील, शाळेतील किंवा कार्यालयातील रद्दी आम्हाला द्या. तिच्यातून वर्ध्यात झाडे लागतील — आणि आम्ही ती मोठी होईपर्यंत जपू."
      >
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <LinkButton href="#pickup" size="lg">
            रद्दी उचलण्याची विनंती <ArrowRight size={20} />
          </LinkButton>
          <LinkButton href="#accept" variant="outline" size="lg">
            आम्ही काय स्वीकारतो
          </LinkButton>
        </div>
      </PageHero>

      {/* HOW TO GIVE */}
      <Section tone="cream" labelledBy="give-title">
        <div className="flex flex-col gap-10">
          <SectionHeading id="give-title" eyebrow="3 Easy Ways" title="How to Give" intro="तुम्हाला सोयीचा मार्ग निवडा." />
          <ul className="grid gap-5 md:grid-cols-3">
            {methods.map((m, i) => {
              const Icon = METHOD_ICONS[m.icon];
              return (
                <li key={m.id} className="reveal lift flex flex-col gap-3 rounded-[22px] border border-line bg-white p-6" style={revealDelay(i)}>
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-brand">
                    <Icon size={30} />
                  </span>
                  <h3 lang="en" className="m-0 text-[22px] font-bold">
                    {m.titleEn}
                  </h3>
                  <p className="m-0 text-muted">{m.textMr}</p>
                </li>
              );
            })}
          </ul>
          <div className="reveal grid gap-4 rounded-[22px] bg-forest-900 p-6 text-white sm:grid-cols-2 sm:p-8">
            <div className="flex gap-3">
              <MapPin size={26} className="shrink-0 text-leaf" />
              <div>
                <h3 lang="en" className="m-0 text-lg font-bold text-white">
                  Collection Centre
                </h3>
                <p className="m-0 text-on-dark">{contact.addressMr}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock size={26} className="shrink-0 text-leaf" />
              <div>
                <h3 lang="en" className="m-0 text-lg font-bold text-white">
                  Collection Hours
                </h3>
                <p className="m-0 text-on-dark">{contact.collectionHoursMr}</p>
              </div>
            </div>
            {contact.isPlaceholder && <SampleNote force>पत्ता व वेळ नमुना आहेत</SampleNote>}
          </div>
        </div>
      </Section>

      {/* WHAT WE ACCEPT */}
      <Section id="accept" tone="white" labelledBy="accept-title">
        <div className="flex flex-col gap-10">
          <SectionHeading id="accept-title" eyebrow="Before You Give" title="What We Accept" />
          <AcceptedItems items={items} />
          <div className="reveal rounded-[22px] border border-mint-line bg-mint p-6">
            <h3 lang="en" className="m-0 text-xl font-bold">
              Quick Tips
            </h3>
            <ul className="m-0 mt-3 grid gap-2 sm:grid-cols-2">
              {tips.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check size={22} className="mt-0.5 shrink-0 text-brand" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* PICKUP REQUEST */}
      <Section id="pickup" tone="cream" labelledBy="pickup-title">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-14">
          <div className="flex flex-col gap-5">
            <SectionHeading
              id="pickup-title"
              eyebrow="Home & School Pickup"
              title="Request a Pickup"
              intro="जास्त रद्दी आहे? माहिती भरा आणि WhatsApp वर पाठवा. आमची टीम तुम्हाला वेळ कळवेल."
              align="left"
            />
            <div className="reveal flex flex-col gap-3">
              <p className="m-0 font-semibold text-forest-900">किंवा थेट संपर्क करा:</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <AnchorButton href={`tel:${contact.phoneE164}`} variant="outline">
                  <Phone size={20} /> <span lang="en">{contact.phoneDisplay}</span>
                </AnchorButton>
                <AnchorButton href={`https://wa.me/${contact.whatsappE164}`} target="_blank" rel="noopener noreferrer" variant="outline">
                  <WhatsApp size={20} /> <span lang="en">WhatsApp</span>
                </AnchorButton>
              </div>
              {contact.isPlaceholder && <SampleNote force>फोन / WhatsApp नंबर नमुना आहे</SampleNote>}
            </div>
          </div>
          <div className="reveal">
            <PickupRequest whatsappE164={contact.whatsappE164} isPlaceholder={contact.isPlaceholder} />
          </div>
        </div>
      </Section>

      {/* SCHOOLS + VOLUNTEER */}
      <Section id="volunteer" tone="white" labelledBy="volunteer-title">
        <div className="flex flex-col gap-10">
          <SectionHeading
            id="volunteer-title"
            eyebrow="More Ways to Help"
            title="Volunteer With Us"
            intro="रद्दी नसेल तरी तुम्ही मदत करू शकता — वेळ देऊन."
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {[
              { Icon: School, titleEn: "Schools & Colleges", textMr: "तुमच्या संस्थेत 'हरित सेना' सुरू करा. रद्दी संकलन मोहीम घ्या आणि विद्यार्थ्यांना झाड दत्तक द्या." },
              { Icon: Users, titleEn: "Weekend Volunteers", textMr: "रविवारी सकाळी वृक्षारोपण, पाणी देणे आणि संरक्षक जाळी लावण्याच्या कामात सहभागी व्हा." },
              { Icon: Truck, titleEn: "Offer Support", textMr: "रोपे, जाळी, पाण्याचा टँकर, वाहन किंवा जागा देऊन मदत करू शकता. आमच्याशी बोला." },
            ].map(({ Icon, titleEn, textMr }, i) => (
              <li key={titleEn} className="reveal flex flex-col gap-3 rounded-[22px] bg-cream p-6" style={revealDelay(i)}>
                <Icon size={30} className="text-brand" />
                <h3 lang="en" className="m-0 text-[22px] font-bold">
                  {titleEn}
                </h3>
                <p className="m-0 text-muted">{textMr}</p>
              </li>
            ))}
          </ul>
          <div className="reveal flex justify-center">
            <LinkButton href="/contact" size="lg">
              स्वयंसेवक म्हणून संपर्क करा <ArrowRight size={20} />
            </LinkButton>
          </div>
        </div>
      </Section>

      <section aria-labelledby="campaign-title" className="bg-mint">
        <Container className="py-14 md:py-16">
          <CampaignCard campaign={campaign} showCta={false} />
        </Container>
      </section>
    </>
  );
}
