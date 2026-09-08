"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { ThemeController } from "@/components/ThemeController";
import { AuthScreen } from "@/components/AuthScreen";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const session = useAppStore((s) => s.session);
  const setHydrated = useAppStore((s) => s.setHydrated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Fallback if persist rehydration already happened
    if (useAppStore.persist.hasHydrated()) setHydrated(true);
  }, [setHydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (!session && pathname !== "/") {
      router.replace("/");
    }
  }, [hydrated, session, pathname, router]);

  if (!hydrated) {
    return (
      <div className="phone-shell grid min-h-dvh place-items-center">
        <div className="text-center">
          <p
            className="text-3xl tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Quittance
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">Loading…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <ThemeController />
        <AuthScreen />
      </>
    );
  }

  return (
    <>
      <ThemeController />
      {children}
    </>
  );
}
