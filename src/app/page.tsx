"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function HomePage() {
  const router = useRouter();
  const session = useAppStore((s) => s.session);
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (session) router.replace("/ledger");
  }, [hydrated, session, router]);

  // AuthScreen is rendered by AppProviders when logged out
  return null;
}
