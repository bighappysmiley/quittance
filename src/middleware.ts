import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    "/ledger",
    "/ledger/:path*",
    "/settings",
    "/settings/:path*",
    "/activity",
    "/activity/:path*",
    "/new",
    "/new/:path*",
    "/person/:path*",
    "/entry/:path*",
  ],
};
