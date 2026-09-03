"use client";

import { useEffect, useState } from "react";
import { prettyLabel } from "@/lib/labels";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import { WorkerBottomNav } from "@/components/layout/WorkerBottomNav";
import { Badge } from "@/components/ui";
import { EmptyToolbox } from "@/components/illustrations/characters";

interface ProfileCard {
  id: string;
  workerType: string;
  skills: string[];
  experience: number;
  expectedWage: number;
  isAvailable: boolean;
  avgRating: number;
  totalJobs: number;
}

export default function WorkerProfileOverviewPage() {
  const t = useTranslations("Profile");
  const locale = useLocale() as "en" | "ur";
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/worker/profiles")
      .then((r) => (r.ok ? r.json() : { profiles: [] }))
      .then((d) => setProfiles(d.profiles ?? []))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        <h1 className="mb-6 text-2xl font-bold text-ink">{t("myProfessions")}</h1>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <svg className="h-6 w-6 animate-spin text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : profiles.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primarysoft p-8 text-center">
            <EmptyToolbox className="mx-auto mb-4 w-32" />
            <p className="mb-6 text-sm text-muted">
              {locale === "ur"
                ? "اپنا پہلا پیشہ شامل کریں تاکہ کمپنی آپ کو تلاش کر سکے"
                : "Add your first profession so employers can find you"}
            </p>
            <Link
              href="/worker/profile/edit"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-primarystrong"
            >
              {t("addProfession")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
                <div
                  className="h-1.5 w-full"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, var(--primary) 0 10px, var(--accent) 10px 15px, var(--terracotta) 15px 20px, var(--primary) 20px 30px)",
                  }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-ink">{prettyLabel(p.workerType)}</h2>
                      <p className="mt-0.5 text-sm text-muted">
                        {p.experience}+ {locale === "ur" ? "سال کا تجربہ" : "yrs experience"}
                      </p>
                    </div>
                    <Badge
                      tone={p.isAvailable ? "success" : "default"}
                      label={p.isAvailable ? (locale === "ur" ? "دستیاب" : "Available") : locale === "ur" ? "غیر دستیاب" : "Unavailable"}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(p.skills ?? []).slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full bg-surface2 px-2.5 py-1 text-xs font-medium text-muted">{s}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {p.expectedWage.toLocaleString()} PKR
                      <span className="text-xs font-normal text-muted"> / {locale === "ur" ? "دن" : "day"}</span>
                    </span>
                    {p.totalJobs > 0 && <span className="text-xs font-semibold text-accent">★ {p.avgRating.toFixed(1)}</span>}
                  </div>
                  <Link
                    href={`/worker/profile/edit?type=${p.workerType}`}
                    className="mt-4 block w-full rounded-xl border border-line bg-surface2 py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-line"
                  >
                    {t("editProfession")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {profiles.length > 0 && profiles.length < 3 && (
          <Link
            href="/worker/profile/edit"
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primarysoft/50 py-5 text-sm font-semibold text-primary transition hover:bg-primarysoft"
          >
            + {t("addProfession")}
          </Link>
        )}
      </main>
      <WorkerBottomNav />
    </>
  );
}
