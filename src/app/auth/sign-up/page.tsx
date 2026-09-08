"use client";

import { useState } from "react";
import Link from "next/link";
import { signUpWithPassword } from "@/lib/auth/client";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const form = new FormData(e.currentTarget);
      const name = String(form.get("name") || "");
      const email = String(form.get("email") || "");
      const password = String(form.get("password") || "");

      const { error: authError } = await signUpWithPassword({
        name,
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        setPending(false);
        return;
      }

      window.location.assign("/ledger");
    } catch {
      setError("Creating your account is taking too long. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="welcome-shell page-pad flex min-h-dvh flex-col justify-center">
      <Link href="/" className="brand-mark text-[22px] text-[var(--ink)]">
        Quittance
      </Link>
      <h1 className="mt-8 text-[32px] font-bold tracking-tight">
        Create your space
      </h1>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[var(--ink-muted)]">
        Start a private ledger for money and things — yours alone.
      </p>

      <form onSubmit={onSubmit} className="panel mt-8 space-y-3 p-4">
        <label className="block text-[12px] font-bold text-[var(--ink-muted)]">
          Name
          <input
            className="input-field mt-1"
            name="name"
            required
            autoComplete="name"
            placeholder="What should we call you?"
          />
        </label>
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
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </label>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Creating…" : "Get started"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--ink-muted)]">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="font-bold text-[var(--accent)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
