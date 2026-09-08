import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    // Keep the signed session cache in sync with the week-long session token
    // so reopening the app after idle doesn't look logged out.
    sessionDataTtl: 60 * 60 * 24 * 7,
    sameSite: "lax",
  },
});
