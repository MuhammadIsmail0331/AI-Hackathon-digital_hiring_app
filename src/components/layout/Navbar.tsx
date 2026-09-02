"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import LanguageSwitch from "./LanguageSwitch";

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

  // Close the mobile dropdown with the Escape key (keyboard accessibility)
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

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 shadow-sm backdrop-blur-md">
      {/* Gradient accent line */}
      <div className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label={t("name")} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm shadow-blue-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="hidden bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-lg font-bold tracking-tight text-transparent sm:inline">{t("name")}</span>
        </Link>

        <div className="flex items-center gap-2">
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
                className="relative rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Welcome text (desktop) */}
              <span className="hidden rounded-lg bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-600 md:inline-block">
                {authT("welcome")}, {user.name}
              </span>

              {/* Hamburger menu for mobile */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label={menuOpen ? authT("closeMenu") : authT("openMenu")}
                className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 md:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </button>

              {/* Desktop links */}
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/terms" className="rounded-lg px-2 py-1.5 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
                  {nav("terms")}
                </Link>
                <Link href="/report" className="rounded-lg px-2 py-1.5 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
                  {nav("report")}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-100"
                >
                  {authT("logout")}
                </button>
              </div>

              {/* Mobile dropdown menu */}
              {menuOpen && (
                <div className="absolute end-4 top-14 z-50 w-52 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl">
                  <div className="border-b border-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-900 md:hidden">
                    {user.name}
                  </div>
                  <Link href="/terms" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50">
                    {nav("terms")}
                  </Link>
                  <Link href="/report" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50">
                    {nav("report")}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="mt-0.5 block w-full rounded-xl px-3 py-2.5 text-start text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    {authT("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : loaded ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
              >
                {nav("login")}
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:shadow-md hover:shadow-blue-200"
              >
                {nav("register")}
              </Link>
            </div>
          ) : (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
          )}
        </div>
      </div>
    </header>
  );
}
