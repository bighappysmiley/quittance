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
    // Always show the Add to Home Screen guide so the flow is visible.
    // If the browser exposes a native install prompt, offer it from the sheet.
    setIosGuide(true);
  }

  async function onInstallNative() {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome === "accepted") {
        setIosGuide(false);
        setVisible(false);
      }
    } catch {
      setDeferred(null);
    }
  }

  function dismiss() {
    sessionStorage.setItem("quittance-install-dismissed", "1");
    setVisible(false);
    setIosGuide(false);
  }

  return (
    <>
      {visible && (
        <div className="install-banner-wrap" role="region" aria-label="Get Quittance">
          <div className="install-banner">
            <button
              type="button"
              className="install-banner-close"
              aria-label="Dismiss"
              onClick={dismiss}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
            <Image
              src="/apple-touch-icon.png"
              alt=""
              width={44}
              height={44}
              className="install-banner-icon"
              priority
            />
            <div className="min-w-0 flex-1">
              <p className="install-banner-title truncate text-[13px] font-semibold leading-tight tracking-[-0.01em]">
                Quittance
              </p>
              <p className="install-banner-sub truncate text-[11px] leading-tight">
                Private IOU tracker · Free
              </p>
            </div>
            <button type="button" className="install-get" onClick={onGet}>
              GET
            </button>
          </div>
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

            {/* Always show Home Screen steps — this is the product install path */}
            <ol className="space-y-3 text-[14px] text-[var(--ink)]">
              <li className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[12px] font-bold text-[var(--accent-ink)]">
                  1
                </span>
                <span className="pt-0.5">
                  {isIos() ? (
                    <>
                      Tap <Share size={14} className="mx-0.5 inline" /> Share in
                      Safari
                    </>
                  ) : (
                    <>Open the browser menu or install icon</>
                  )}
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
                <span className="pt-0.5">
                  Tap Add — Quittance appears on your Home Screen with its glass
                  icon
                </span>
              </li>
            </ol>

            <div className="mt-5 flex flex-col gap-2">
              {deferred && (
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={onInstallNative}
                >
                  Install Quittance
                </button>
              )}
              <button
                type="button"
                className={
                  deferred
                    ? "w-full rounded-[var(--radius)] border border-[var(--line)] bg-transparent px-4 py-3 text-[15px] font-semibold text-[var(--ink)]"
                    : "btn-primary w-full"
                }
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
        </div>
      )}
    </>
  );
}
