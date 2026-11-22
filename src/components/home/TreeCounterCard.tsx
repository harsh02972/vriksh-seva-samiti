import type { ImpactStats } from "@/data/site";
import { formatDateMr, formatNumberMr, percent, toMarathiDigits } from "@/lib/format";
import { CountUp } from "../CountUp";
import { Sprout } from "../icons";
import { SampleNote } from "../ui";

export function TreeCounterCard({ stats }: { stats: ImpactStats }) {
  const progress = percent(stats.treesPlanted, stats.nextMilestone);
  return (
    <div style={{ ["--reveal-delay" as string]: "150ms" }} className="hero-enter w-full max-w-[440px] rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(22,63,33,0.12)] sm:p-8">
      <div className="flex items-center gap-3.5">
        <span className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-mint text-brand">
          <Sprout size={28} />
        </span>
        <div className="flex flex-col leading-tight">
          <h2 lang="en" className="m-0 text-xl font-bold">
            Live Tree Counter
          </h2>
          <span className="text-[15px] text-muted">आतापर्यंत लावलेली झाडे</span>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-brand">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-leaf opacity-70 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-leaf" />
          </span>
          <span lang="en">LIVE</span>
        </span>
      </div>

      <p className="m-0 mt-5 font-display text-[clamp(60px,9vw,80px)] leading-none font-extrabold text-brand">
        <CountUp value={stats.treesPlanted} duration={2000} />
      </p>

      <div
        className="mt-5 h-2.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={stats.nextMilestone}
        aria-valuenow={stats.treesPlanted}
        aria-label={`पुढच्या लक्ष्याकडे प्रगती: ${toMarathiDigits(progress)} टक्के`}
      >
        <div className="lb-bar h-full rounded-full bg-leaf" style={{ width: `${progress}%`, animationDelay: "400ms", animationDuration: "1.6s" }} />
      </div>
      <div className="mt-2.5 flex flex-wrap justify-between gap-3 text-[15px] text-muted">
        <span>पुढचे लक्ष्य: {formatNumberMr(stats.nextMilestone)} झाडे</span>
        <span className="font-semibold text-brand">{toMarathiDigits(progress)}% पूर्ण</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-cream px-4 py-3.5">
          <div className="font-display text-[26px] leading-tight font-bold text-forest-900">
            <CountUp value={stats.treesSurviving} />
          </div>
          <div className="text-sm text-muted">झाडे जगली व वाढत आहेत</div>
        </div>
        <div className="rounded-2xl bg-cream px-4 py-3.5">
          <div className="font-display text-[26px] leading-tight font-bold text-forest-900">
            <CountUp value={stats.wasteKg} />
          </div>
          <div className="text-sm text-muted">किलो रद्दी गोळा</div>
        </div>
      </div>
      <p className="m-0 mt-4 text-[13px] text-muted">शेवटचे अपडेट: {formatDateMr(stats.asOf)}</p>
      {stats.isSample && <SampleNote className="mt-2">नमुना आकडे — खरी माहिती नंतर भरली जाईल</SampleNote>}
    </div>
  );
}
