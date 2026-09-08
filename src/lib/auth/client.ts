"use client";

import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();

/** Direct auth calls — more reliable than the SDK promise chain hanging in the browser. */
export async function signInWithPassword(email: string, password: string) {
  const res = await fetch("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(20000),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      error: {
        message:
          (data as { message?: string }).message ||
          "Could not sign in. Check your email and password.",
      },
    };
  }
  return { data, error: null };
}

export async function signUpWithPassword(input: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(20000),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      error: {
        message:
          (data as { message?: string }).message ||
          "Could not create your account. Try a different email.",
      },
    };
  }
  return { data, error: null };
}
