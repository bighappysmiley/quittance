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

  // Re-check session on every route change so post-login cookies are picked up
  // before we decide to kick someone off a protected page.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await refresh();
      if (cancelled) return;

      const { user: nextUser } = useAppStore.getState();
      const publicRoute = isPublicRoute(pathname);

      if (!nextUser && !publicRoute) {
        router.replace("/auth/sign-in");
        return;
      }
      if (nextUser && publicRoute) {
        router.replace("/ledger");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, refresh, router]);

  const onPublic = isPublicRoute(pathname);
  const waiting = !hydrated || (!onPublic && (loading || !user));

  if (waiting) {
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
