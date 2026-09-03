import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * GET /api/worker/profiles
 * Lists every profession profile for the authenticated worker.
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profiles = await db.workerProfile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    const parsed = profiles.map((p) => ({
      ...p,
      skills: JSON.parse(p.skills || "[]"),
      availableDays: JSON.parse(p.availableDays || "[]"),
    }));

    return NextResponse.json({ profiles: parsed }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}
