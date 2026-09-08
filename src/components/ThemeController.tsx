"use client";

import { useEffect } from "react";
import { resolveAccent } from "@/lib/safe";
import { usePrefs } from "@/store/useAppStore";

export function ThemeController() {
  const prefs = usePrefs();

  useEffect(() => {
    const root = document.documentElement;
    const accent = resolveAccent(prefs.accent);

    const dark =
      prefs.theme === "dark" ||
      (prefs.theme === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    root.dataset.theme = dark ? "dark" : "light";
    root.dataset.density = prefs.density || "comfortable";

    root.style.setProperty("--accent", accent.value);
    root.style.setProperty(
      "--accent-soft",
      dark ? accent.softDark : accent.soft,
    );
    root.style.setProperty("--accent-ink", dark ? accent.value : accent.value);
  }, [prefs]);

  useEffect(() => {
    if (prefs.theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const dark = mq.matches;
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      const accent = resolveAccent(prefs.accent);
      document.documentElement.style.setProperty(
        "--accent-soft",
        dark ? accent.softDark : accent.soft,
      );
    };
    // Older Safari used addListener on MediaQueryList
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, [prefs.theme, prefs.accent]);

  return null;
}
