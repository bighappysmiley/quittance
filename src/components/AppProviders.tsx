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
    const publicRoute =
      pathname === "/" || pathname.startsWith("/auth");
    if (!user && !publicRoute) {
      router.replace("/");
    }
    if (user && (pathname === "/" || pathname.startsWith("/auth"))) {
      router.replace("/ledger");
    }
  }, [hydrated, user, pathname, router]);

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
