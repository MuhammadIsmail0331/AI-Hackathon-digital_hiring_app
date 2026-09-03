"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui";
import { useRouter } from "@/i18n/navigation";

interface NotificationData {
  jobId?: string;
  offerId?: string;
  phone?: string;
  contactName?: string;
  category?: string;
  experience?: number;
  location?: string;
  jobDate?: string;
  startTime?: string;
  link?: string;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  data: NotificationData;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const t = useTranslations("Notifications");
  const commonT = useTranslations("Common");
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }

  async function markRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silently fail
    }
  }

  function getTypeBadge(type: string) {
    switch (type) {
      case "JOB_OFFER":
        return { tone: "info" as const, label: t("newJobOffer") };
      case "JOB_ACCEPTED":
        return { tone: "success" as const, label: t("jobAccepted") };
      case "JOB_DECLINED":
        return { tone: "danger" as const, label: t("jobDeclined") };
      case "JOB_COMPLETED":
        return { tone: "success" as const, label: t("jobCompleted") };
      case "FEEDBACK_REQUEST":
        return { tone: "purple" as const, label: t("feedbackRequest") };
      default:
        return { tone: "default" as const, label: t("system") };
    }
  }

  function handleClick(n: NotificationItem) {
    if (!n.read) markRead(n.id);
    // Navigate to the notification's target page
    if (n.data.link) {
      router.push(n.data.link);
    } else if (n.data.jobId) {
      if (n.type === "JOB_OFFER") {
        router.push("/worker/offers");
      } else {
        router.push("/employer/jobs");
      }
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white shadow-lg shadow-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{t("title")}</h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                  {unreadCount} {t("unread")}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-muted">{commonT("loading")}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-line bg-gradient-to-br from-gray-50 to-slate-50 p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted">{t("noNotifications")}</p>
            <p className="mt-1 text-xs text-muted">You&apos;ll be notified about job offers and updates here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const badge = getTypeBadge(n.type);
              return (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleClick(n)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleClick(n);
                  }}
                  className={`w-full cursor-pointer rounded-2xl border p-4 text-start shadow-sm transition hover:shadow-md ${
                    n.read
                      ? "border-line bg-surface"
                      : "border-blue-100 bg-primarysoft/50"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <Badge tone={badge.tone}>{badge.label}</Badge>
                    <span className="text-xs text-muted">{timeAgo(n.createdAt)}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-ink">{n.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{n.message}</p>

                  {/* Contact card with phone + call button (shared after acceptance) */}
                  {n.data.phone && (
                    <div className="mt-3 rounded-xl border border-success/30 bg-successsoft p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-success">
                            {t("contactInfo")}: {n.data.contactName}
                          </div>
                          <div className="text-sm font-semibold text-success">
                            {n.data.phone}
                          </div>
                          {(n.data.category || n.data.experience || n.data.location || n.data.jobDate) && (
                            <div className="mt-0.5 text-xs text-success">
                              {[
                                n.data.category,
                                n.data.experience ? `${n.data.experience}+ yrs exp` : null,
                                n.data.location,
                                n.data.jobDate ? `${n.data.jobDate}${n.data.startTime ? `, ${n.data.startTime}` : ""}` : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          )}
                        </div>
                        <a
                          href={`tel:${n.data.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-success/90"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                          {t("callNow")}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
