import Image from "next/image";
import type { CSSProperties } from "react";
import type { Planting } from "@/data/site";
import { formatDateMr, formatNumberMr, percent, toMarathiDigits } from "@/lib/format";
import { Calendar, MapPin } from "./icons";
import { cn } from "./ui";

export function PlantingCard({
  planting,
  style,
  headingLevel = "h3",
  showCare = false,
}: {
  planting: Planting;
  style?: CSSProperties;
  headingLevel?: "h2" | "h3";
  showCare?: boolean;
}) {
  const Heading = headingLevel;
  const survival = percent(planting.treesSurviving, planting.treesPlanted);
  const photos = planting.photos?.length ? planting.photos : [planting.image];
  return (
    <article
      className="reveal lift group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white shadow-[var(--shadow-card)]"
      style={style}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-mint">
        {photos.length > 1 ? (
          // Several photos: a swipeable strip (CSS scroll-snap, no JavaScript).
          <ul
            className="absolute inset-0 m-0 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
            aria-label={`${planting.titleMr} — ${toMarathiDigits(photos.length)} फोटो`}
            tabIndex={0}
          >
            {photos.map((photo, i) => (
              <li key={photo.src} className="relative h-full w-full shrink-0 snap-center">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                  loading={i === 0 ? undefined : "lazy"}
                />
              </li>
            ))}
          </ul>
        ) : (
          <Image
            src={planting.image.src}
            alt={planting.image.alt}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
        {photos.length > 1 && (
          <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-forest-950/75 px-2.5 py-0.5 text-xs font-semibold text-white">
            {toMarathiDigits(photos.length)} फोटो · बाजूला सरकवा
          </span>
        )}
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-brand shadow">
          <span className="font-display text-lg leading-none">{formatNumberMr(planting.treesPlanted)}</span> झाडे
        </span>
        {planting.isSample && (
          <span className="absolute top-3 right-3 rounded-lg bg-note px-2 py-0.5 text-xs font-semibold text-note-ink">नमुना</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Heading className="m-0 font-display text-xl leading-snug font-bold text-forest-900">{planting.titleMr}</Heading>
        <dl className="m-0 flex flex-col gap-1.5 text-[15px] text-muted">
          <div className="flex items-start gap-2">
            <dt className="sr-only">ठिकाण</dt>
            <MapPin size={18} className="mt-1 shrink-0 text-brand" />
            <dd className="m-0">
              {planting.placeMr}
              {planting.mapUrl && (
                <>
                  {" · "}
                  <a href={planting.mapUrl} target="_blank" rel="noopener noreferrer" className="font-semibold">
                    नकाशा
                  </a>
                </>
              )}
            </dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="sr-only">तारीख</dt>
            <Calendar size={18} className="mt-1 shrink-0 text-brand" />
            <dd className="m-0">
              <time dateTime={planting.date}>{formatDateMr(planting.date)}</time>
            </dd>
          </div>
        </dl>
        {planting.partnerMr && (
          <p className="m-0 text-[15px] text-ink-soft">
            <span className="font-semibold text-brand">सहभाग: </span>
            {planting.partnerMr}
          </p>
        )}
        <ul className="m-0 flex flex-wrap gap-1.5" aria-label="लावलेल्या झाडांच्या जाती">
          {planting.speciesMr.map((s) => (
            <li key={s} className="rounded-full bg-mint px-3 py-0.5 text-sm font-semibold text-forest-900">
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted">जगलेली झाडे</span>
            <span className="font-bold text-brand">
              {formatNumberMr(planting.treesSurviving)} / {formatNumberMr(planting.treesPlanted)} ({toMarathiDigits(survival)}%)
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
            <div className="grow-bar h-full rounded-full bg-leaf" style={{ width: `${survival}%` }} />
          </div>
        </div>
        {showCare && planting.careNoteMr && (
          <p className={cn("m-0 rounded-xl bg-cream px-3.5 py-2.5 text-[15px] text-ink-soft")}>
            <span className="font-semibold text-brand">संगोपन: </span>
            {planting.careNoteMr}
          </p>
        )}
      </div>
    </article>
  );
}
