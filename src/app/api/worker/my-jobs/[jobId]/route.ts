import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

/**
 * GET /api/worker/my-jobs/[jobId]
 * Returns details of a job the authenticated worker has accepted,
 * including the employer contact (already shared on acceptance)
 * and the simulated payment status.
 */
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "WORKER") {
      return NextResponse.json({ error: "Workers only" }, { status: 403 });
    }

    const { jobId } = await params;

    const offer = await db.jobOffer.findFirst({
      where: { jobId, workerId: user.id, status: "ACCEPTED" },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            workerType: true,
            requiredSkills: true,
            date: true,
            startTimeHour: true,
            startTimeMinute: true,
            startTimePeriod: true,
            endTimeHour: true,
            endTimeMinute: true,
            endTimePeriod: true,
            wage: true,
            toolsRequired: true,
            locationName: true,
            status: true,
            numberOfWorkers: true,
            employer: { select: { id: true, name: true, phone: true } },
            payment: { select: { status: true, totalAmount: true, securedAt: true, releasedAt: true } },
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const acceptedWorkers = await db.jobOffer.count({
      where: { jobId, status: "ACCEPTED" },
    });

    const job = {
      ...offer.job,
      requiredSkills: JSON.parse(offer.job.requiredSkills || "[]"),
      toolsRequired: JSON.parse(offer.job.toolsRequired || "[]"),
      acceptedWorkers,
    };

    return NextResponse.json({ job }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
