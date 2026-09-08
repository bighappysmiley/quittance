"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { ThemeController } from "@/components/ThemeController";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const refresh = useAppStore((s) => s.refresh);
  const hydrated = useAppStore((s) => s.hydrated);
  const user = useAppStore((s) => s.user);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!hydrated) return;
    const isAuthRoute = pathname.startsWith("/auth");
    if (!user && !isAuthRoute && pathname !== "/") {
      router.replace("/auth/sign-in");
    }
    if (user && (isAuthRoute || pathname === "/")) {
      router.replace("/ledger");
    }
  }, [hydrated, user, pathname, router]);

  if (!hydrated) {
    return (
      <div className="app-shell grid min-h-dvh place-items-center">
        <p className="text-sm text-[var(--ink-muted)]">Loading Quittance…</p>
      </div>
    );
  }

  return (
    <>
      <ThemeController />
      {children}
    </>
  );
}
