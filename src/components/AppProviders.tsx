"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { ThemeController } from "@/components/ThemeController";

function isProtectedRoute(pathname: string) {
  return (
    pathname.startsWith("/ledger") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/activity") ||
    pathname.startsWith("/new") ||
    pathname.startsWith("/person") ||
    pathname.startsWith("/entry")
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const refresh = useAppStore((s) => s.refresh);
  const hydrated = useAppStore((s) => s.hydrated);
  const loading = useAppStore((s) => s.loading);
  const user = useAppStore((s) => s.user);
  const pathname = usePathname();
  const router = useRouter();
  const [bootError, setBootError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBootError(false);
      const result = await refresh();
      if (cancelled) return;
      if (result === "error" && isProtectedRoute(window.location.pathname)) {
        setBootError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (!hydrated || loading || bootError) return;

    if (!user && isProtectedRoute(pathname)) {
      // Soft client redirect — never bounce through server middleware loops
      router.replace("/auth/sign-in");
      return;
    }
    if (user && pathname === "/") {
      router.replace("/ledger");
    }
  }, [hydrated, loading, bootError, user, pathname, router]);

  if (!hydrated) {
    return (
      <div className="welcome-shell grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <p className="brand-mark text-3xl text-[var(--ink)]">Quittance</p>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">Opening…</p>
        </div>
      </div>
    );
  }

  if (bootError && isProtectedRoute(pathname) && !user) {
    return (
      <div className="welcome-shell grid min-h-dvh place-items-center px-6 text-center">
        <div className="max-w-sm">
          <p className="brand-mark text-3xl text-[var(--ink)]">Quittance</p>
          <p className="mt-4 text-[15px] text-[var(--ink-muted)]">
            Couldn’t open your ledger just now. Check your connection and try
            again.
          </p>
          <button
            type="button"
            className="btn-primary mt-6 w-full"
            onClick={() => {
              setBootError(false);
              void refresh().then((result) => {
                if (result === "error") setBootError(true);
                if (result === "unauthorized") {
                  router.replace("/auth/sign-in");
                }
              });
            }}
          >
            Try again
          </button>
          <button
            type="button"
            className="btn-secondary mt-3 w-full"
            onClick={() => {
              window.location.href = "/auth/sign-in";
            }}
          >
            Sign in
          </button>
        </div>
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
