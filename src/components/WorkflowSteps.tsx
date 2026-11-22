import type { WorkflowStep } from "@/data/site";
import { toMarathiDigits } from "@/lib/format";
import { Droplet, Recycle, Scale, Shovel, Users } from "./icons";
import { cn, revealDelay } from "./ui";

const ICONS = {
  collect: Users,
  weigh: Scale,
  sell: Recycle,
  plant: Shovel,
  care: Droplet,
} as const;

/**
 * 5-step waste-to-tree workflow.
 * Mobile: vertical timeline. Desktop: five cards joined by a growing line.
 */
export function WorkflowSteps({ steps, detailed = false }: { steps: WorkflowStep[]; detailed?: boolean }) {
  return (
    <div className="reveal relative">
      {/* Growing connector line (desktop) */}
      <svg
        aria-hidden
        className="absolute top-[46px] right-[10%] left-[10%] hidden h-2 w-[80%] lg:block"
        viewBox="0 0 100 2"
        preserveAspectRatio="none"
      >
        <path
          d="M0 1 H100"
          pathLength={1}
          className="draw-path"
          stroke="#7BB342"
          strokeWidth="2"
          strokeDasharray="1"
          vectorEffect="non-scaling-stroke"
          fill="none"
        />
      </svg>
      <ol className="relative grid gap-4 lg:grid-cols-5 lg:gap-4">
        {steps.map((step, i) => {
          const Icon = ICONS[step.icon];
          return (
            <li
              key={step.id}
              className={cn(
                "reveal lift relative flex gap-4 rounded-[22px] border border-line bg-white p-5 lg:flex-col lg:gap-3 lg:p-6",
              )}
              style={revealDelay(i, 110)}
            >
              <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-3">
                <span className="relative z-10 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand font-display text-xl font-extrabold text-white ring-4 ring-cream">
                  {toMarathiDigits(i + 1)}
                </span>
                <span className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-brand lg:mt-0">
                  <Icon size={22} />
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 lang="en" className="m-0 text-[21px] font-bold">
                  {step.titleEn}
                </h3>
                <p className={cn("m-0 text-muted", detailed ? "text-[17px]" : "text-base leading-relaxed")}>{step.textMr}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
