import Image from "next/image";
import type { GalleryPhoto } from "@/data/site";
import { formatDateMr } from "@/lib/format";
import { ArrowRight } from "../icons";
import { LinkButton, revealDelay, Section, SectionHeading } from "../ui";

/** Photos the admin chose for Home. A swipeable row on phones, a grid on desktop. CSS only. */
export function HomePhotos({ photos, title, intro }: { photos: GalleryPhoto[]; title: string; intro: string }) {
  return (
    <Section tone="mint" labelledBy="home-photos-title">
      <div className="flex flex-col gap-8">
        <SectionHeading id="home-photos-title" eyebrow="Gallery" title={title} intro={intro} />
        <ul
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4"
          aria-label="निवडक फोटो"
        >
          {photos.map((photo, i) => (
            <li key={photo.id} className="reveal w-[78%] shrink-0 snap-start sm:w-auto" style={revealDelay(i, 70)}>
              <figure className="m-0 overflow-hidden rounded-[20px] bg-white shadow-[var(--shadow-card)]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={photo.image.src}
                    alt={photo.image.alt}
                    fill
                    sizes="(min-width: 1024px) 285px, (min-width: 640px) 50vw, 78vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="flex flex-col gap-0.5 px-4 py-3">
                  <span className="font-semibold text-forest-900">{photo.captionMr}</span>
                  {(photo.placeMr || photo.date) && (
                    <span className="text-sm text-muted">
                      {photo.placeMr}
                      {photo.placeMr && photo.date ? " · " : ""}
                      {photo.date && <time dateTime={photo.date}>{formatDateMr(photo.date)}</time>}
                    </span>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <div className="reveal flex justify-center">
          <LinkButton href="/gallery" variant="outline">
            संपूर्ण गॅलरी पहा <ArrowRight size={18} />
          </LinkButton>
        </div>
      </div>
    </Section>
  );
}
