"use client";

/**
 * AutoNav — global mobile bottom navigation.
 * Mounted once in the locale layout so EVERY page (landing, notifications,
 * help, job detail, ...) shows the tab bar for logged-in users on phones.
 * Replaces the old per-page <WorkerBottomNav /> / <EmployerBottomNav />
 * instances (removed) so the bar can never disappear between pages and
 * can never be overlapped by the footer (fixed, z-40, safe-area aware).
 */
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WorkerBottomNav } from "./WorkerBottomNav";
import { EmployerBottomNav } from "./EmployerBottomNav";

const HIDE_PREFIXES = ["/login", "/register", "/forgot-password", "/admin", "/terms"];

export function AutoNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.role) setRole(d.role as string);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!role) return null;

  const p = pathname.replace(/^\/(en|ur)/, "");
  if (HIDE_PREFIXES.some((pre) => p.startsWith(pre))) return null;

  // Employer bar on employer pages or for employer-role users;
  // worker bar everywhere else (workers can still reach Hire via navbar).
  const isEmployer = p.startsWith("/employer") || role === "EMPLOYER";

  return (
    <div className="lg:hidden" aria-label="Primary">
      {isEmployer ? <EmployerBottomNav /> : <WorkerBottomNav />}
    </div>
  );
}
