import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

const MAX_IMG = 500_000; // per-image data-URL cap
const MAX_COUNT = 6; // portfolio photos per profession

function safe(s: string | null): string[] {
  try {
    const v = s ? JSON.parse(s) : [];
    return Array.isArray(v) ? v.slice(0, MAX_COUNT) : [];
  } catch {
    return [];
  }
}

/** GET /api/worker/portfolio — my avatar + portfolio photos for each of my professions. */
export async function GET() {
  const user = await resolveSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profiles = await db.workerProfile.findMany({
    where: { userId: user.id },
    select: { id: true, workerType: true, portfolioJson: true },
    orderBy: { createdAt: "asc" },
  });
  const me = await db.user.findUnique({ where: { id: user.id }, select: { avatarUrl: true } });

  return NextResponse.json({
    avatarUrl: me?.avatarUrl ?? null,
    profiles: profiles.map((p) => ({ id: p.id, workerType: p.workerType, images: safe(p.portfolioJson) })),
  });
}

/** PUT /api/worker/portfolio — replace the photo set of one of MY profession profiles. */
export async function PUT(req: Request) {
  const user = await resolveSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const profileId = typeof body?.profileId === "string" ? body.profileId : "";
  const images: unknown[] = Array.isArray(body?.images) ? body.images : [];

  if (!profileId) return NextResponse.json({ error: "profileId required" }, { status: 400 });
  if (
    images.length > MAX_COUNT ||
    images.some((i) => typeof i !== "string" || !i.startsWith("data:image/") || (i as string).length > MAX_IMG)
  ) {
    return NextResponse.json({ error: "Invalid images" }, { status: 400 });
  }

  const owned = await db.workerProfile.findFirst({ where: { id: profileId, userId: user.id }, select: { id: true } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.workerProfile.update({ where: { id: profileId }, data: { portfolioJson: JSON.stringify(images) } });
  return NextResponse.json({ ok: true, count: images.length });
}