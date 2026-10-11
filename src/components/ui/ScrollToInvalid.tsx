"use client";

import { useEffect } from "react";

/**
 * ScrollToInvalid — app-wide UX: when a native form validation fails,
 * the FIRST invalid field is scrolled into view and focused, so users
 * land exactly where they need to correct (low-literacy friendly).
 * (Only the first invalid field is targeted — later ones in the same
 * submit attempt are skipped; the flag re-arms after the batch.)
 */
export function ScrollToInvalid() {
  useEffect(() => {
    let armed = true;
    let timer: number | undefined;
    const onInvalid = (e: Event) => {
      if (!armed) return;
      armed = false;
      const el = e.target as HTMLElement | null;
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus({ preventScroll: true });
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        armed = true;
      }, 800);
    };
    document.addEventListener("invalid", onInvalid, true);
    return () => {
      document.removeEventListener("invalid", onInvalid, true);
      if (timer) window.clearTimeout(timer);
    };
  }, []);
  return null;
}
