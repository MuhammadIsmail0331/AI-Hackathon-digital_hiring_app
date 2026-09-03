"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { WorkerBottomNav } from "@/components/layout/WorkerBottomNav";
import { toast } from "sonner";
import {
  CategorySelector,
  SkillSelector,
  CitySelector,
  DayPicker,
  Button,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  EXPERIENCE_LEVELS,
  type WorkerCategoryId,
  type CityId,
  type DayId,
} from "@/lib/constants";

export default function WorkerProfileEditPage() {
  const t = useTranslations("Profile");
  const common = useTranslations("Common");
  const router = useRouter();

  // Form state
  const [workerType, setWorkerType] = useState<WorkerCategoryId | "">("");
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState(1);
  const [locationName, setLocationName] = useState<CityId | "">("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [availableDays, setAvailableDays] = useState<DayId[]>([]);
  const [expectedWage, setExpectedWage] = useState("");
  const [bio, setBio] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Fetch existing profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/worker/profiles");
        if (!res.ok) return;
        const data = await res.json();
        const typeParam = new URLSearchParams(window.location.search).get("type");
        const list: Array<{ workerType: string; skills: string[]; experience: number; locationName: string | null; expectedWage: number; isAvailable: boolean; availableDays: string[]; bio: string | null }> = data.profiles ?? [];
        const p = list.find((x) => x.workerType === typeParam) ?? list[0];
        if (p) {
          setIsEdit(true);
          setWorkerType((p.workerType as WorkerCategoryId) || "");
          setSkills(Array.isArray(p.skills) ? p.skills : []);
          setExperience(typeof p.experience === "number" ? p.experience : 1);
          setLocationName((p.locationName as CityId) || "");
          setIsAvailable(p.isAvailable ?? true);
          setAvailableDays(
            Array.isArray(p.availableDays) ? (p.availableDays as DayId[]) : []
          );
          setExpectedWage(p.expectedWage ? String(p.expectedWage) : "");
          setBio(p.bio || "");
        }
      } catch {
        // no profile yet â€“ form stays empty
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function handleCategoryChange(catId: WorkerCategoryId) {
    setWorkerType(catId);
    setSkills([]);
  }

  function experienceLevelId(years: number): string {
    if (years <= 1) return "beginner";
    if (years <= 4) return "intermediate";
    if (years <= 9) return "experienced";
    return "expert";
  }

  function selectExperienceLevel(levelId: string) {
    const level = EXPERIENCE_LEVELS.find((l) => l.id === levelId);
    if (level) setExperience(level.years);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!workerType) { setError(t("workerType")); return; }
    if (skills.length === 0) { setError(t("selectSkills")); return; }
    if (!locationName) { setError(t("selectCity")); return; }
    if (availableDays.length === 0) { setError(t("availability")); return; }
    const wage = parseInt(expectedWage, 10);
    if (!wage || wage < 100) { setError(t("wageHint")); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/worker/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerType, skills, experience, locationName,
          expectedWage: wage, isAvailable, availableDays,
          bio: bio || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t("profileError")); return; }
      toast.success(t("profileSaved"));
      router.push("/worker/profile");
    } catch {
      setError(t("profileError"));
    } finally {
      setSaving(false);
    }
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
            <span className="text-base">{common("loading")}</span>
          </div>
        </div>
        <WorkerBottomNav />
      </>
    );
  }

  const currentLevel = experienceLevelId(experience);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("completeProfileDesc")}</p>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div role="status" className="mb-4 rounded-xl border border-success/30 bg-successsoft p-4 text-sm text-success">{t("profileSaved")}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* â”€â”€ 1: Worker Type â”€â”€ */}
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-primary">1</span>
              {t("workerType")}<span className="text-xs text-red-500">*</span>
            </h2>
            <CategorySelector value={workerType} onChange={handleCategoryChange} />
          </section>

          {/* â”€â”€ 2: Skills â”€â”€ */}
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-primary">2</span>
              {t("skills")}<span className="text-xs text-red-500">*</span>
            </h2>
            <SkillSelector category={workerType} value={skills} onChange={setSkills} label={t("skills")} />
            {skills.length > 0 && (
              <p className="mt-2 text-xs text-muted">{skills.length} {common("selected")}</p>
            )}
          </section>

          {/* â”€â”€ 3: Experience â”€â”€ */}
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-primary">3</span>
              {t("experience")}
            </h2>
            <p className="mb-3 text-sm text-muted">{t("selectExperience")}</p>
            <div className="grid grid-cols-2 gap-3">
              {EXPERIENCE_LEVELS.map((level) => {
                const isSelected = currentLevel === level.id;
                return (
                  <button key={level.id} type="button" onClick={() => selectExperienceLevel(level.id)}
                    className={cn("rounded-xl border-2 p-4 text-start transition hover:shadow-sm active:scale-[0.97]",
                      isSelected ? "border-blue-500 bg-primarysoft" : "border-line bg-surface hover:border-line")}>
                    <div className={cn("text-sm font-semibold", isSelected ? "text-primary" : "text-ink")}>{t(level.id)}</div>
                    <div className={cn("mt-1 text-xs", isSelected ? "text-blue-500" : "text-muted")}>{level.years} {t("yearsExp")}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* â”€â”€ 4: Location â”€â”€ */}
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-primary">4</span>
              {t("location")}<span className="text-xs text-red-500">*</span>
            </h2>
            <p className="mb-3 text-sm text-muted">{t("selectCity")}</p>
            <CitySelector value={locationName} onChange={(cityId) => setLocationName(cityId)} label={t("location")} />
          </section>

          {/* â”€â”€ 5: Availability â”€â”€ */}
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-primary">5</span>
              {t("availability")}
            </h2>
            <button type="button" onClick={() => setIsAvailable(!isAvailable)}
              className={cn("mb-4 flex w-full items-center justify-between rounded-xl border-2 p-4 transition",
                isAvailable ? "border-green-400 bg-successsoft" : "border-line bg-gray-50")}>
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-full",
                  isAvailable ? "bg-successsoft" : "bg-line")}>
                  {isAvailable ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success"><path d="M20 6 9 17l-5-5" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  )}
                </div>
                <span className={cn("text-sm font-semibold", isAvailable ? "text-success" : "text-muted")}>
                  {isAvailable ? t("availableNow") : t("notAvailable")}
                </span>
              </div>
              <div className={cn("relative h-7 w-12 rounded-full transition", isAvailable ? "bg-successsoft0" : "bg-gray-300")}>
                <div className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all", isAvailable ? "start-5" : "start-0.5")} />
              </div>
            </button>
            <DayPicker value={availableDays} onChange={(days) => setAvailableDays(days as DayId[])} />
          </section>

          {/* â”€â”€ 6: Expected Wage â”€â”€ */}
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-primary">6</span>
              {t("expectedWage")}<span className="text-xs text-red-500">*</span>
            </h2>
            <div className="flex items-center gap-3">
              <input type="number" value={expectedWage} onChange={(e) => setExpectedWage(e.target.value)}
                placeholder={t("wagePlaceholder")} min={100} max={100000}
                className="w-full rounded-xl border border-line px-4 py-3 text-lg font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
              <div className="flex h-12 shrink-0 items-center rounded-xl bg-blue-100 px-4 text-sm font-bold text-primary">
                {t("pkr")}<span className="ms-1 text-xs font-normal">{common("perDay")}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">{t("wageHint")}</p>
          </section>

          {/* â”€â”€ 7: Bio â”€â”€ */}
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface2 text-xs font-bold text-muted">7</span>
              {t("bio")}<span className="text-xs text-muted">({common("optional")})</span>
            </h2>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder={t("bioPlaceholder")} maxLength={500} rows={3}
              className="w-full rounded-xl border border-line px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
            <p className="mt-2 text-xs text-muted">{bio.length}/500 Â· {t("bioHint")}</p>
          </section>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={saving} className="sticky bottom-20 sm:bottom-4">
            {t("saveProfile")}
          </Button>
        </form>
      </main>
      <WorkerBottomNav />
    </>
  );
}