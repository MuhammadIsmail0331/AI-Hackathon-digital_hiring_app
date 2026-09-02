"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { EmployerBottomNav } from "@/components/layout/EmployerBottomNav";
import { Button } from "@/components/ui";

interface EmployerProfileData {
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  stats: {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
  };
}

export default function EmployerProfilePage() {
  const t = useTranslations("EmployerProfile");
  const common = useTranslations("Common");
  const locale = useLocale() as "en" | "ur";

  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/employer/profile");
        if (!res.ok) return;
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setName(data.profile.name || "");
          setPhone(data.profile.phone || "");
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (name.trim().length < 2) {
      setError(t("nameHint"));
      return;
    }
    if (!phone.trim()) {
      setError(t("phoneHint"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/employer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("saveError"));
        return;
      }
      setSuccess(true);
      if (data.profile) {
        setProfile((prev) =>
          prev ? { ...prev, name: data.profile.name, phone: data.profile.phone } : prev
        );
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-base">{common("loading")}</span>
          </div>
        </div>
        <EmployerBottomNav />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
          <p>{common("error")}</p>
        </div>
        <EmployerBottomNav />
      </>
    );
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString(
    locale === "ur" ? "ur-PK" : "en-PK",
    { year: "numeric", month: "long" }
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg shadow-blue-200">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="mt-0.5 text-sm text-blue-100">
                {t("memberSince")} {memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Job Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <div className="text-2xl font-bold text-gray-900">{profile.stats.totalJobs}</div>
            <div className="mt-0.5 text-xs text-gray-500">{t("totalJobs")}</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div className="text-2xl font-bold text-gray-900">{profile.stats.activeJobs}</div>
            <div className="mt-0.5 text-xs text-gray-500">{t("activeJobs")}</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="text-2xl font-bold text-gray-900">{profile.stats.completedJobs}</div>
            <div className="mt-0.5 text-xs text-gray-500">{t("completedJobs")}</div>
          </div>
        </div>

        {/* Account Information Form */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {t("accountInfo")}
          </h2>

          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">{t("profileSaved")}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="employer-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("name")}
              </label>
              <input
                id="employer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <p className="mt-1.5 text-xs text-gray-500">{t("nameHint")}</p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="employer-phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("phone")}
              </label>
              <input
                id="employer-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03001234567"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <p className="mt-1.5 text-xs text-gray-500">{t("phoneHint")}</p>
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="employer-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("email")}
              </label>
              <input
                id="employer-email"
                type="email"
                value={profile.email}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-500"
              />
              <p className="mt-1.5 text-xs text-gray-500">{t("emailHint")}</p>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={saving}>
              {t("saveChanges")}
            </Button>
          </form>
        </section>
      </main>
      <EmployerBottomNav />
    </>
  );
}
