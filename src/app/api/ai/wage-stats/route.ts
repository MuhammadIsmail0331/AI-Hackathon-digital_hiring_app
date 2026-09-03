import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * GET /api/ai/wage-stats?workerType=electrician&city=lahore
 * Data-driven wage suggestion from real platform history.
 * Returns { min, max, avg, count } so the UI can say:
 * "Electricians in Lahore typically earn PKR 2,200-3,500/day".
 */
export async function GET(request: Request) {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const workerType = url.searchParams.get("workerType");
    const city = url.searchParams.get("city");
    if (!workerType) {
      return NextResponse.json({ error: "workerType is required" }, { status: 400 });
    }

    const jobs = await db.job.findMany({
      where: {
        workerType,
        status: { in: ["OPEN", "MATCHING", "OFFERS_SENT", "IN_PROGRESS", "COMPLETED"] },
        ...(city && city !== "other_city" ? { locationName: city } : {}),
      },
      select: { wage: true },
    });

    if (jobs.length === 0) {
      return NextResponse.json({ min: null, max: null, avg: null, count: 0 });
    }

    const wages = jobs.map((j) => j.wage).sort((a, b) => a - b);
    const min = wages[0];
    const max = wages[wages.length - 1];
    const avg = Math.round(wages.reduce((s, w) => s + w, 0) / wages.length);

    return NextResponse.json({ min, max, avg, count: wages.length });
  } catch {
    return NextResponse.json(
      { error: "Failed to compute wage stats" },
      { status: 500 }
    );
  }
}
