import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * GET /api/employer/workers
 * Find Professionals search: browse worker profiles with filters.
 * Params: workerType?, city?, minRating?, q? (name contains)
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
    const minRating = parseFloat(url.searchParams.get("minRating") || "0");
    const q = url.searchParams.get("q");

    const profiles = await db.workerProfile.findMany({
      where: {
        isAvailable: true,
        ...(workerType && workerType !== "all" ? { workerType } : {}),
        ...(city && city !== "all" ? { locationName: city } : {}),
        ...(minRating > 0 ? { avgRating: { gte: minRating } } : {}),
        ...(q ? { user: { name: { contains: q } } } : {}),
      },
      include: {
        user: { select: { id: true, name: true, isBlocked: true } },
      },
      orderBy: [{ avgRating: "desc" }, { totalJobs: "desc" }],
      take: 40,
    });

    const results = profiles
      .filter((p) => !p.user.isBlocked && p.user.id !== user.id)
      .map((p) => ({
        userId: p.user.id,
        name: p.user.name,
        workerType: p.workerType,
        skills: JSON.parse(p.skills || "[]"),
        experience: p.experience,
        expectedWage: p.expectedWage,
        avgRating: p.avgRating,
        totalJobs: p.totalJobs,
        locationName: p.locationName,
        isAvailable: p.isAvailable,
      }));

    return NextResponse.json({ workers: results }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to search workers" },
      { status: 500 }
    );
  }
}
