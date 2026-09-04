"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import { WorkerBottomNav } from "@/components/layout/WorkerBottomNav";
import { Badge } from "@/components/ui";
import {
  WORKER_CATEGORIES,
  PAKISTAN_CITIES,
  SKILLS_MAP,
  EXPERIENCE_LEVELS,
} from "@/lib/constants";
import { prettyLabel } from "@/lib/labels";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface ProfileData {
  workerType: string;
  skills: string[];
  experience: number;
  locationName: string | null;
  expectedWage: number;
  isAvailable: boolean;
  availableDays: string[];
  bio: string | null;
  avgRating: number;
  totalJobs: number;
}

interface MyJobCard {
  offerId: string;
  jobId: string;
  title: string;
  workerType: string;
  date: string;
  startTimeHour: number;
  startTimeMinute: number;
  startTimePeriod: string;
  endTimeHour: number;
  endTimeMinute: number;
  endTimePeriod: string;
  wage: number;
  locationName: string | null;
  jobStatus: string;
  employerName: string;
  employerPhone: string;
  payment: { status: string; totalAmount: number } | null;
}

interface MyJobsData {
  active: MyJobCard[];
  completed: MyJobCard[];
  stats: { activeJobs: number; completedJobs: number; avgRating: number };
}

export default function WorkerDashboardPage() {
  const t = useTranslations("Dashboard");
  const profileT = useTranslations("Profile");
  const jobsT = useTranslations("Jobs");
  const locale = useLocale() as "en" | "ur";

  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [myJobs, setMyJobs] = useState<MyJobsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch session, profile, and job stats in parallel
        const [sessionRes, profileRes, myJobsRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/worker/profile"),
          fetch("/api/worker/my-jobs"),
        ]);

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setUser(sessionData?.user ?? null);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile) {
            setProfile(profileData.profile);
          }
        }

        if (myJobsRes.ok) {
          const myJobsData = await myJobsRes.json();
          setMyJobs(myJobsData);
        }
      } catch {
        // silently fail – UI shows loading/error states
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Safe lookups using constants
  function getCategoryName(id: string) {
    return WORKER_CATEGORIES.find((c) => c.id === id)?.[locale] || prettyLabel(id);
  }

  function getCityName(id: string) {
    return PAKISTAN_CITIES.find((c) => c.id === id)?.[locale] || prettyLabel(id);
  }

  function getSkillName(id: string) {
    for (const skills of Object.values(SKILLS_MAP)) {
      const found = skills.find((s) => s.id === id);
      if (found) return found[locale];
    }
    return id;
  }

  function experienceLabel(years: number) {
    const level = EXPERIENCE_LEVELS.find(
      (l) =>
        (l.id === "beginner" && years <= 1) ||
        (l.id === "intermediate" && years >= 2 && years <= 4) ||
        (l.id === "experienced" && years >= 5 && years <= 9) ||
        (l.id === "expert" && years >= 10)
    );
    return level ? level[locale] : `${years} years`;
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-muted">
            <svg className="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-base">{t("welcome")}...</span>
          </div>
        </div>
        <WorkerBottomNav />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        {/* Welcome Banner */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primarystrong p-6 text-white shadow-lg shadow-blue-200">
          <h1 className="text-2xl font-bold">
            {t("welcome")}, {user?.name || ""}!
          </h1>
          <p className="mt-1 text-sm text-blue-100">{t("workerDashboard")}</p>
        </div>

        {/* No Profile Yet */}
        {!profile && (
          <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primarysoft p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-ink">
              {profileT("completeProfile")}
            </h2>
            <p className="mb-6 text-sm text-muted">
              {profileT("noProfile")}
            </p>
            <Link
              href="/worker/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primarystrong px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all duration-200 ease-out hover:shadow-xl hover:shadow-blue-300 hover:brightness-110 motion-safe:hover:-translate-y-1 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.95] btn-shine"
            >
              {profileT("setupProfile")}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Profile exists */}
        {profile && (
          <>
            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              <Link
                href="/worker/my-jobs"
                className="rounded-2xl border border-line bg-surface p-4 text-center shadow-sm transition-all duration-200 ease-out hover:border-primary/40 hover:shadow-lg motion-safe:hover:-translate-y-1 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
              >
                <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <div className="text-2xl font-bold text-ink">{myJobs?.stats.activeJobs ?? 0}</div>
                <div className="mt-0.5 text-xs text-muted">{t("activeJobs")}</div>
              </Link>
              <Link
                href="/worker/my-jobs"
                className="rounded-2xl border border-line bg-surface p-4 text-center shadow-sm transition-all duration-200 ease-out hover:border-primary/40 hover:shadow-lg motion-safe:hover:-translate-y-1 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
              >
                <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-successsoft text-success">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="text-2xl font-bold text-ink">{myJobs?.stats.completedJobs ?? 0}</div>
                <div className="mt-0.5 text-xs text-muted">{t("completedJobs")}</div>
              </Link>
              <div className="rounded-2xl border border-line bg-surface p-4 text-center shadow-sm">
                <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div className="text-2xl font-bold text-ink">
                  {profile.avgRating > 0 ? profile.avgRating.toFixed(1) : "—"}
                </div>
                <div className="mt-0.5 text-xs text-muted">{jobsT("rating")}</div>
              </div>
            </div>

            {/* Profile Summary Card */}
            <div className="mb-6 rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">
                  {t("yourProfile")}
                </h2>
                <Link
                  href="/worker/profile"
                  className="inline-flex items-center gap-1 rounded-xl bg-primarysoft px-3 py-1.5 text-sm font-medium text-primary transition-all duration-150 hover:bg-primarysoft motion-safe:active:scale-[0.94]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                  {profileT("editProfile")}
                </Link>
              </div>

              {/* Worker Type + Availability */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-ink">
                      {getCategoryName(profile.workerType)}
                    </div>
                    <div className="text-sm text-muted">
                      {experienceLabel(profile.experience)}
                    </div>
                  </div>
                </div>
                <Badge tone={profile.isAvailable ? "success" : "default"}>
                  {profile.isAvailable ? t("available") : t("unavailable")}
                </Badge>
              </div>

              {/* Skills */}
              {profile.skills.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 text-sm font-medium text-muted">
                    {profileT("skills")}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skillId) => (
                      <span
                        key={skillId}
                        className="rounded-lg bg-primarysoft px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {getSkillName(skillId)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location + Wage Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface2 p-3">
                  <div className="text-xs text-muted">
                    {profileT("location")}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-ink">
                    {profile.locationName
                      ? getCityName(profile.locationName)
                      : "—"}
                  </div>
                </div>
                <div className="rounded-xl bg-surface2 p-3">
                  <div className="text-xs text-muted">
                    {profileT("expectedWage")}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-ink">
                    {profile.expectedWage
                      ? `${profile.expectedWage.toLocaleString()} ${profileT("pkr")}/day`
                      : "—"}
                  </div>
                </div>
              </div>

              {/* Available Days */}
              {profile.availableDays.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 text-sm font-medium text-muted">
                    {profileT("availability")}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.availableDays.map((dayId) => (
                      <span
                        key={dayId}
                        className="rounded-lg bg-successsoft px-2.5 py-1 text-xs font-medium text-success"
                      >
                        {dayId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div className="mt-4">
                  <div className="mb-1 text-sm font-medium text-muted">
                    {profileT("bio")}
                  </div>
                  <p className="text-sm text-ink">{profile.bio}</p>
                </div>
              )}
            </div>

            {/* My Jobs section */}
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">
                  {jobsT("myJobs")}
                </h2>
                <Link
                  href="/worker/my-jobs"
                  className="inline-flex items-center gap-1 rounded-xl bg-primarysoft px-3 py-1.5 text-sm font-medium text-primary transition-all duration-150 hover:bg-primarysoft motion-safe:active:scale-[0.94]"
                >
                  {t("viewAll")}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </div>

              {myJobs && myJobs.active.length > 0 ? (
                <div className="space-y-3">
                  {myJobs.active.slice(0, 2).map((job) => (
                    <Link
                      key={job.jobId}
                      href={`/worker/my-jobs/${job.jobId}`}
                      className="block rounded-xl border border-line bg-surface2 p-4 transition-all duration-200 ease-out hover:border-primary/30 hover:bg-primarysoft hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-ink">{job.title}</div>
                          <div className="text-xs text-muted">{job.employerName}</div>
                        </div>
                        <Badge tone="warning">
                          {job.jobStatus === "IN_PROGRESS"
                            ? t("activeJobs")
                            : jobsT("statusOffersSent")}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        <span>
                          {new Date(job.date).toLocaleDateString(
                            locale === "ur" ? "ur-PK" : "en-PK",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </span>
                        <span className="font-semibold text-ink">
                          {job.wage.toLocaleString()} PKR
                        </span>
                        <span>{job.locationName ? getCityName(job.locationName) : "—"}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-line bg-surface2 p-4 text-center text-sm text-muted">
                  {t("noActiveJobs")}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <WorkerBottomNav />
    </>
  );
}
