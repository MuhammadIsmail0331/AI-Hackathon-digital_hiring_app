"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { BrandAccent } from "@/components/ui/BrandAccent";
import { Button } from "@/components/ui/Button";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { prettyLabel } from "@/lib/labels";
import { toast } from "sonner";

/**
 * My Photos — profile photo + per-profession work portfolio.
 * Backed by /api/worker/portfolio (GET/PUT) and /api/user/avatar (POST).
 */

interface ProfilePhotos {
  id: string;
  workerType: string;
  images: string[];
}

export default function MediaPage() {
  const t = useTranslations("MediaPage");
  const locale = useLocale();

  const [avatar, setAvatar] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<ProfilePhotos[] | null>(null);
  const [edits, setEdits] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingId, setSavingId] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/worker/portfolio");
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { avatarUrl: string | null; profiles: ProfilePhotos[] };
      setAvatar(data.avatarUrl ? [data.avatarUrl] : []);
      setProfiles(data.profiles);
      setEdits(Object.fromEntries(data.profiles.map((p) => [p.id, p.images])));
      setError("");
    } catch {
      setError(t("loadError"));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveAvatar() {
    setSavingAvatar(true);
    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: avatar[0] ?? "" }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("saved"));
    } catch {
      toast.error(t("loadError"));
    } finally {
      setSavingAvatar(false);
    }
  }

  async function saveProfile(profileId: string) {
    const images = edits[profileId] ?? [];
    setSavingId(profileId);
    try {
      const res = await fetch("/api/worker/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, images }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("saved"));
      setProfiles((prev) =>
        prev ? prev.map((p) => (p.id === profileId ? { ...p, images } : p)) : prev,
      );
    } catch {
      toast.error(t("loadError"));
    } finally {
      setSavingId("");
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-enter mx-auto max-w-2xl px-4 py-8 pb-24 sm:pb-12">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-primarysoft text-3xl shadow-sm">
            📷
          </div>
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>

        <BrandAccent height="sm" className="mb-6" />

        {error ? (
          <div className="rounded-2xl border border-line bg-surface p-4 text-center text-sm text-muted">
            {error}{" "}
            <button type="button" onClick={() => void load()} className="font-semibold text-primary underline">
              {locale === "ur" ? "دوبارہ کوشش" : "Retry"}
            </button>
          </div>
        ) : profiles === null ? (
          <div className="flex justify-center py-10">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-base font-bold text-ink">🙂 {t("avatar")}</h2>
              <p className="mb-3 text-sm text-muted">{t("avatarHint")}</p>
              <PhotoUpload value={avatar} onChange={setAvatar} max={1} />
              <div className="mt-4 flex justify-end">
                <Button onClick={() => void saveAvatar()} disabled={savingAvatar}>
                  {savingAvatar ? t("saving") : t("save")}
                </Button>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-base font-bold text-ink">🛠️ {t("portfolio")}</h2>
              {profiles.length === 0 ? (
                <div className="rounded-2xl border border-line bg-surface p-6 text-center">
                  <div className="mb-2 text-3xl">🧰</div>
                  <p className="text-sm text-muted">{t("noProfiles")}</p>
                </div>
              ) : (
                profiles.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                    <h3 className="mb-1 font-semibold text-ink">{prettyLabel(p.workerType)}</h3>
                    <p className="mb-3 text-sm text-muted">{t("portfolioHint")}</p>
                    <PhotoUpload
                      value={edits[p.id] ?? []}
                      onChange={(urls) => setEdits((prev) => ({ ...prev, [p.id]: urls }))}
                      max={6}
                    />
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={() => void saveProfile(p.id)}
                        disabled={savingId === p.id}
                        variant={JSON.stringify(edits[p.id] ?? []) === JSON.stringify(p.images) ? "secondary" : "primary"}
                      >
                        {savingId === p.id ? t("saving") : t("save")}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
