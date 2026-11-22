import type { AcceptedItem } from "@/data/site";
import { Check, Cross } from "./icons";

export function AcceptedItems({ items }: { items: AcceptedItem[] }) {
  const yes = items.filter((i) => i.accepted);
  const no = items.filter((i) => !i.accepted);
  return (
    <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
      <div className="reveal rounded-[22px] border border-line bg-white p-6">
        <h3 lang="en" className="m-0 text-[22px] font-bold">
          What We Accept
        </h3>
        <p className="m-0 mt-1 text-[15px] text-muted">कृपया स्वच्छ व कोरडी रद्दी द्या.</p>
        <ul className="m-0 mt-4 flex flex-wrap gap-2.5">
          {yes.map((item) => (
            <li key={item.id} className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 font-semibold text-forest-900">
              <Check size={18} className="text-brand" />
              {item.labelMr}
              {item.noteMr && <span className="text-sm font-normal text-muted">({item.noteMr})</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="reveal rounded-[22px] border border-line bg-white p-6">
        <h3 lang="en" className="m-0 text-[22px] font-bold">
          Please Don&apos;t Give
        </h3>
        <p className="m-0 mt-1 text-[15px] text-muted">या वस्तू आम्ही स्वीकारू शकत नाही.</p>
        <ul className="m-0 mt-4 flex flex-wrap gap-2.5">
          {no.map((item) => (
            <li key={item.id} className="inline-flex items-center gap-2 rounded-full bg-[#FBEAE5] px-4 py-2 font-semibold text-[#7A2E1C]">
              <Cross size={16} />
              {item.labelMr}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
