"use server";

import { auth } from "@/lib/auth/server";

export async function signUpWithEmail(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
) {
  const { error } = await auth.signUp.email({
    email: String(formData.get("email") || ""),
    name: String(formData.get("name") || ""),
    password: String(formData.get("password") || ""),
  });
  if (error) return { error: error.message || "Could not create account" };
  return { ok: true };
}
