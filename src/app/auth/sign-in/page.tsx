"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithEmail } from "./actions";

export default function SignInPage() {
  const [state, formAction, pending] = useActionState(signInWithEmail, null);

  return (
    <div className="app-shell page-pad flex min-h-dvh flex-col justify-center">
      <p className="section-label">Account</p>
      <h1 className="mt-2 text-[34px] font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[var(--ink-muted)]">
        Your ledger lives in Neon Postgres — same account on every device.
      </p>

      <form action={formAction} className="panel mt-8 space-y-3 p-4">
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
            placeholder="••••••••"
          />
        </label>
        {state?.error && (
          <p className="text-sm text-[var(--danger)]">{state.error}</p>
        )}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--ink-muted)]">
        New here?{" "}
        <Link href="/auth/sign-up" className="font-bold text-[var(--accent)]">
          Create account
        </Link>
      </p>
    </div>
  );
}
