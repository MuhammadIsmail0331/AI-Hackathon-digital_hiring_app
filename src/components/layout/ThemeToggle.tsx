"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark";

const KEY = "rozgaar-theme";

const LABELS = {
  en: { toDark: "Switch to dark mode", toLight: "Switch to light mode" },
  ur: { toDark: "ڈارک موڈ آن کریں", toLight: "لائٹ موڈ آن کریں" },
} as const;

function isDarkNow(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export default function ThemeToggle({ className }: { className?: string }) {
  const locale = useLocale() as "en" | "ur";
  const label = LABELS[locale] ?? LABELS.en;
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(isDarkNow());
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    const next = !isDarkNow();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      // Private mode — theme still applies for this page view.
    }
    setDark(next);
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? label.toLight : label.toDark}
      aria-pressed={dark}
      title={dark ? label.toLight : label.toDark}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:border-primary/40 hover:text-primary",
        className
      )}
    >
      <span className={cn("block", !mounted && "opacity-0")}>
        {dark ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </span>
    </button>
  );
}
