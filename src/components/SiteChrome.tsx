import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { RevealObserver } from "./RevealObserver";

/** Header, footer and skip link of the public website. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable fixed top-3 left-3 z-[100] rounded-full bg-sun px-5 py-3 font-bold text-sun-ink no-underline shadow-lg"
      >
        मुख्य मजकुराकडे जा
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
