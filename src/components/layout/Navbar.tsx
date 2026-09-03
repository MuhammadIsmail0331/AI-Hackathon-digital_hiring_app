"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import LanguageSwitch from "./LanguageSwitch";
import ThemeToggle from "./ThemeToggle";
import { BrandAccent } from "@/components/ui/BrandAccent";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  role?: string;
}

export default function Navbar() {
  const t = useTranslations("App");
  const nav = useTranslations("Nav");
  const authT = useTranslations("Auth");
  const notifT = useTranslations("Notifications");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (user) {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => setUnreadCount(data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user]);

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50">
      <BrandAccent height="sm" />
      <div className="border-b border-line bg-surface/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
          <Link href="/" aria-label={t("name")} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primarystrong shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 17 5-9 4 7 3-5 6 7" />
                <path d="M3 21h18" />
              </svg>
            </div>
            <span className="hidden leading-tight sm:block">
              <span className="block text-lg font-bold tracking-tight text-ink" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
                Rozgaar
              </span>
              <span className="block text-[10px] leading-3 text-muted">
                <span dir="rtl">روزگار</span>
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitch />

            {loaded && user ? (
              <div className="flex items-center gap-2">
                {/* Notification bell */}
                <Link
                  href="/notifications"
                  aria-label={
                    unreadCount > 0
                      ? `${notifT("title")} — ${unreadCount} ${notifT("unread")}`
                      : notifT("title")
                  }
                  className="relative rounded-xl p-2 text-muted transition hover:bg-surface2 hover:text-ink"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Avatar + mobile menu toggle */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                    aria-label={menuOpen ? authT("closeMenu") : authT("openMenu")}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primarysoft text-sm font-bold text-primary transition hover:ring-2 hover:ring-primary/30 md:hidden"
                  >
                    {initials}
                  </button>

                  {/* Desktop links */}
                  <div className="hidden items-center gap-2 md:flex">
                    <Link href="/terms" className="rounded-lg px-2 py-1.5 text-xs text-muted transition hover:bg-surface2 hover:text-ink">
                      {nav("terms")}
                    </Link>
                    <Link href="/report" className="rounded-lg px-2 py-1.5 text-xs text-muted transition hover:bg-surface2 hover:text-ink">
                      {nav("report")}
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="rounded-xl border border-danger/30 bg-dangersoft px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger/10"
                    >
                      {authT("logout")}
                    </button>
                  </div>

                  {/* Mobile dropdown menu */}
                  {menuOpen && (
                    <div className="absolute end-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl">
                      <div className="border-b border-line px-3 py-2.5 text-sm font-semibold text-ink md:hidden">
                        {user.name}
                      </div>
                      <Link href="/terms" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-ink transition hover:bg-surface2">
                        {nav("terms")}
                      </Link>
                      <Link href="/report" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-ink transition hover:bg-surface2">
                        {nav("report")}
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="mt-0.5 block w-full rounded-xl px-3 py-2.5 text-start text-sm font-medium text-danger transition hover:bg-dangersoft"
                      >
                        {authT("logout")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : loaded ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface2"
                >
                  {nav("login")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primarystrong"
                >
                  {nav("register")}
                </Link>
              </div>
            ) : (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-surface2" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
