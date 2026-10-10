"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { BrandAccent } from "@/components/ui/BrandAccent";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

/**
 * Chat & Support — two tabs:
 *  People: direct messages with connections (offer peers)
 *  AI Assistant: bilingual support bot (/api/chat/support)
 * Backed by /api/chat/messages (list + thread + send).
 */

interface Peer {
  id: string;
  name: string;
  last: string;
  at: string;
  unread: number;
}

interface Msg {
  id: string;
  fromId: string;
  toId: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
}

interface Turn {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const t = useTranslations("ChatPage");
  const locale = useLocale();
  const isUr = locale === "ur";

  const [tab, setTab] = useState<"people" | "ai">("people");
  const [peers, setPeers] = useState<Peer[] | null>(null);
  const [listError, setListError] = useState("");
  const [activePeer, setActivePeer] = useState<{ id: string; name: string } | null>(null);
  const [thread, setThread] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [aiTurns, setAiTurns] = useState<Turn[]>([]);
  const [aiDraft, setAiDraft] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadPeers = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/messages");
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { peers: Peer[] };
      setPeers(data.peers);
      setListError("");
    } catch {
      setListError(t("chatError"));
    }
  }, [t]);

  useEffect(() => {
    void loadPeers();
  }, [loadPeers]);

  // Poll the open thread so replies arrive live
  useEffect(() => {
    if (!activePeer) return;
    let stop = false;
    const pull = async () => {
      try {
        const res = await fetch(`/api/chat/messages?peer=${encodeURIComponent(activePeer.id)}`);
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { messages: Msg[] };
        if (!stop) setThread(data.messages);
      } catch {
        /* keep polling */
      }
    };
    void pull();
    const timer = setInterval(pull, 5000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [activePeer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [thread.length, aiTurns.length]);

  async function sendMsg() {
    if (!activePeer || !draft.trim() || sending) return;
    const body = draft.trim().slice(0, 1000);
    setDraft("");
    setSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: activePeer.id, body }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { message: Msg };
      setThread((prev) => [...prev, data.message]);
    } catch {
      toast.error(t("chatError"));
    } finally {
      setSending(false);
    }
  }

  async function sendAi() {
    const text = aiDraft.trim();
    if (!text || aiBusy) return;
    setAiDraft("");
    const history = [...aiTurns, { role: "user" as const, content: text.slice(0, 2000) }];
    setAiTurns(history);
    setAiBusy(true);
    try {
      const res = await fetch(`/api/chat/support?locale=${locale}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.filter((m) => m.content).slice(-10) }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { reply: string };
      setAiTurns((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setAiTurns((prev) => [...prev, { role: "assistant", content: t("chatError") }]);
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-enter mx-auto max-w-2xl px-4 py-8 pb-24 sm:pb-12">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-primarysoft text-3xl shadow-sm">
            💬
          </div>
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>

        <BrandAccent height="sm" className="mb-6" />

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-surface p-1.5">
          <button
            type="button"
            onClick={() => {
              setTab("people");
              setActivePeer(null);
            }}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              tab === "people" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            👥 {t("tabPeople")}
          </button>
          <button
            type="button"
            onClick={() => setTab("ai")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              tab === "ai" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            🤖 {t("tabAI")}
          </button>
        </div>

        {tab === "people" ? (
          activePeer ? (
            <div className="flex h-[62vh] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
                <button
                  type="button"
                  onClick={() => setActivePeer(null)}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-surface2 hover:text-ink"
                >
                  {isUr ? "→" : "←"} {t("backToList")}
                </button>
                <span className="truncate text-sm font-bold text-ink">{activePeer.name}</span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {thread.map((m) => {
                  const mine = m.fromId !== activePeer.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                          mine ? "bg-primary text-white" : "bg-surface2 text-ink"
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })}
                {thread.length === 0 ? (
                  <p className="pt-6 text-center text-sm text-muted">{t("noMessagesYet")}</p>
                ) : null}
                <div ref={bottomRef} />
              </div>
              <div className="flex gap-2 border-t border-line p-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMsg();
                    }
                  }}
                  placeholder={t("typeMessage")}
                  maxLength={1000}
                  className="h-11 flex-1 rounded-xl border border-line bg-canvas px-3.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
                <Button onClick={() => void sendMsg()} disabled={sending || !draft.trim()}>
                  {t("send")}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {listError ? (
                <div className="rounded-2xl border border-line bg-surface p-4 text-center text-sm text-muted">
                  {listError}{" "}
                  <button type="button" onClick={() => void loadPeers()} className="font-semibold text-primary underline">
                    {isUr ? "دوبارہ کوشش" : "Retry"}
                  </button>
                </div>
              ) : peers === null ? (
                <div className="flex justify-center py-10">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
                </div>
              ) : peers.length === 0 ? (
                <div className="rounded-2xl border border-line bg-surface p-8 text-center">
                  <div className="mb-2 text-4xl">📭</div>
                  <p className="font-semibold text-ink">{t("noChats")}</p>
                  <p className="mt-1 text-sm text-muted">{t("noChatsDesc")}</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {peers.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setActivePeer({ id: p.id, name: p.name })}
                        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-start shadow-sm transition hover:border-primary/30 hover:shadow-md motion-safe:hover:-translate-y-0.5"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accentsoft text-lg font-bold text-ink">
                          {p.name?.trim()?.charAt(0)?.toUpperCase() ?? "?"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate font-semibold text-ink">{p.name}</span>
                            {p.unread > 0 ? (
                              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                                {p.unread}
                              </span>
                            ) : null}
                          </span>
                          <span className="block truncate text-sm text-muted">{p.last}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        ) : (
          <div className="flex h-[62vh] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl bg-surface2 px-3.5 py-2 text-sm leading-relaxed text-ink">
                  🤖 {t("aiHello")}
                </div>
              </div>
              {aiTurns.map((turn, i) => (
                <div key={i} className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                      turn.role === "user" ? "bg-primary text-white" : "bg-surface2 text-ink"
                    }`}
                  >
                    {turn.content}
                  </div>
                </div>
              ))}
              {aiBusy ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-surface2 px-3.5 py-2 text-sm text-muted">{t("thinking")}</div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2 border-t border-line p-3">
              <input
                value={aiDraft}
                onChange={(e) => setAiDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendAi();
                  }
                }}
                placeholder={t("aiPlaceholder")}
                maxLength={2000}
                className="h-11 flex-1 rounded-xl border border-line bg-canvas px-3.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
              <Button onClick={() => void sendAi()} disabled={aiBusy || !aiDraft.trim()}>
                {t("send")}
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
