"use client";

import { useId, useState } from "react";
import { WhatsApp } from "./icons";

const SCRAP_TYPES = ["रद्दी पेपर", "पुठ्ठा / खोकी", "वह्या-पुस्तके", "प्लास्टिक", "लोखंड / धातू"];
const AMOUNTS = ["१०-२५ किलो", "२५-५० किलो", "५० किलोपेक्षा जास्त", "माहीत नाही"];

/**
 * No backend, no data stored: builds a pre-filled WhatsApp message and opens it.
 * The visitor sends it themselves from their own WhatsApp.
 */
export function PickupRequest({ whatsappE164, isPlaceholder }: { whatsappE164: string; isPlaceholder: boolean }) {
  const id = useId();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [types, setTypes] = useState<string[]>(["रद्दी पेपर"]);
  const [amount, setAmount] = useState(AMOUNTS[0]);
  const [donorKind, setDonorKind] = useState("घर");
  const [error, setError] = useState("");

  function toggle(t: string) {
    setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !area.trim()) {
      setError("कृपया नाव आणि परिसर लिहा.");
      return;
    }
    setError("");
    const message = [
      "नमस्कार, वृक्ष सेवा समिती!",
      "मला रद्दी दान करायची आहे.",
      `नाव: ${name.trim()}`,
      `प्रकार: ${donorKind}`,
      `परिसर / पत्ता: ${area.trim()}`,
      `रद्दी: ${types.length ? types.join(", ") : "—"}`,
      `अंदाजे वजन: ${amount}`,
    ].join("\n");
    window.open(`https://wa.me/${whatsappE164}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  const field = "min-h-[48px] w-full rounded-xl border-2 border-line bg-white px-4 py-2 text-base text-ink focus:border-brand focus:outline-none";

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 rounded-[22px] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-name`} className="font-semibold">
            तुमचे नाव / संस्थेचे नाव *
          </label>
          <input id={`${id}-name`} className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-kind`} className="font-semibold">
            तुम्ही कोण?
          </label>
          <select id={`${id}-kind`} className={field} value={donorKind} onChange={(e) => setDonorKind(e.target.value)}>
            {["घर", "शाळा", "महाविद्यालय", "संस्था / कार्यालय", "दुकान"].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-area`} className="font-semibold">
          परिसर / पत्ता *
        </label>
        <input
          id={`${id}-area`}
          className={field}
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="उदा. सिंदी (मेघे), गणेश नगर"
          autoComplete="street-address"
          required
        />
      </div>
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-1.5 font-semibold">कोणती रद्दी?</legend>
        <div className="flex flex-wrap gap-2">
          {SCRAP_TYPES.map((t) => {
            const checked = types.includes(t);
            return (
              <label
                key={t}
                className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border-2 px-4 font-semibold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sun ${checked ? "border-brand bg-mint text-brand" : "border-line text-ink"}`}
              >
                <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(t)} />
                <span aria-hidden>{checked ? "✓" : "+"}</span>
                {t}
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-amount`} className="font-semibold">
          अंदाजे वजन
        </label>
        <select id={`${id}-amount`} className={field} value={amount} onChange={(e) => setAmount(e.target.value)}>
          {AMOUNTS.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="m-0 rounded-xl bg-[#FBEAE5] px-4 py-2 font-semibold text-[#7A2E1C]">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-[#1F7A3A] px-6 text-lg font-bold text-white transition-colors hover:bg-brand-dark"
      >
        <WhatsApp size={24} />
        <span>
          <span lang="en">WhatsApp</span> वर विनंती पाठवा
        </span>
      </button>
      <p className="m-0 text-sm text-muted">
        हा फॉर्म कोणतीही माहिती साठवत नाही. बटण दाबल्यावर तुमच्या <span lang="en">WhatsApp</span> मध्ये तयार संदेश उघडेल; तो तुम्ही
        स्वतः पाठवायचा आहे.
        {isPlaceholder && <span className="ml-1 rounded bg-note px-1.5 text-note-ink">नमुना नंबर — खरा नंबर नंतर</span>}
      </p>
    </form>
  );
}
