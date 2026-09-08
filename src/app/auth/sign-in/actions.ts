"use server";

import { auth } from "@/lib/auth/server";

export async function signInWithEmail(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
) {
  const { error } = await auth.signIn.email({
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  });
  if (error) return { error: error.message || "Could not sign in" };
  return { ok: true };
}
