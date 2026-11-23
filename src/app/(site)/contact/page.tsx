import type { Metadata } from "next";
import { ArrowRight, Clock, Mail, MapPin, Phone, WhatsApp } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { AnchorButton, LinkButton, revealDelay, SampleNote, Section, SectionHeading } from "@/components/ui";
import { getContact, getPageText } from "@/lib/content";
import { parseFaqs } from "@/lib/page-text";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "वृक्ष सेवा समिती, सिंदी (मेघे), वर्धा — फोन, WhatsApp, ईमेल आणि पत्ता.",
  path: "/contact",
});

export default async function ContactPage() {
  const [contact, t] = await Promise.all([getContact(), getPageText("contact")]);
  const faqs = parseFaqs(t.faqs);
  const cards = [
    {
      Icon: Phone,
      titleEn: "Call Us",
      body: <span lang="en">{contact.phoneDisplay}</span>,
      action: { href: `tel:${contact.phoneE164}`, label: "फोन करा" },
    },
    {
      Icon: WhatsApp,
      titleEn: "WhatsApp",
      body: "संदेश पाठवा — आम्ही लवकरच उत्तर देऊ.",
      action: { href: `https://wa.me/${contact.whatsappE164}`, label: "WhatsApp उघडा", external: true },
    },
    {
      Icon: Mail,
      titleEn: "Email",
      body: <span lang="en" className="break-all">{contact.email}</span>,
      action: { href: `mailto:${contact.email}`, label: "ईमेल लिहा" },
    },
    {
      Icon: MapPin,
      titleEn: "Visit",
      body: contact.addressMr,
      action: { href: contact.mapUrl, label: "नकाशावर पहा", external: true },
    },
  ];

  const socialLinks = [
    { label: "Facebook", href: contact.socials?.facebook },
    { label: "Instagram", href: contact.socials?.instagram },
    { label: "YouTube", href: contact.socials?.youtube },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title={t.heroTitle}
        intro={t.heroIntro}
      >
        {contact.isPlaceholder && <SampleNote force>सर्व संपर्क तपशील नमुना आहेत — खरे तपशील लवकरच</SampleNote>}
      </PageHero>

      <Section tone="cream" labelledBy="page-title" containerClassName="pt-6 md:pt-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ Icon, titleEn, body, action }, i) => (
            <li key={titleEn} className="reveal lift flex flex-col gap-3 rounded-[22px] border border-line bg-white p-6" style={revealDelay(i)}>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-brand">
                <Icon size={26} />
              </span>
              <h2 lang="en" className="m-0 text-[22px] font-bold">
                {titleEn}
              </h2>
              <p className="m-0 flex-1 text-muted">{body}</p>
              <AnchorButton
                href={action.href}
                variant="outline"
                className="self-start"
                {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {action.label}
              </AnchorButton>
            </li>
          ))}
        </ul>
        <div className="reveal mt-5 flex items-center gap-3 rounded-[22px] bg-white p-5 text-ink-soft">
          <Clock size={24} className="shrink-0 text-brand" />
          <span>
            <strong className="text-forest-900">रद्दी संकलन वेळ:</strong> {contact.collectionHoursMr}
          </span>
        </div>
        {(contact.whatsappGroupUrl || socialLinks.length > 0) && (
          <div className="reveal mt-5 flex flex-col gap-3 rounded-[22px] bg-white p-5 sm:flex-row sm:flex-wrap sm:items-center">
            {contact.whatsappGroupUrl && (
              <AnchorButton href={contact.whatsappGroupUrl} target="_blank" rel="noopener noreferrer">
                <WhatsApp size={20} /> आमच्या <span lang="en">WhatsApp</span> ग्रुपमध्ये सामील व्हा
              </AnchorButton>
            )}
            {socialLinks.map((s) => (
              <AnchorButton key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" variant="outline">
                <span lang="en">{s.label}</span>
              </AnchorButton>
            ))}
          </div>
        )}
      </Section>

      <Section tone="white" labelledBy="faq-title">
        <div className="mx-auto flex max-w-[820px] flex-col gap-8">
          <SectionHeading id="faq-title" eyebrow="FAQ" title={t.faqTitle} />
          <div className="flex flex-col gap-3">
            {faqs.map((f) => (
              <details key={f.q} className="reveal group rounded-[18px] border border-line bg-cream px-5 py-4 open:bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-forest-900 marker:hidden">
                  {f.q}
                  <span aria-hidden className="text-2xl leading-none text-brand transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="m-0 mt-2 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="reveal flex justify-center">
            <LinkButton href="/get-involved" size="lg">
              रद्दी दान करा <ArrowRight size={20} />
            </LinkButton>
          </div>
        </div>
      </Section>
    </>
  );
}
