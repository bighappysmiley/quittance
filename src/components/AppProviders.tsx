"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { ThemeController } from "@/components/ThemeController";

function isPublicRoute(pathname: string) {
  return pathname === "/" || pathname.startsWith("/auth");
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const refresh = useAppStore((s) => s.refresh);
  const hydrated = useAppStore((s) => s.hydrated);
  const loading = useAppStore((s) => s.loading);
  const user = useAppStore((s) => s.user);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!hydrated || loading) return;

    const publicRoute = isPublicRoute(pathname);
    if (!user && !publicRoute) {
      router.replace("/auth/sign-in");
      return;
    }
    // Only bounce signed-in people off welcome — leave auth pages alone
    // so sign-in/up can finish navigating themselves.
    if (user && pathname === "/") {
      router.replace("/ledger");
    }
  }, [hydrated, loading, user, pathname, router]);

  if (!hydrated) {
    return (
      <div className="welcome-shell grid min-h-dvh place-items-center">
        <p className="brand-mark text-3xl text-[var(--ink)]">Quittance</p>
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
