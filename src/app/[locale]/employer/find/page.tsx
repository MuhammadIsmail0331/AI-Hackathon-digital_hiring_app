"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { EmployerBottomNav } from "@/components/layout/EmployerBottomNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkerCharacter } from "@/components/illustrations/characters";
import { CategorySelector, CitySelector } from "@/components/ui";
import { toast } from "sonner";

interface WorkerCard {
  userId: string;
  name: string;
  workerType: string;
  skills: string[];
  experience: number;
  expectedWage: number;
  avgRating: number;
  totalJobs: number;
  locationName: string | null;
  isAvailable: boolean;
}

interface DetailData {
  worker: {
    id: string;
    name: string;
    memberSince: string;
    profiles: Array<{
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
    }>;
  };
}
interface EmployerJob {
  id: string;
  title: string;
  status: string;
}

export default function FindProfessionalsPage() {
  const locale = useLocale() as "en" | "ur";
  const isUr = locale === "ur";
  const L = (en: string, ur: string) => (isUr ? ur : en);

  const [workers, setWorkers] = useState<WorkerCard[]>([]);
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [workerType, setWorkerType] = useState("");
  const [customType, setCustomType] = useState("");
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [picked, setPicked] = useState<{ workerId: string; jobId: string } | null>(null);
  const [sentTo, setSentTo] = useState<Record<string, boolean>>({});
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  async function openDetail(workerId: string) {
    setDetailId(workerId);
    setDetail(null);
    try {
      const res = await fetch(`/api/employer/workers/${workerId}`);
      const data = await res.json();
      if (res.ok) setDetail(data);
    } catch {
      /* noop */
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (workerType) {
        // "Other" + typed profession searches the normalized stored value
        const resolved =
          workerType === "other" && customType.trim().length >= 2
            ? customType.trim().replace(/\s+/g, " ").toLowerCase()
            : workerType;
        params.set("workerType", resolved);
      }
      if (city) params.set("city", city);
      if (minRating > 0) params.set("minRating", String(minRating));
      const res = await fetch(`/api/employer/workers?${params}`);
      const data = await res.json();
      setWorkers(data.workers ?? []);
    } catch {
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, [workerType, customType, city, minRating]);

  useEffect(() => {
    const id = setTimeout(load, 250);
    async function openDetail(workerId: string) {
    setDetailId(workerId);
    setDetail(null);
    try {
      const res = await fetch(`/api/employer/workers/${workerId}`);
      const data = await res.json();
      if (res.ok) setDetail(data);
    } catch {
      /* noop */
    }
  }
  return () => clearTimeout(id);
  }, [load]);

  useEffect(() => {
    fetch("/api/employer/jobs")
      .then((r) => (r.ok ? r.json() : { jobs: [] }))
      .then((d) =>
        setJobs((d.jobs ?? []).filter((j: EmployerJob) => ["OPEN", "MATCHING"].includes(j.status)))
      )
      .catch(() => setJobs([]));
  }, []);

  async function sendOffer(workerId: string, jobId: string) {
    const res = await fetch(`/api/employer/jobs/${jobId}/offer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message || L("Offer sent", "پیشکش بھیج دی گئی"));
      setSentTo((s) => ({ ...s, [workerId]: true }));
      setPicked(null);
    } else {
      toast.error(data.error || L("Failed to send offer", "پیشکش بھیجنے میں ناکامی"));
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 pb-24 sm:pb-8">
        <PageHeader
          title={L("Find Professionals", "پیشہ ور تلاش کریں")}
          subtitle={L("Browse rated workers and send offers directly", "درجہ بندی شدہ مزدور دیکھیں اور سیدھی پیشکش بھیجیں")}
        />

        <div className="mb-6 space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <CategorySelector
            value={workerType as never}
            onChange={(id) => {
              setWorkerType(workerType === id ? "" : id);
              if (id !== "other") setCustomType("");
            }}
            customValue={customType}
            onCustomChange={setCustomType}
          />
          <CitySelector value={city as never} onChange={(id) => setCity(city === id ? "" : id)} />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted">{L("Minimum rating:", "کم از کم درجہ بندی:")}</span>
            {[0, 4, 4.5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setMinRating(r)}
                className={
                  "rounded-full px-3 py-1 text-xs font-semibold transition " +
                  (minRating === r ? "bg-primary text-white" : "bg-surface2 text-muted hover:text-ink")
                }
              >
                {r === 0 ? L("All", "سب") : `${r}+ ★`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <svg className="h-6 w-6 animate-spin text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : workers.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-10 text-center">
            <SearchIllustration />
            <p className="mt-4 text-sm text-muted">
              {L("No professionals match your filters", "آپ کے فلٹرز سے ملنے والے کوئی پیشہ ور نہیں")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workers.map((w) => (
              <div key={w.userId} onClick={() => openDetail(w.userId)} className="flex cursor-pointer items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:shadow-md">
                <WorkerCharacter type={(w.workerType as never) || "generic"} className="w-16 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-bold text-ink">{w.name}</h3>
                    {w.totalJobs > 0 && (
                      <span className="rounded-full bg-accentsoft px-2 py-0.5 text-xs font-semibold text-accent">
                        ★ {w.avgRating.toFixed(1)} · {w.totalJobs} {isUr ? "کام" : "jobs"}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs capitalize text-muted">
                    {w.workerType} · {w.experience}+ {isUr ? "سال" : "yrs"} · {w.locationName || "—"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary">
                    {w.expectedWage.toLocaleString()} PKR / {isUr ? "دن" : "day"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(w.skills ?? []).slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full bg-surface2 px-2 py-0.5 text-[11px] text-muted">{s}</span>
                    ))}
                  </div>
                  <div className="mt-3">
                    {sentTo[w.userId] ? (
                      <span className="inline-block rounded-xl bg-successsoft px-4 py-2 text-sm font-semibold text-success">
                        ✓ {L("Offer sent", "پیشکش بھیج دی گئی")}
                      </span>
                    ) : jobs.length === 0 ? (
                      <span className="text-xs text-muted">
                        {L("Create an open job first to send offers", "پہلے ایک کھلی نوکری بنائیں")}
                      </span>
                    ) : picked?.workerId === w.userId ? (
                      <select
                        className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink"
                        defaultValue=""
                        onChange={(e) => {
                          const jid = e.target.value;
                          setPicked(null);
                          if (jid) sendOffer(w.userId, jid);
                        }}
                      >
                        <option value="">{L("Choose a job...", "نوکری چنیں...")}</option>
                        {jobs.map((j) => (
                          <option key={j.id} value={j.id}>{j.title}</option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPicked({ workerId: w.userId, jobId: "" })}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primarystrong"
                      >
                        {L("Send Offer", "پیشکش بھیجیں")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {/* Worker detail modal */}
      {detailId && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => {
            setDetailId(null);
            setDetail(null);
          }}
        >
          <div
            className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {detail ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <WorkerCharacter
                      type={(detail.worker.profiles[0]?.workerType as never) || "generic"}
                      className="w-14 shrink-0"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-ink">{detail.worker.name}</h3>
                      <p className="text-xs text-muted">
                        {L("Member since", "عضویت سے")}{" "}
                        {new Date(detail.worker.memberSince).toLocaleDateString(
                          isUr ? "ur-PK" : "en-PK",
                          { month: "long", year: "numeric" }
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDetailId(null);
                      setDetail(null);
                    }}
                    className="rounded-xl p-2 text-muted transition hover:bg-surface2 hover:text-ink"
                    aria-label={L("Close", "بند کریں")}
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {detail.worker.profiles.map((p, i) => (
                    <div key={i} className="rounded-2xl border border-line bg-surface2/50 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold capitalize text-ink">{p.workerType}</h4>
                        {p.totalJobs > 0 && (
                          <span className="rounded-full bg-accentsoft px-2.5 py-0.5 text-xs font-semibold text-accent">
                            ★ {p.avgRating.toFixed(1)} · {p.totalJobs} {isUr ? "کام" : "jobs"}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-primary">
                        {p.expectedWage.toLocaleString()} PKR / {isUr ? "دن" : "day"} · {p.experience}+ {isUr ? "سال تجربہ" : "yrs exp"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.skills.map((s) => (
                          <span key={s} className="rounded-full bg-surface2 px-2 py-0.5 text-[11px] text-muted">{s}</span>
                        ))}
                      </div>
                      {p.bio && <p className="mt-2 text-xs leading-relaxed text-muted">{p.bio}</p>}
                      {p.isAvailable && (
                        <p className="mt-2 text-xs font-semibold text-success">
                          ✓ {isUr ? "دستیاب" : "Available now"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {jobs.length > 0 && !sentTo[detail.worker.id] && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold text-muted">
                      {L("Send an offer for:", "پیشکش بھیجیں برائے:")}
                    </p>
                    <select
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) sendOffer(detail.worker.id, e.target.value);
                      }}
                    >
                      <option value="">{L("Choose a job...", "نوکری چنیں...")}</option>
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>{j.title}</option>
                      ))}
                    </select>
                  </div>
                )}
                {sentTo[detail.worker.id] && (
                  <p className="mt-4 text-center text-sm font-semibold text-success">
                    ✓ {L("Offer sent", "پیشکش بھیج دی گئی")}
                  </p>
                )}
              </>
            ) : (
              <p className="py-10 text-center text-sm text-muted">...</p>
            )}
          </div>
        </div>
      )}
      <EmployerBottomNav />
    </>
  );
}

function SearchIllustration() {
  return (
    <svg viewBox="0 0 120 80" className="mx-auto w-28" aria-hidden="true">
      <circle cx="50" cy="32" r="20" stroke="var(--primary)" strokeWidth="5" fill="none" opacity="0.6" />
      <line x1="65" y1="48" x2="82" y2="66" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      <circle cx="46" cy="28" r="4" fill="var(--accent)" />
      <circle cx="88" cy="20" r="3" fill="var(--terracotta)" />
    </svg>
  );
}