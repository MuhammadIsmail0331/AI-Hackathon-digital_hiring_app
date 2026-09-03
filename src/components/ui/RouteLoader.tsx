"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

/** Minimum time (ms) the loading video stays visible */
const MIN_DISPLAY_MS = 800;

/**
 * Shows a loading-video overlay during page transitions.
 *
 * Uses direct DOM manipulation instead of React state to avoid
 * React automatic batching swallowing the show-to-hide cycle.
 *
 * 1. Capture-phase click listener intercepts anchor clicks instantly
 * 2. Overlay is shown via el.style.display (synchronous, no batching)
 * 3. Polls window.location.pathname to detect when navigation completes
 * 4. Hides overlay after at least MIN_DISPLAY_MS
 * 5. Honors prefers-reduced-motion (video stays on its first frame)
 */
export default function RouteLoader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = useTranslations("Common");

  useEffect(() => {
    const overlay = overlayRef.current;
    const video = videoRef.current;
    if (!overlay || !video) return;

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let startedAt = 0;

    function show() {
      overlay!.style.display = "flex";
      // Force a reflow so the opacity transition works
      void overlay!.offsetHeight;
      overlay!.style.opacity = "1";
      if (video) {
        video.currentTime = 0;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduce) video.play().catch(() => {});
      }
    }

    function hide() {
      overlay!.style.opacity = "0";
      // After the CSS transition, hide completely
      setTimeout(() => {
        if (overlay!.style.opacity === "0") {
          overlay!.style.display = "none";
        }
      }, 350);
      if (video) video.pause();
    }

    function scheduleHide() {
      clearInterval(pollTimer);
      clearTimeout(hideTimer);
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      hideTimer = setTimeout(hide, remaining);
    }

    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:")
      )
        return;

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Same URL - no navigation
      const currentPath = window.location.pathname;
      if (href === currentPath) return;

      // Show overlay instantly (bypasses React batching)
      startedAt = Date.now();
      show();

      // Poll for URL change (Next.js updates the URL after React commits)
      clearInterval(pollTimer);
      pollTimer = setInterval(() => {
        if (window.location.pathname !== currentPath) {
          scheduleHide();
        }
      }, 30);

      // Fallback: hide after 4 s if navigation stalls
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, 4000);
    }

    // Capture-phase listener fires BEFORE Next.js processes the click
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      clearInterval(pollTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      role="status"
      aria-label={t("loading")}
      style={{
        display: "none",
        opacity: 0,
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--canvas)",
        transition: "opacity 300ms",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            padding: 14,
            borderRadius: 24,
            border: "1px solid var(--line)",
            background: "var(--surface)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          <video
            ref={videoRef}
            src="/loading-animation.mp4"
            aria-hidden="true"
            autoPlay
            loop
            muted
            playsInline
            style={{
              maxHeight: "60vh",
              maxWidth: "80vw",
              height: "auto",
              width: "auto",
            }}
          />
        </div>
        <div
          style={{
            fontFamily: "var(--font-sora), sans-serif",
            fontWeight: 700,
            color: "var(--ink)",
            fontSize: 18,
          }}
        >
          Rozgaar
        </div>
      </div>
    </div>
  );
}
