import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * GET /api/worker/offers
 * Lists all offers for the authenticated worker.
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const offers = await db.jobOffer.findMany({
      where: { workerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            workerType: true,
            requiredSkills: true,
            numberOfWorkers: true,
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
            employer: { select: { name: true, phone: true } },
          },
        },
      },
    });

    const parsed = offers.map((o) => ({
      id: o.id,
      status: o.status,
      matchScore: o.matchScore,
      matchReason: o.matchReason,
      createdAt: o.createdAt,
      job: {
        ...o.job,
        requiredSkills: JSON.parse(o.job.requiredSkills || "[]"),
        toolsRequired: JSON.parse(o.job.toolsRequired || "[]"),
        // Reveal employer phone only after acceptance
        employerPhone: o.status === "ACCEPTED" ? o.job.employer.phone : null,
      },
    }));

    return NextResponse.json({ offers: parsed }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
