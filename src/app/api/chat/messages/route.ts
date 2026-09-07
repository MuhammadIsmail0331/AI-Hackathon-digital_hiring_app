import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

/** GET /api/chat/messages            → my conversation list (peers + last message + unread count)
 *  GET /api/chat/messages?peer=<id>  → full thread with that peer (marks their msgs read)
 *  POST { to, body }                 → send a direct message                                  */
export async function GET(req: Request) {
  const user = await resolveSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const peer = new URL(req.url).searchParams.get("peer");

  if (!peer) {
    const recent = await db.chatMessage.findMany({
      where: { OR: [{ fromId: user.id }, { toId: user.id }] },
      orderBy: { createdAt: "desc" },
      take: 300,
    });
    const peers = new Map<string, { id: string; last: string; at: Date; unread: number }>();
    for (const m of recent) {
      const other = m.fromId === user.id ? m.toId : m.fromId;
      const e = peers.get(other);
      const unread = m.toId === user.id && !m.readAt ? 1 : 0;
      if (!e) peers.set(other, { id: other, last: m.body, at: m.createdAt, unread });
      else e.unread += unread;
    }
    const users = await db.user.findMany({
      where: { id: { in: [...peers.keys()] } },
      select: { id: true, name: true, role: true },
    });
    const nameOf = new Map(users.map((u) => [u.id, u.name]));
    return NextResponse.json({
      peers: [...peers.values()]
        .map((p) => ({ ...p, name: nameOf.get(p.id) || "User" }))
        .sort((a, b) => +b.at - +a.at),
    });
  }

  const messages = await db.chatMessage.findMany({
    where: { OR: [{ fromId: user.id, toId: peer }, { fromId: peer, toId: user.id }] },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  await db.chatMessage.updateMany({
    where: { fromId: peer, toId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  const other = await db.user.findUnique({ where: { id: peer }, select: { name: true } });
  return NextResponse.json({ peerName: other?.name ?? "User", messages });
}

export async function POST(req: Request) {
  const user = await resolveSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const to = typeof body?.to === "string" ? body.to : "";
  const text = typeof body?.body === "string" ? body.body.trim().slice(0, 1000) : "";

  if (!to || !text) return NextResponse.json({ error: "to and body required" }, { status: 400 });
  if (to === user.id) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

  const target = await db.user.findUnique({ where: { id: to }, select: { id: true, isBlocked: true } });
  if (!target || target.isBlocked) return NextResponse.json({ error: "User unavailable" }, { status: 404 });

  const message = await db.chatMessage.create({ data: { fromId: user.id, toId: to, body: text } });
  return NextResponse.json({ ok: true, message });
}