import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * Shape returned for each job the worker has accepted.
 */
function toJobCard(offer: {
  id: string;
  job: {
    id: string;
    title: string;
    workerType: string;
    date: Date;
    startTimeHour: number;
    startTimeMinute: number;
    startTimePeriod: string;
    endTimeHour: number;
    endTimeMinute: number;
    endTimePeriod: string;
    wage: number;
    locationName: string | null;
    status: string;
    numberOfWorkers: number;
    employer: { name: string; phone: string };
    payment: { status: string; totalAmount: number } | null;
  };
}) {
  return {
    offerId: offer.id,
    jobId: offer.job.id,
    title: offer.job.title,
    workerType: offer.job.workerType,
    date: offer.job.date,
    startTimeHour: offer.job.startTimeHour,
    startTimeMinute: offer.job.startTimeMinute,
    startTimePeriod: offer.job.startTimePeriod,
    endTimeHour: offer.job.endTimeHour,
    endTimeMinute: offer.job.endTimeMinute,
    endTimePeriod: offer.job.endTimePeriod,
    wage: offer.job.wage,
    locationName: offer.job.locationName,
    jobStatus: offer.job.status,
    numberOfWorkers: offer.job.numberOfWorkers,
    employerName: offer.job.employer.name,
    // Offer is ACCEPTED, so the employer contact is already shared
    employerPhone: offer.job.employer.phone,
    payment: offer.job.payment
      ? { status: offer.job.payment.status, totalAmount: offer.job.payment.totalAmount }
      : null,
  };
}

const JOB_SELECT = {
  id: true,
  title: true,
  workerType: true,
  date: true,
  startTimeHour: true,
  startTimeMinute: true,
  startTimePeriod: true,
  endTimeHour: true,
  endTimeMinute: true,
  endTimePeriod: true,
  wage: true,
  locationName: true,
  status: true,
  numberOfWorkers: true,
  employer: { select: { name: true, phone: true } },
  payment: { select: { status: true, totalAmount: true } },
} as const;

/**
 * GET /api/worker/my-jobs
 * Lists the worker's active and completed jobs with real statistics.
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "WORKER") {
      return NextResponse.json({ error: "Workers only" }, { status: 403 });
    }

    const offers = await db.jobOffer.findMany({
      where: { workerId: user.id, status: "ACCEPTED" },
      orderBy: { updatedAt: "desc" },
      include: { job: { select: JOB_SELECT } },
    });

    // Active: job scheduled or in progress (waiting for remaining workers counts as active)
    const active = offers
      .filter(
        (o) => o.job.status === "OFFERS_SENT" || o.job.status === "IN_PROGRESS"
      )
      .map(toJobCard);

    const completed = offers
      .filter((o) => o.job.status === "COMPLETED")
      .map(toJobCard);

    const profile = await db.workerProfile.findUnique({
      where: { userId: user.id },
      select: { avgRating: true },
    });

    return NextResponse.json(
      {
        active,
        completed,
        stats: {
          activeJobs: active.length,
          completedJobs: completed.length,
          avgRating: profile?.avgRating ?? 0,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
