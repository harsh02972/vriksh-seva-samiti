import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui";
import { getContact, getSiteInfo } from "@/lib/content";
import { formatDateMr } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "वृक्ष सेवा समितीच्या वेबसाइटचे गोपनीयता धोरण — आम्ही कोणती माहिती वापरतो आणि कशी.",
  path: "/privacy",
});

const LAST_UPDATED = "2026-11-23";

export default async function PrivacyPage() {
  const [site, contact] = await Promise.all([getSiteInfo(), getContact()]);
  const sections = [
    {
      titleEn: "No Login, No Accounts",
      body: [
        "या वेबसाइटवर कोणतेही लॉगिन, खाते किंवा नोंदणी नाही. तुम्हाला कोणतीही वैयक्तिक माहिती भरावी लागत नाही.",
        "आम्ही जाहिरात किंवा ट्रॅकिंग कुकीज वापरत नाही.",
      ],
    },
    {
      titleEn: "Pickup Requests",
      body: [
        "“Request a Pickup” फॉर्म कोणतीही माहिती आमच्या सर्व्हरवर पाठवत किंवा साठवत नाही. तो फक्त तुमच्या WhatsApp मध्ये तयार संदेश उघडतो; तो पाठवायचा की नाही हे तुम्ही ठरवता.",
        "तुम्ही फोन, WhatsApp किंवा ईमेलने दिलेली माहिती (नाव, पत्ता, नंबर) फक्त रद्दी उचलण्यासाठी व संपर्कासाठी वापरली जाते. ती कोणालाही विकली किंवा दिली जात नाही.",
      ],
    },
    {
      titleEn: "Leaderboard",
      body: [
        "लीडरबोर्डवर फक्त नाव, प्रकार (शाळा / महाविद्यालय / व्यक्ती / संस्था) आणि झाडांची संख्या दाखवली जाते. कोणतीही आर्थिक रक्कम, फोन नंबर किंवा पत्ता दाखवला जात नाही.",
        "तुमचे नाव यादीतून काढायचे असल्यास किंवा बदलायचे असल्यास आम्हाला कळवा — आम्ही ते लगेच करू.",
      ],
    },
    {
      titleEn: "Photos & Video",
      body: [
        "गॅलरीतील फोटो आणि व्हिडिओ आमच्या मोहिमांमधील आहेत. मुलांचे फोटो शाळेच्या परवानगीनेच वापरले जातात.",
        "एखादा फोटो काढून टाकायचा असल्यास आम्हाला संपर्क करा.",
      ],
    },
    {
      titleEn: "Hosting",
      body: [
        "ही वेबसाइट Netlify वर होस्ट केली आहे. सुरक्षा व कामगिरीसाठी होस्टिंग सेवा तांत्रिक नोंदी (उदा. IP पत्ता, ब्राउझर प्रकार) काही काळ ठेवू शकते.",
        "व्हिडिओ आणि फोटो फक्त तुम्ही पाहता तेव्हाच लोड होतात.",
      ],
    },
  ];

  return (
    <>
      <PageHero eyebrow="Your Data" title="Privacy Policy" intro="आम्ही तुमची माहिती कमीत कमी वापरतो — आणि ती कधीही विकत नाही." />
      <Section tone="cream" labelledBy="page-title" containerClassName="pt-6 md:pt-8">
        <div className="mx-auto flex max-w-[760px] flex-col gap-5">
          {sections.map((s) => (
            <section key={s.titleEn} className="reveal rounded-[22px] bg-white p-6" aria-label={s.titleEn}>
              <h2 lang="en" className="m-0 text-2xl font-bold">
                {s.titleEn}
              </h2>
              {s.body.map((p) => (
                <p key={p} className="m-0 mt-2 text-ink-soft">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <section className="reveal rounded-[22px] border border-mint-line bg-mint p-6" aria-label="Contact">
            <h2 lang="en" className="m-0 text-2xl font-bold">
              Contact
            </h2>
            <p className="m-0 mt-2 text-ink-soft">
              गोपनीयतेबद्दल कोणताही प्रश्न असल्यास: <span lang="en">{contact.email}</span> किंवा{" "}
              <span lang="en">{contact.phoneDisplay}</span>.
            </p>
            <p className="m-0 mt-2 text-sm text-muted">
              {site.nameMr}, {site.placeMr} · शेवटचा बदल: {formatDateMr(LAST_UPDATED)}
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
