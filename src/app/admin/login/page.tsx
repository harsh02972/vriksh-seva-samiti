import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-[420px] flex-col gap-6 rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(22,63,33,0.12)] sm:p-8">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={56} height={56} className="h-14 w-14 object-contain" />
          <div className="flex flex-col leading-tight">
            <h1 lang="en" className="m-0 text-2xl font-extrabold">
              Admin Sign In
            </h1>
            <span className="text-muted">वृक्ष सेवा समिती — फक्त समितीसाठी</span>
          </div>
        </div>
        <Suspense>
          <Notice searchParams={searchParams} />
        </Suspense>
        {isSupabaseConfigured() ? (
          <LoginForm />
        ) : (
          <p className="m-0 rounded-xl bg-note p-4 text-note-ink">
            <strong lang="en">Setup needed.</strong> Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> (see README → Phase 2 setup), then restart.
          </p>
        )}
        <p className="m-0 text-sm text-muted">
          नवीन खाते येथे तयार करता येत नाही. खाते हवे असल्यास समितीच्या admin शी संपर्क करा. · No sign-up: admin accounts are created by
          the site owner.
        </p>
        <Link href="/" className="self-start text-[15px] font-semibold">
          ← वेबसाइटवर परत · Back to website
        </Link>
      </div>
    </main>
  );
}

async function Notice({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const { reason } = await searchParams;
  if (reason === "not-admin")
    return <p className="m-0 rounded-xl bg-[#FBEAE5] p-3 font-semibold text-[#7A2E1C]">हे खाते admin नाही · This account is not an admin.</p>;
  return null;
}
