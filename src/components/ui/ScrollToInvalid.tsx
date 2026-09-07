"use client";

import { useEffect } from "react";

/**
 * ScrollToInvalid — app-wide UX: when a native form validation fails,
 * the first invalid field is scrolled into view and focused, so users
 * land exactly where they need to correct (low-literacy friendly).
 */
export function ScrollToInvalid() {
  useEffect(() => {
    const onInvalid = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      window.setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }, 60);
    };
    document.addEventListener("invalid", onInvalid, true);
    return () => document.removeEventListener("invalid", onInvalid, true);
  }, []);
  return null;
}
