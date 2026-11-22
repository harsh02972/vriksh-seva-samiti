import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/admin/auth";

export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[250px_1fr]">
      <AdminNav />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
          <Suspense fallback={<Loading />}>
            <AdminGate>{children}</AdminGate>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

/** Only admins get past this point; everyone else is redirected to the login page. */
async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}

function Loading() {
  return (
    <p role="status" className="m-0 animate-pulse rounded-2xl bg-white p-6 text-muted">
      लोड होत आहे… · Loading…
    </p>
  );
}
