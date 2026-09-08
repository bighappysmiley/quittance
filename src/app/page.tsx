"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, HandCoins, Lock, Sparkles } from "lucide-react";

const steps = [
  {
    icon: HandCoins,
    title: "Keep every IOU clear",
    body: "Money or things — see who owes what at a glance, without awkward reminders living in your notes app.",
  },
  {
    icon: Sparkles,
    title: "Settle with confidence",
    body: "Mark something returned or paid when it’s done. Your history stays tidy and easy to revisit.",
  },
  {
    icon: Lock,
    title: "Private, just for you",
    body: "Your ledger stays with your account — across your devices, seen only by you.",
  },
] as const;

export default function WelcomePage() {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  const last = step === steps.length - 1;

  return (
    <div className="welcome-shell flex min-h-dvh flex-col px-5 pb-8 pt-10">
      <div className="fade-rise flex items-center justify-between">
        <p className="section-label">Welcome</p>
        <Link
          href="/auth/sign-in"
          className="text-[13px] font-semibold text-[var(--accent-ink)]"
        >
          Sign in
        </Link>
      </div>

      <div className="fade-rise fade-rise-2 mt-8">
        <h1 className="brand-mark text-[48px] leading-[0.95] text-[var(--ink)]">
          Quittance
        </h1>
        <p className="mt-4 max-w-[18rem] text-[16px] leading-relaxed text-[var(--ink-muted)]">
          A private way to track who owes what.
        </p>
      </div>

      <div className="fade-rise fade-rise-3 relative mt-10 flex-1">
        <div className="panel overflow-hidden p-0">
          <div
            className="relative px-5 pb-6 pt-8"
            style={{
              background:
                "linear-gradient(165deg, color-mix(in srgb, var(--accent) 16%, #1d2a26) 0%, #1c2420 52%, #2a221c 100%)",
              color: "white",
              minHeight: 220,
            }}
          >
            <div className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
              <Icon size={22} />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
              Step {step + 1} of {steps.length}
            </p>
            <h2 className="brand-mark mt-2 text-[28px] leading-tight">
              {current.title}
            </h2>
            <p className="mt-3 max-w-[20rem] text-[14px] leading-relaxed text-white/75">
              {current.body}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to step ${i + 1}`}
                  onClick={() => setStep(i)}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === step ? 22 : 8,
                    background:
                      i === step ? "var(--accent)" : "var(--surface-2)",
                  }}
                />
              ))}
            </div>

            {!last ? (
              <button
                type="button"
                className="btn-primary !px-4 !py-2.5 text-[13px]"
                onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
              >
                Next
                <ArrowRight size={15} className="ml-1.5" />
              </button>
            ) : (
              <Link href="/auth/sign-up" className="btn-primary !px-4 !py-2.5 text-[13px]">
                Get started
                <ArrowRight size={15} className="ml-1.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="fade-rise fade-rise-4 mt-6 space-y-3">
        <Link href="/auth/sign-up" className="btn-primary w-full">
          Create your account
        </Link>
        <Link href="/auth/sign-in" className="btn-secondary w-full">
          I already have an account
        </Link>
      </div>
    </div>
  );
}
