"use client";

import { useEffect, useState } from "react";
import { BrandReveal } from "@/components/brand/BrandReveal";

/**
 * First-load-of-session brand splash: the handshake-to-D reveal.
 * Shows once per browser session, then never again until a new session.
 */
export function SessionSplash() {
  const [show, setShow] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    let seen = "1";
    try {
      seen = sessionStorage.getItem("dh-splash") ?? "1";
    } catch {
      // storage unavailable - skip splash rather than annoy
      return;
    }
    if (seen === "1") return;
    setShow(true);
    try {
      sessionStorage.setItem("dh-splash", "1");
    } catch {}
    const t1 = setTimeout(() => setHiding(true), 2400);
    const t2 = setTimeout(() => setShow(false), 2950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className={
        "fixed inset-0 z-[10001] flex items-center justify-center bg-canvas transition-opacity duration-500 " +
        (hiding ? "opacity-0" : "opacity-100")
      }
    >
      <BrandReveal />
    </div>
  );
}
