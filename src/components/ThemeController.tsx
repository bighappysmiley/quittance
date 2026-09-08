"use client";

import { useEffect } from "react";
import { ACCENTS } from "@/lib/types";
import { usePrefs } from "@/store/useAppStore";

export function ThemeController() {
  const prefs = usePrefs();

  useEffect(() => {
    const root = document.documentElement;
    const accent = ACCENTS[prefs.accent];
    root.style.setProperty("--accent", accent.value);
    root.style.setProperty("--accent-soft", accent.soft);
    root.style.setProperty("--accent-ink", accent.value);

    const dark =
      prefs.theme === "dark" ||
      (prefs.theme === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = dark ? "dark" : "light";
    root.dataset.density = prefs.density;
  }, [prefs]);

  useEffect(() => {
    if (prefs.theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      document.documentElement.dataset.theme = mq.matches ? "dark" : "light";
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [prefs.theme]);

  return null;
}
