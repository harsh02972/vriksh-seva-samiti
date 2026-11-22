import type { Metadata } from "next";
import { CtaBanner } from "@/components/CtaBanner";
import { Gallery } from "@/components/Gallery";
import { PageHero } from "@/components/PageHero";
import { SampleNote, Section } from "@/components/ui";
import { getGallery } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "रद्दी संकलन, वृक्षारोपण आणि झाडांच्या संगोपनाचे फोटो — ठिकाण व तारखेसह.",
};

export default async function GalleryPage() {
  const photos = await getGallery();
  return (
    <>
      <PageHero
        eyebrow="Photos"
        title="Gallery"
        intro="आमच्या कामाचे क्षण — रद्दी संकलन, वृक्षारोपण आणि झाडांचे संगोपन. कोणताही फोटो मोठा पाहण्यासाठी त्यावर टॅप करा."
      >
        {photos.some((p) => p.isSample) && <SampleNote>सर्व फोटो नमुना चित्रे आहेत — खरे फोटो नंतर येतील</SampleNote>}
      </PageHero>
      <Section tone="cream" labelledBy="page-title" containerClassName="pt-6 md:pt-8">
        <Gallery photos={photos} />
      </Section>
      <CtaBanner />
    </>
  );
}
