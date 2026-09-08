"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithEmail } from "./actions";

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUpWithEmail, null);

  return (
    <div className="app-shell page-pad flex min-h-dvh flex-col justify-center">
      <p className="section-label">Account</p>
      <h1 className="mt-2 text-[34px] font-bold tracking-tight">Create account</h1>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[var(--ink-muted)]">
        Track money and items privately. Data saves to your Neon database.
      </p>

      <form action={formAction} className="panel mt-8 space-y-3 p-4">
        <label className="block text-[12px] font-bold text-[var(--ink-muted)]">
          Name
          <input
            className="input-field mt-1"
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
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
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Creating…" : "Create account"}
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
