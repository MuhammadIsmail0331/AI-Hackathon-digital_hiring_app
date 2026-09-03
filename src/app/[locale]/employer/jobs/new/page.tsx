"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { EmployerBottomNav } from "@/components/layout/EmployerBottomNav";
import {
  CategorySelector,
  SkillSelector,
  ToolSelector,
  NumberSelector,
  CitySelector,
  TimeSelector,
  Badge,
} from "@/components/ui";
import { WORKER_CATEGORIES, SKILLS_MAP, EXPERIENCE_LEVELS, MIN_DAILY_WAGE } from "@/lib/constants";
import type { WorkerCategoryId, ToolId, CityId } from "@/lib/constants";

interface MatchCandidate {
  userId: string;
  name: string;
  skills: string[];
  experience: number;
  expectedWage: number;
  avgRating: number;
  totalJobs: number;
  locationName: string | null;
  matchScore: number;
}

export default function CreateJobPage() {
  const t = useTranslations("Jobs");
  const commonT = useTranslations("Common");
  const locale = useLocale() as "en" | "ur";
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [workerType, setWorkerType] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [numberOfWorkers, setNumberOfWorkers] = useState(1);
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endHour, setEndHour] = useState(5);
  const [endMinute, setEndMinute] = useState(0);
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("PM");
  const [wage, setWage] = useState("");
  const [tools, setTools] = useState<ToolId[]>([]);
  const [locationName, setLocationName] = useState<CityId | "">("");
  const [description, setDescription] = useState("");
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLng, setGpsLng] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "requesting" | "set" | "denied">("idle");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [noMatches, setNoMatches] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [wageStats, setWageStats] = useState<{ min: number; max: number; count: number } | null>(null);
  const fairWage = Number(wage || 0) >= MIN_DAILY_WAGE;

  async function handleAiFill() {
    setAiLoading(true);
    setAiNote("");
    try {
      const res = await fetch("/api/ai/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("aiError"));
        return;
      }
      const p = data.parsed;
      if (p.title) setTitle(p.title);
      if (p.workerType) setWorkerType(p.workerType);
      if (p.requiredSkills?.length) setSkills(p.requiredSkills);
      if (p.numberOfWorkers) setNumberOfWorkers(p.numberOfWorkers);
      if (p.date) setDate(p.date);
      if (p.wage) setWage(String(p.wage));
      if (p.city) setLocationName(p.city);
      if (p.startTimeHour) {
        setStartHour(p.startTimeHour);
        setStartMinute(p.startTimeMinute ?? 0);
        setStartPeriod(p.startTimePeriod ?? "AM");
      }
      setAiNote(t("aiApplied"));
      toast.success(t("aiApplied"));
    } catch {
      setError(t("aiError"));
    } finally {
      setAiLoading(false);
    }
  }
  function getCategoryName(id: string) {
    return WORKER_CATEGORIES.find((c) => c.id === id)?.[locale] || id;
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

  function handleCategoryChange(id: string) {
    setWorkerType(id);
    setSkills([]); // Reset skills when category changes
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    setGpsStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLat(pos.coords.latitude);
        setGpsLng(pos.coords.longitude);
        setGpsStatus("set");
      },
      () => {
        setGpsStatus("denied");
      },
      { timeout: 10000 }
    );
  }

  async function handleSubmit() {
    setError("");

    if (!title.trim() || !workerType || skills.length === 0 || !date || !locationName) {
      setError(t("fillRequired"));
      return;
    }
    const wageNum = Number(wage);
    if (!wageNum || wageNum < 100 || wageNum > 100000) {
      setError(t("wageInvalid"));
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          workerType,
          requiredSkills: skills,
          numberOfWorkers,
          date,
          startTimeHour: startHour,
          startTimeMinute: startMinute,
          startTimePeriod: startPeriod,
          endTimeHour: endHour,
          endTimeMinute: endMinute,
          endTimePeriod: endPeriod,
          wage: Number(wage || 0),
          toolsRequired: tools,
          locationName,
          locationLat: gpsLat,
          locationLng: gpsLng,
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("jobError"));
        setSubmitting(false);
        return;
      }

      setCreatedJobId(data.job.id);

      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
        setShowMatches(true);
      } else {
        setNoMatches(true);
      }
    } catch {
      setError(t("jobError"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleSendOffers() {
    router.push("/employer/jobs");
  }

  function handleContinueSearching() {
    router.push("/employer/jobs");
  }

  function handleNoContinue() {
    router.push("/employer/jobs");
  }

  // ── Matching Results Overlay ──
  if (showMatches) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-successsoft">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-ink">{t("jobPosted")}</h1>
            <p className="mt-1 text-sm text-muted">
              {t("professionalsFound", { count: matches.length })}
            </p>
          </div>

          <div className="space-y-3">
            {matches.map((m) => (
              <div
                key={m.userId}
                className="rounded-2xl border border-line bg-surface p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-ink">{m.name}</div>
                      <div className="text-sm text-muted">
                        {experienceLabel(m.experience)}
                      </div>
                    </div>
                  </div>
                  <Badge tone="info">{m.matchScore}% {t("matchScore")}</Badge>
                </div>

                {m.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.skills.slice(0, 4).map((sId) => (
                      <span key={sId} className="rounded-lg bg-primarysoft px-2 py-0.5 text-xs font-medium text-primary">
                        {getSkillName(sId)}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                  <span>★ {m.avgRating.toFixed(1)}</span>
                  <span>{m.totalJobs} {t("jobsCompleted")}</span>
                  <span>{t("expectedWage")}: {m.expectedWage.toLocaleString()} PKR</span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSendOffers} data-testid="send-offers"
            className="mt-6 w-full rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            {t("sendOffers")}
          </button>
        </main>
        <EmployerBottomNav />
      </>
    );
  }

  // ── No Matches Overlay ──
  if (noMatches) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-ink">{t("noProfessionalsFound")}</h1>
            <p className="mt-1 text-sm text-muted">{t("noProfessionalsDesc")}</p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h2 className="mb-2 font-semibold text-ink">{t("continueSearching")}</h2>
            <p className="mb-6 text-sm text-muted">{t("continueSearchingDesc")}</p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleContinueSearching}
                className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                {t("yesContinue")}
              </button>
              <button
                type="button"
                onClick={handleNoContinue}
                className="w-full rounded-xl border border-line bg-white py-3.5 text-base font-semibold text-ink transition hover:bg-surface2"
              >
                {t("noGoBack")}
              </button>
            </div>
          </div>
        </main>
        <EmployerBottomNav />
      </>
    );
  }

  // ── Job Creation Form ──
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        <h1 className="mb-6 text-2xl font-bold text-ink">{t("createJob")}</h1>

        {error && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* AI Job Assistant */}
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primarysoft to-accentsoft p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">AI</span>
              <h2 className="text-base font-bold text-ink">{t("aiTitle")}</h2>
            </div>
            <p className="mb-3 text-xs text-muted">{t("aiHint")}</p>
            <textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              rows={2}
              maxLength={400}
              placeholder={t("aiPlaceholder")}
              className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primarysoft"
            />
            <button
              type="button"
              onClick={handleAiFill}
              disabled={aiLoading || aiText.trim().length < 8}
              className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primarystrong disabled:opacity-50"
            >
              {aiLoading ? t("aiWorking") : t("aiButton")}
            </button>
            {aiNote && <p className="mt-2 text-xs font-semibold text-primary">{aiNote}</p>}
          </div>
          {/* Job Title */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-ink">
              {t("jobTitle")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title} data-testid="job-title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("jobTitlePlaceholder")}
              maxLength={100}
              className="w-full rounded-xl border border-line px-4 py-3 text-base transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Professional Type */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <label className="mb-3 block text-sm font-semibold text-ink">
              {t("professionalType")} <span className="text-red-500">*</span>
            </label>
            <CategorySelector
              value={workerType as WorkerCategoryId | ""}
              onChange={handleCategoryChange}
            />
          </div>

          {/* Skills */}
          {workerType && (
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <label className="mb-3 block text-sm font-semibold text-ink">
                {t("requiredSkills")} <span className="text-red-500">*</span>
              </label>
              <SkillSelector
                category={workerType as WorkerCategoryId}
                value={skills}
                onChange={setSkills}
                label={t("requiredSkills")}
              />
            </div>
          )}

          {/* People Needed */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <NumberSelector
              value={numberOfWorkers}
              onChange={setNumberOfWorkers}
              min={1}
              max={20}
              label={t("peopleNeeded")}
            />
          </div>

          {/* Job Date */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-ink">
              {t("jobDate")} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl border border-line px-4 py-3 text-base transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Start Time */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <TimeSelector
              hour={startHour}
              minute={startMinute}
              period={startPeriod}
              onChange={(h, m, p) => { setStartHour(h); setStartMinute(m); setStartPeriod(p); }}
              label={t("startTime")}
            />
          </div>

          {/* End Time */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <TimeSelector
              hour={endHour}
              minute={endMinute}
              period={endPeriod}
              onChange={(h, m, p) => { setEndHour(h); setEndMinute(m); setEndPeriod(p); }}
              label={t("endTime")}
            />
          </div>

          {/* Wage */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-ink">
              {t("wagePerPerson")} <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text" inputMode="numeric" placeholder="2000"
                value={wage}
                onChange={(e) => setWage(e.target.value.replace(/[^0-9]/g, ""))}
                min={100}
                max={100000}
                className="w-full rounded-xl border border-line px-4 py-3 text-base transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <span className="whitespace-nowrap text-sm font-semibold text-muted">PKR</span>
            </div>
          {fairWage && (
            <div className="inline-flex items-center gap-1 rounded-full bg-successsoft px-3 py-1 text-xs font-bold text-success">
              ✓ {t("fairWage")}
            </div>
          )}
          {wageStats && (
            <p className="text-xs text-muted">
              💡 {t("wageTypical", { min: wageStats.min.toLocaleString(), max: wageStats.max.toLocaleString(), count: wageStats.count })}
            </p>
          )}
            {numberOfWorkers > 1 && (
              <div className="mt-2 rounded-lg bg-primarysoft px-3 py-2 text-sm font-medium text-primary">
                {t("totalCost")}: {(Number(wage || 0) * numberOfWorkers).toLocaleString()} PKR ({numberOfWorkers} × {Number(wage || 0).toLocaleString()})
              </div>
            )}
          </div>

          {/* Tools Provided */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <label className="mb-1 block text-sm font-semibold text-ink">
              {t("toolsProvided")} <span className="text-xs font-normal text-muted">({commonT("optional")})</span>
            </label>
            <p className="mb-3 text-xs text-muted">{t("toolsHint")}</p>
            <ToolSelector value={tools} onChange={setTools} />
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <label className="mb-3 block text-sm font-semibold text-ink">
              {t("jobLocation")} <span className="text-red-500">*</span>
            </label>
            <CitySelector value={locationName} onChange={setLocationName} label={t("jobLocation")} />

            {/* GPS Location Button */}
            <button
              type="button"
              onClick={requestLocation}
              disabled={gpsStatus === "requesting"}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-gray-50 px-4 py-3 text-sm font-medium text-ink transition hover:bg-surface2 disabled:opacity-50"
            >
              {gpsStatus === "requesting" ? (
                <>
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("requestingLocation")}
                </>
              ) : gpsStatus === "set" ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="text-success">{t("locationSet")}</span>
                </>
              ) : gpsStatus === "denied" ? (
                <span className="text-yellow-700">{t("locationDenied")}</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {t("useMyLocation")}
                </>
              )}
            </button>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-ink">
              {t("additionalDetails")} <span className="text-xs font-normal text-muted">({commonT("optional")})</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              maxLength={1000}
              rows={3}
              className="w-full resize-none rounded-xl border border-line px-4 py-3 text-base transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit} data-testid="submit-job"
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t("findingProfessionals")}
            </>
          ) : (
            t("postJobButton")
          )}
        </button>
      </main>
      <EmployerBottomNav />
    </>
  );
}