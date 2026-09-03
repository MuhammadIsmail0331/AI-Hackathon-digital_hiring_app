"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui";

interface BlockedUser {
  id: string;
  userId: string;
  reason: string | null;
  blockedAt: string;
  user: { id: string; name: string; email: string; phone: string; role: string };
}

interface IssueReport {
  id: string;
  subject: string;
  description: string;
  status: string;
  adminResponse: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string; role: string };
}

interface AdminStats {
  totalUsers: number;
  totalWorkers: number;
  totalEmployers: number;
  totalJobs: number;
  completedJobs: number;
  activeJobs: number;
  totalOffers: number;
  totalPaidOut: number;
  avgWage: number;
}

type Tab = "stats" | "issues" | "blocked";

export default function AdminPage() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("stats");
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockUserId, setBlockUserId] = useState("");
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [bu, st, iss] = await Promise.all([
          fetch("/api/admin/blocked-users"),
          fetch("/api/admin/stats"),
          fetch("/api/admin/issues"),
        ]);
        if (bu.status === 403 || st.status === 403) { setAuthorized(false); return; }
        setAuthorized(true);
        if (bu.ok) setBlockedUsers((await bu.json()).blockedUsers ?? []);
        if (st.ok) setStats(await st.json());
        if (iss.ok) setIssues((await iss.json()).issues ?? []);
      } catch { setAuthorized(false); } finally { setLoading(false); }
    })();
  }, []);

  async function refresh() {
    const [bu, iss] = await Promise.all([
      fetch("/api/admin/blocked-users"), fetch("/api/admin/issues"),
    ]);
    if (bu.ok) setBlockedUsers((await bu.json()).blockedUsers ?? []);
    if (iss.ok) setIssues((await iss.json()).issues ?? []);
  }

  async function blockUser() {
    if (!blockUserId.trim()) return;
    setBusy("block");
    await fetch("/api/admin/blocked-users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: blockUserId, reason: blockReason }) });
    setBlockUserId(""); setBlockReason(""); setShowBlockForm(false);
    await refresh(); setBusy(null);
  }

  async function unblockUser(userId: string) {
    setBusy(userId);
    await fetch("/api/admin/blocked-users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    await refresh(); setBusy(null);
  }

  async function setIssueStatus(issueId: string, status: string) {
    setBusy(issueId);
    await fetch("/api/admin/issues", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ issueId, status }) });
    await refresh(); setBusy(null);
  }

  if (authorized === false) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-danger/30 bg-dangersoft p-8">
            <h1 className="mb-2 text-xl font-bold text-danger">Access Denied</h1>
            <p className="text-sm text-danger">Admin access required.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6 pb-24 sm:pb-8">
        <h1 className="mb-6 text-2xl font-bold text-ink">Admin Panel</h1>

        <div className="mb-6 flex gap-2 rounded-xl border border-line bg-surface p-1">
          {(["stats", "issues", "blocked"] as Tab[]).map((tabId) => (
            <button key={tabId} onClick={() => setTab(tabId)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${tab === tabId ? "bg-primary text-white" : "text-muted hover:text-ink"}`}>
              {tabId === "stats" ? "📊 Stats" : tabId === "issues" ? `📋 Issues (${issues.filter(i => i.status === "OPEN").length})` : "🚫 Blocked"}
            </button>
          ))}
        </div>

        {tab === "stats" && stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              ["Total Users", stats.totalUsers],
              ["Workers", stats.totalWorkers],
              ["Employers", stats.totalEmployers],
              ["Total Jobs", stats.totalJobs],
              ["Completed", stats.completedJobs],
              ["Active Jobs", stats.activeJobs],
              ["Offers Sent", stats.totalOffers],
              ["Total Paid Out", `${stats.totalPaidOut.toLocaleString()} PKR`],
              ["Avg Daily Wage", `${stats.avgWage.toLocaleString()} PKR`],
            ].map(([label, value], i) => (
              <div key={i} className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
                <div className="text-2xl font-bold text-primary">{value}</div>
                <div className="text-xs text-muted">{label}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "issues" && (
          <div className="space-y-4">
            {issues.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface p-8 text-center">
                <p className="text-muted">No issues reported yet.</p>
              </div>
            ) : (
              issues.map((issue) => (
                <div key={issue.id} className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-ink">{issue.subject}</h3>
                      <p className="text-xs text-muted">
                        {issue.user.name} · {issue.user.email} · {new Date(issue.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      issue.status === "OPEN" ? "bg-accentsoft text-accent" :
                      issue.status === "IN_PROGRESS" ? "bg-primarysoft text-primary" :
                      issue.status === "RESOLVED" ? "bg-successsoft text-success" :
                      "bg-surface2 text-muted"
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{issue.description}</p>
                  {issue.adminResponse && (
                    <div className="mt-2 rounded-xl bg-primarysoft p-3 text-sm text-ink">
                      <strong>Admin:</strong> {issue.adminResponse}
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    {issue.status === "OPEN" && (
                      <button onClick={() => setIssueStatus(issue.id, "IN_PROGRESS")} disabled={busy === issue.id}
                        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
                        Start Progress
                      </button>
                    )}
                    {issue.status !== "RESOLVED" && issue.status !== "CLOSED" && (
                      <button onClick={() => setIssueStatus(issue.id, "RESOLVED")} disabled={busy === issue.id}
                        className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white hover:bg-success/90 disabled:opacity-50">
                        Resolve
                      </button>
                    )}
                    {issue.status !== "CLOSED" && (
                      <button onClick={() => setIssueStatus(issue.id, "CLOSED")} disabled={busy === issue.id}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface2 disabled:opacity-50">
                        Close
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "blocked" && (
          <div className="space-y-4">
            {showBlockForm ? (
              <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <div className="space-y-3">
                  <input value={blockUserId} onChange={(e) => setBlockUserId(e.target.value)} placeholder="User ID (UUID)" className="w-full rounded-xl border border-line px-4 py-2 text-sm outline-none focus:border-primary" />
                  <input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Reason" className="w-full rounded-xl border border-line px-4 py-2 text-sm outline-none focus:border-primary" />
                  <div className="flex gap-2">
                    <button onClick={blockUser} disabled={busy === "block" || !blockUserId} className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90 disabled:opacity-50">Block User</button>
                    <button onClick={() => setShowBlockForm(false)} className="rounded-xl border border-line px-4 py-2 text-sm font-medium">Cancel</button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowBlockForm(true)} className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white hover:bg-danger/90">+ Block User</button>
            )}
            {blockedUsers.length === 0 ? (
              <p className="py-8 text-center text-muted">No blocked users.</p>
            ) : (
              <div className="space-y-3">
                {blockedUsers.map((bu) => (
                  <div key={bu.id} className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm">
                    <div>
                      <p className="font-semibold text-ink">{bu.user.name}</p>
                      <p className="text-sm text-muted">{bu.user.email} • {bu.user.phone}</p>
                      {bu.reason && <Badge tone="warning">{bu.reason}</Badge>}
                    </div>
                    <button onClick={() => unblockUser(bu.userId)} disabled={busy === bu.userId}
                      className="rounded-xl border border-success/30 px-3 py-1.5 text-sm font-medium text-success hover:bg-successsoft disabled:opacity-50">
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="mt-4 text-center text-sm text-danger">{error}</p>}
      </main>
    </>
  );
}
