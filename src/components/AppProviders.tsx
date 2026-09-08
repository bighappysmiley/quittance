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

function isChunkLoadError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module/i.test(
    message,
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
  const [bootStatus, setBootStatus] = useState<
    "pending" | "ok" | "unauthorized" | "error"
  >("pending");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBootError(false);
      setBootStatus("pending");
      const result = await refresh();
      if (cancelled) return;
      setBootStatus(result);
      if (result === "error" && isProtectedRoute(window.location.pathname)) {
        setBootError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  // Recover from stale Home Screen / deploy chunk mismatches
  useEffect(() => {
    const reloadOnce = () => {
      const key = "quittance-chunk-reload";
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
      window.location.reload();
    };
    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error || event.message)) reloadOnce();
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) reloadOnce();
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || loading || bootError || bootStatus === "pending") return;

    if (!user && isProtectedRoute(pathname)) {
      window.location.replace("/auth/sign-in");
      return;
    }
    // Only hard-open ledger after a successful session load — avoids racing a
    // soft client navigation into a broken/partial page shell.
    if (user && bootStatus === "ok" && pathname === "/") {
      window.location.replace("/ledger");
    }
  }, [hydrated, loading, bootError, bootStatus, user, pathname, router]);

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
              setBootStatus("pending");
              void refresh().then((result) => {
                setBootStatus(result);
                if (result === "error") setBootError(true);
                if (result === "unauthorized") {
                  window.location.replace("/auth/sign-in");
                }
                if (result === "ok") {
                  window.location.replace("/ledger");
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
