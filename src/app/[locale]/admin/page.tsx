"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui";

interface BlockedUser {
  id: string;
  userId: string;
  reason: string | null;
  blockedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export default function AdminPage() {
  const t = useTranslations("Admin");
  const common = useTranslations("Common");

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Block new user form
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockEmail, setBlockEmail] = useState("");
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  async function loadBlockedUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blocked-users");
      if (res.status === 403) {
        setIsAuthorized(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data.blockedUsers || []);
        setIsAuthorized(true);
      }
    } catch {
      setError(common("error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleBlockUser() {
    if (!blockEmail.trim()) return;
    setActionLoading("block");
    setError("");
    try {
      // First find the user by email
      const res = await fetch("/api/admin/blocked-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: blockEmail, reason: blockReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || common("error"));
        return;
      }
      setBlockEmail("");
      setBlockReason("");
      setShowBlockForm(false);
      await loadBlockedUsers();
    } catch {
      setError(common("error"));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnblockUser(userId: string) {
    setActionLoading(userId);
    setError("");
    try {
      const res = await fetch("/api/admin/blocked-users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || common("error"));
        return;
      }
      await loadBlockedUsers();
    } catch {
      setError(common("error"));
    } finally {
      setActionLoading(null);
    }
  }

  // Not authorized
  if (isAuthorized === false) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <h1 className="mb-2 text-xl font-bold text-red-800">Access Denied</h1>
            <p className="text-sm text-red-600">
              You do not have admin privileges. Please contact an administrator.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          <button
            onClick={() => setShowBlockForm(!showBlockForm)}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
          >
            {t("blockUser")}
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Block form */}
        {showBlockForm && (
          <div className="mb-6 rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-ink">{t("blockUser")}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  User ID
                </label>
                <input
                  type="text"
                  value={blockEmail}
                  onChange={(e) => setBlockEmail(e.target.value)}
                  className="w-full rounded-xl border border-line px-4 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="User ID (UUID)"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  {t("reason")}
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full rounded-xl border border-line px-4 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Reason for blocking"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBlockUser}
                  disabled={actionLoading === "block" || !blockEmail}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading === "block" ? common("loading") : t("blockUser")}
                </button>
                <button
                  onClick={() => setShowBlockForm(false)}
                  className="rounded-xl border border-line px-4 py-2 text-sm font-medium"
                >
                  {common("cancel")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blocked users list */}
        {loading ? (
          <div className="py-12 text-center text-muted">{common("loading")}</div>
        ) : blockedUsers.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-12 text-center shadow-sm">
            <p className="text-lg font-medium text-muted">{t("noBlockedUsers")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedUsers.map((bu) => (
              <div
                key={bu.id}
                className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-ink">{bu.user.name}</p>
                  <p className="text-sm text-muted">
                    {bu.user.email} • {bu.user.phone}
                  </p>
                  <div className="mt-1 flex gap-2">
                    <Badge tone="info">{bu.user.role}</Badge>
                    {bu.reason && (
                      <Badge tone="warning">{bu.reason}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Blocked: {new Date(bu.blockedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleUnblockUser(bu.userId)}
                  disabled={actionLoading === bu.userId}
                  className="rounded-xl border border-green-300 px-3 py-1.5 text-sm font-medium text-success hover:bg-successsoft disabled:opacity-50"
                >
                  {actionLoading === bu.userId ? "..." : t("unblockUser")}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
