"use client";

import Link from "next/link";
import { Cloud } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="welcome-shell flex min-h-dvh flex-col justify-between px-5 pb-8 pt-10">
      <div className="fade-rise">
        <div className="flex items-center justify-between">
          <p className="section-label">Private ledger</p>
          <Link
            href="/auth/sign-in"
            className="text-[13px] font-semibold text-[var(--accent)]"
          >
            Sign in
          </Link>
        </div>

        <h1 className="brand-mark mt-6 text-[48px] leading-[0.95] text-[var(--ink)]">
          Quittance
        </h1>
        <p className="mt-4 max-w-[18rem] text-[16px] leading-relaxed text-[var(--ink-muted)]">
          Track who owes what — money or things — synced to your account, seen
          only by you.
        </p>
      </div>

      <div className="fade-rise fade-rise-2 relative my-8 overflow-hidden rounded-[28px] border border-[var(--line)] shadow-[var(--shadow-soft)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, #1f3d32 0%, #182029 48%, #2c211c 100%)",
          }}
        />
        <div className="relative flex aspect-[4/3] flex-col p-5 text-white">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Cloud size={16} />
            Sample ledger
          </div>
          <p className="mt-auto text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
            Net position
          </p>
          <p
            className="mt-1 text-[44px] font-semibold tracking-tight text-[#e8c4b4]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            −$38
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-sm">
            <div>
              <p className="text-white/45">Owed to you</p>
              <p className="mt-0.5 text-lg font-semibold text-[#8fd6b0]">$2</p>
            </div>
            <div>
              <p className="text-white/45">You owe</p>
              <p className="mt-0.5 text-lg font-semibold text-[#e8c4b4]">$40</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fade-rise fade-rise-3 space-y-3">
        <Link href="/auth/sign-up" className="btn-primary w-full">
          Create your account
        </Link>
        <Link href="/auth/sign-in" className="btn-secondary w-full">
          I already have an account
        </Link>
        <p className="pt-1 text-center text-xs text-[var(--ink-faint)]">
          Your ledger stays private — just for you.
        </p>
      </div>
    </div>
  );
}
