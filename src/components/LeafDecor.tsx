import { cn } from "./ui";

/** Decorative floating leaves (aria-hidden, transform-only animation, off for reduced motion). */
export function LeafDecor({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const fill1 = tone === "light" ? "#7BB342" : "#2F6B3A";
  const fill2 = tone === "light" ? "#1E5A2C" : "#7BB342";
  const leaves = [
    { cls: "left-[4%] top-[14%] w-9 motion-safe:animate-float", fill: fill1, delay: "0s", opacity: 0.35 },
    { cls: "right-[6%] top-[10%] w-7 motion-safe:animate-sway", fill: fill2, delay: "1.2s", opacity: 0.22 },
    { cls: "left-[46%] bottom-[8%] w-6 motion-safe:animate-float", fill: fill1, delay: "2.4s", opacity: 0.3 },
    { cls: "right-[30%] top-[40%] hidden w-5 md:block motion-safe:animate-sway", fill: fill1, delay: "0.6s", opacity: 0.28 },
  ];
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {leaves.map((leaf, i) => (
        <svg
          key={i}
          viewBox="0 0 40 40"
          className={cn("absolute will-change-transform", leaf.cls)}
          style={{ animationDelay: leaf.delay, opacity: leaf.opacity }}
        >
          <path d="M20 2C8 10 4 22 8 36c14-2 26-14 24-32-4-1-8-1-12-2z" fill={leaf.fill} />
          <path d="M9 35C14 24 19 16 28 7" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.5" fill="none" />
        </svg>
      ))}
    </div>
  );
}
