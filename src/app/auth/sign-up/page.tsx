"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { signUpWithEmail } from "./actions";

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUpWithEmail, null);

  useEffect(() => {
    if (state?.ok) {
      window.location.assign("/ledger");
    }
  }, [state]);

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

      <form action={formAction} className="panel mt-8 space-y-3 p-4">
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
        {state?.error && (
          <p className="text-sm text-[var(--danger)]">{state.error}</p>
        )}
        <button type="submit" disabled={pending || !!state?.ok} className="btn-primary w-full">
          {pending || state?.ok ? "Creating…" : "Get started"}
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
