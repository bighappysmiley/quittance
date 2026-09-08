"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Share, SquarePlus, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [iosGuide, setIosGuide] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    if (isStandalone()) return;
    const dismissed = sessionStorage.getItem("quittance-install-dismissed");
    if (dismissed === "1") return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Show App Store–style banner on iOS (and as a preview elsewhere)
    const t = window.setTimeout(() => setVisible(true), 600);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.clearTimeout(t);
    };
  }, []);

  if (!visible && !iosGuide) return null;

  async function onGet() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome === "accepted") {
        setVisible(false);
        return;
      }
    }
    // iOS / browsers without native install prompt
    setIosGuide(true);
  }

  function dismiss() {
    sessionStorage.setItem("quittance-install-dismissed", "1");
    setVisible(false);
    setIosGuide(false);
  }

  return (
    <>
      {visible && (
        <div className="install-banner" role="region" aria-label="Get Quittance">
          <button
            type="button"
            className="install-banner-close"
            aria-label="Dismiss"
            onClick={dismiss}
          >
            <X size={14} />
          </button>
          <Image
            src="/apple-touch-icon.png"
            alt=""
            width={48}
            height={48}
            className="install-banner-icon"
            priority
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold leading-tight">
              Quittance
            </p>
            <p className="truncate text-[11px] text-[var(--ink-muted)]">
              Private IOU tracker · Free
            </p>
          </div>
          <button type="button" className="install-get" onClick={onGet}>
            GET
          </button>
        </div>
      )}

      {iosGuide && (
        <div
          className="install-sheet-backdrop"
          onClick={() => setIosGuide(false)}
          role="presentation"
        >
          <div
            className="install-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--line)]" />
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/apple-touch-icon.png"
                alt=""
                width={56}
                height={56}
                className="install-banner-icon"
              />
              <div>
                <h2 id="install-title" className="text-[17px] font-bold">
                  Add Quittance to Home Screen
                </h2>
                <p className="text-[13px] text-[var(--ink-muted)]">
                  Open it like an app, anytime.
                </p>
              </div>
            </div>

            {isIos() ? (
              <ol className="space-y-3 text-[14px] text-[var(--ink)]">
                <li className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[12px] font-bold text-[var(--accent-ink)]">
                    1
                  </span>
                  <span className="pt-0.5">
                    Tap <Share size={14} className="mx-0.5 inline" /> Share in
                    Safari
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[12px] font-bold text-[var(--accent-ink)]">
                    2
                  </span>
                  <span className="pt-0.5">
                    Choose{" "}
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <SquarePlus size={14} /> Add to Home Screen
                    </span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[12px] font-bold text-[var(--accent-ink)]">
                    3
                  </span>
                  <span className="pt-0.5">Tap Add — Quittance appears on your Home Screen</span>
                </li>
              </ol>
            ) : (
              <p className="text-[14px] leading-relaxed text-[var(--ink-muted)]">
                Use your browser’s install option, or open this site in Safari on
                iPhone and tap Share → Add to Home Screen.
              </p>
            )}

            <button
              type="button"
              className="btn-primary mt-5 w-full"
              onClick={() => {
                setIosGuide(false);
                sessionStorage.setItem("quittance-install-dismissed", "1");
                setVisible(false);
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
