import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * GET /api/worker/jobs
 * Browse open jobs available to workers.
 * Query params:
 *   - workerType?: string (filter by category)
 *   - city?: string (filter by location)
 *   - search?: string (search title/description)
 *   - page?: number (default 1)
 *   - limit?: number (default 20)
 *
 * Excludes jobs where the worker already has an offer.
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
    const search = url.searchParams.get("search");
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      status: { in: ["OPEN", "OFFERS_SENT"] },
    };

    if (workerType) {
      where.workerType = workerType;
    }

    if (city) {
      where.locationName = city;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Get jobs with employer info and offer status for this worker
    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        orderBy: [{ boosted: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        include: {
          employer: {
            select: { id: true, name: true },
          },
          offers: {
            where: { workerId: user.id },
            select: { id: true, status: true },
          },
        },
      }),
      db.job.count({ where }),
    ]);

    // Check if worker has a profile for skill matching
    const profile = await db.workerProfile.findFirst({
      where: { userId: user.id },
      select: { workerType: true, skills: true },
    });

    const workerSkills: string[] = profile
      ? JSON.parse(profile.skills || "[]")
      : [];

    // Enrich jobs with match info and offer status
    const enrichedJobs = jobs.map((job) => {
      const requiredSkills: string[] = JSON.parse(job.requiredSkills || "[]");
      const toolsRequired: string[] = JSON.parse(job.toolsRequired || "[]");
      const matchingSkills = workerSkills.filter((s) =>
        requiredSkills.includes(s)
      );
      const hasOffer = job.offers.length > 0;
      const offerStatus = hasOffer ? job.offers[0].status : null;

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        workerType: job.workerType,
        requiredSkills,
        toolsRequired,
        numberOfWorkers: job.numberOfWorkers,
        date: job.date,
        startTimeHour: job.startTimeHour,
        startTimeMinute: job.startTimeMinute,
        startTimePeriod: job.startTimePeriod,
        endTimeHour: job.endTimeHour,
        endTimeMinute: job.endTimeMinute,
        endTimePeriod: job.endTimePeriod,
        wage: job.wage,
        locationName: job.locationName,
        status: job.status,
        employer: job.employer,
        acceptedCount: undefined, // Not exposed to workers
        hasOffer,
        offerStatus,
        matchingSkills: matchingSkills.length,
        totalRequiredSkills: requiredSkills.length,
        createdAt: job.createdAt,
      };
    });

    return NextResponse.json({
      jobs: enrichedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
