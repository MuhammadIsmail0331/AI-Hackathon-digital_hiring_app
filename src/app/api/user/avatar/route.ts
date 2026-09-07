import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

const MAX_CHARS = 500_000; // ~370 KB JPEG data URL

/** POST /api/user/avatar — set or clear the signed-in user's profile photo. */
export async function POST(req: Request) {
  const user = await resolveSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const url = typeof body?.avatarUrl === "string" ? body.avatarUrl : "";

  if (url && (!url.startsWith("data:image/") || url.length > MAX_CHARS)) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  }

  await db.user.update({ where: { id: user.id }, data: { avatarUrl: url || null } });
  return NextResponse.json({ ok: true, avatarUrl: url || null });
}