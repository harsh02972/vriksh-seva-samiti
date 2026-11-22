import type { Campaign } from "@/data/site";
import { formatDateMr, formatNumberMr, percent, toMarathiDigits } from "@/lib/format";
import { ArrowRight, Flag } from "./icons";
import { LinkButton, SampleNote } from "./ui";

export function CampaignCard({ campaign, showCta = true }: { campaign: Campaign; showCta?: boolean }) {
  const progress = percent(campaign.treesPlanted, campaign.treeTarget);
  return (
    <div className="reveal relative overflow-hidden rounded-[28px] border border-[#EAD9A0] bg-note p-6 sm:p-8">
      <svg aria-hidden viewBox="0 0 120 120" className="absolute -right-6 -bottom-8 w-40 opacity-15">
        <path d="M60 110V60" stroke="#4A3712" strokeWidth="6" strokeLinecap="round" />
        <circle cx="60" cy="40" r="32" fill="#4A3712" />
      </svg>
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="flex gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-earth">
            <Flag size={26} />
          </span>
          <div className="flex flex-col gap-1.5">
            <h2 id="campaign-title" className="m-0 text-[clamp(24px,2.6vw,30px)] font-bold text-[#4A3712]">
              <span lang="en">{campaign.titleEn}</span> · {campaign.yearLabelMr}
            </h2>
            <p className="m-0 text-[#4A3712]">{campaign.descriptionMr}</p>
            <p className="m-0 text-[15px] text-note-ink">
              <time dateTime={campaign.startDate}>{formatDateMr(campaign.startDate)}</time> ते{" "}
              <time dateTime={campaign.endDate}>{formatDateMr(campaign.endDate)}</time>
            </p>
          </div>
        </div>
        <div className="flex w-full max-w-[360px] shrink-0 flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-3xl font-extrabold text-[#4A3712]">
              {formatNumberMr(campaign.treesPlanted)}
              <span className="text-lg font-semibold"> / {formatNumberMr(campaign.treeTarget)} झाडे</span>
            </span>
            <span className="font-bold text-[#4A3712]">{toMarathiDigits(progress)}%</span>
          </div>
          <div
            className="h-3 overflow-hidden rounded-full bg-white"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={campaign.treeTarget}
            aria-valuenow={campaign.treesPlanted}
            aria-label="मोहिमेतील लावलेली झाडे"
          >
            <div className="grow-bar h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
          </div>
          {showCta && (
            <LinkButton href="/get-involved" variant="primary" className="mt-2 self-start">
              मोहिमेत सहभागी व्हा <ArrowRight size={18} />
            </LinkButton>
          )}
          {campaign.isSample && <SampleNote className="mt-1 bg-white">नमुना आकडे</SampleNote>}
        </div>
      </div>
    </div>
  );
}
