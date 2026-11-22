import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { getContact } from "@/lib/content";
import { toMarathiDigits } from "@/lib/format";
import { getInvolved, mainNav, privacy } from "@/lib/nav";
import { Mail, MapPin, Phone, WhatsApp } from "./icons";
import { Container, SampleNote } from "./ui";

export async function Footer() {
  const contact = await getContact();
  const socials = [
    { label: "Facebook", href: contact.socials?.facebook },
    { label: "Instagram", href: contact.socials?.instagram },
    { label: "YouTube", href: contact.socials?.youtube },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));
  return (
    <footer className="bg-forest-950 text-on-dark">
      <Container className="grid gap-10 pt-14 pb-8 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 rounded-[14px] bg-white object-contain p-1"
            />
            <span lang="en" className="font-display text-[22px] font-extrabold text-white">
              {site.nameEn}
            </span>
          </div>
          <p className="m-0 max-w-[380px] text-base">
            “{site.mottoMr}”. तुमची रद्दी, आमची झाडे, सर्वांचे भविष्य.
          </p>
          <p className="m-0 text-sm text-on-dark-soft">{site.placeMr}</p>
        </div>

        <nav aria-labelledby="footer-links" className="flex flex-col gap-2">
          <h2 id="footer-links" lang="en" className="m-0 mb-1 text-[19px] text-white">
            Quick Links
          </h2>
          <ul className="flex flex-col gap-1.5">
            {mainNav.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-on-dark no-underline hover:text-white hover:underline">
                  {item.labelMr}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-help" className="flex flex-col gap-2">
          <h2 id="footer-help" lang="en" className="m-0 mb-1 text-[19px] text-white">
            Get Involved
          </h2>
          <ul className="flex flex-col gap-1.5">
            <li>
              <Link href={getInvolved.href} className="text-on-dark no-underline hover:text-white hover:underline">
                रद्दी दान करा
              </Link>
            </li>
            <li>
              <Link href="/get-involved#accept" className="text-on-dark no-underline hover:text-white hover:underline">
                आम्ही काय स्वीकारतो
              </Link>
            </li>
            <li>
              <Link href="/get-involved#volunteer" className="text-on-dark no-underline hover:text-white hover:underline">
                स्वयंसेवक व्हा
              </Link>
            </li>
            <li>
              <Link href={privacy.href} className="text-on-dark no-underline hover:text-white hover:underline">
                {privacy.labelMr}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex flex-col gap-2">
          <h2 lang="en" className="m-0 mb-1 text-[19px] text-white">
            Contact
          </h2>
          <address className="flex flex-col gap-2 not-italic">
            <span className="flex gap-2.5">
              <MapPin size={20} className="mt-1 shrink-0 text-leaf" />
              {contact.addressMr}
            </span>
            <a href={`tel:${contact.phoneE164}`} className="flex gap-2.5 text-on-dark no-underline hover:text-white">
              <Phone size={20} className="mt-1 shrink-0 text-leaf" />
              <span lang="en">{contact.phoneDisplay}</span>
            </a>
            <a
              href={`https://wa.me/${contact.whatsappE164}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2.5 text-on-dark no-underline hover:text-white"
            >
              <WhatsApp size={20} className="mt-1 shrink-0 text-leaf" />
              <span>
                <span lang="en">WhatsApp</span> वर संदेश पाठवा
              </span>
            </a>
            <a href={`mailto:${contact.email}`} className="flex gap-2.5 break-all text-on-dark no-underline hover:text-white">
              <Mail size={20} className="mt-1 shrink-0 text-leaf" />
              <span lang="en">{contact.email}</span>
            </a>
          </address>
          {contact.whatsappGroupUrl && (
            <a
              href={contact.whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 self-start rounded-full bg-forest-800 px-4 py-2 font-semibold text-white no-underline hover:bg-forest-700 hover:text-white"
            >
              <WhatsApp size={18} /> <span lang="en">WhatsApp</span> ग्रुप
            </a>
          )}
          {socials.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1" aria-label="सोशल मीडिया">
              {socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" lang="en" className="text-on-dark hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {contact.isPlaceholder && <SampleNote force>संपर्क तपशील नमुना आहेत</SampleNote>}
        </div>
      </Container>
      <div className="border-t border-forest-700">
        <Container className="flex flex-col gap-2 py-5 text-sm text-on-dark-soft sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {toMarathiDigits(site.copyrightYear)} {site.nameMr}, वर्धा
          </span>
          <span>तुमची रद्दी, आमची झाडे — हिरवे वर्धा.</span>
        </Container>
      </div>
    </footer>
  );
}
