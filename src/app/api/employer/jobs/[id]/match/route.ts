import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { findMatchingProfessionals } from "@/lib/matching";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/employer/jobs/[id]/match
 * Re-runs matching for an OPEN job, creating offers for new matches.
 */
export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await db.job.findFirst({
      where: { id, employerId: user.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "OPEN" && job.status !== "OFFERS_SENT") {
      return NextResponse.json(
        { error: "Matching only available for open jobs" },
        { status: 400 }
      );
    }

    // Get existing offer worker IDs to exclude
    const existingOffers = await db.jobOffer.findMany({
      where: { jobId: id },
      select: { workerId: true },
    });
    const excludeIds = [
      user.id,
      ...existingOffers.map((o) => o.workerId),
    ];

    const matches = await findMatchingProfessionals(
      {
        workerType: job.workerType,
        requiredSkills: job.requiredSkills,
        wage: job.wage,
        locationLat: job.locationLat,
        locationLng: job.locationLng,
        locationName: job.locationName,
      },
      excludeIds
    );

    // Create new offers
    if (matches.length > 0) {
      const offerData = matches.map((m) => ({
        jobId: id,
        workerId: m.userId,
        status: "PENDING" as const,
        matchScore: m.matchScore,
      }));
      await db.jobOffer.createMany({ data: offerData });

      await db.job.update({
        where: { id },
        data: { status: "OFFERS_SENT" },
      });
    }

    return NextResponse.json(
      { matches, noMatches: matches.length === 0 },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to run matching" },
      { status: 500 }
    );
  }
}
