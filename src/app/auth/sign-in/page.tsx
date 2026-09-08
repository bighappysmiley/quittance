"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithPassword } from "@/lib/auth/client";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const form = new FormData(e.currentTarget);
      const email = String(form.get("email") || "");
      const password = String(form.get("password") || "");

      const { error: authError } = await signInWithPassword(email, password);
      if (authError) {
        setError(authError.message);
        setPending(false);
        return;
      }

      window.location.assign("/");
    } catch {
      setError("Sign in is taking too long. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="welcome-shell page-pad flex min-h-dvh flex-col justify-center">
      <Link href="/" className="brand-mark text-[22px] text-[var(--ink)]">
        Quittance
      </Link>
      <h1 className="mt-8 text-[32px] font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[var(--ink-muted)]">
        Pick up where you left off — your ledger is waiting.
      </p>

      <form onSubmit={onSubmit} className="panel mt-8 space-y-3 p-4">
        <label className="block text-[12px] font-bold text-[var(--ink-muted)]">
          Email
          <input
            className="input-field mt-1"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
          />
        </label>
        <label className="block text-[12px] font-bold text-[var(--ink-muted)]">
          Password
          <input
            className="input-field mt-1"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Your password"
          />
        </label>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--ink-muted)]">
        New here?{" "}
        <Link href="/auth/sign-up" className="font-bold text-[var(--accent)]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
