import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { jobSchema } from "@/lib/validation/job.schemas";
import { findMatchingProfessionals } from "@/lib/matching";
import { CITY_COORDINATES } from "@/lib/constants";
import { createBulkNotifications } from "@/lib/notifications";
import type { CityId } from "@/lib/constants";

/**
 * GET /api/employer/jobs
 * Lists all jobs created by the authenticated employer.
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Employers only" }, { status: 403 });
    }

    const jobs = await db.job.findMany({
      where: { employerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        offers: {
          select: { id: true, status: true },
        },
      },
    });

    // Parse JSON fields and add offer counts
    const parsed = jobs.map((job) => ({
      ...job,
      requiredSkills: JSON.parse(job.requiredSkills || "[]"),
      toolsRequired: JSON.parse(job.toolsRequired || "[]"),
      offerCounts: {
        total: job.offers.length,
        pending: job.offers.filter((o) => o.status === "PENDING").length,
        accepted: job.offers.filter((o) => o.status === "ACCEPTED").length,
        declined: job.offers.filter((o) => o.status === "DECLINED").length,
      },
    }));

    return NextResponse.json({ jobs: parsed }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/employer/jobs
 * Creates a new job and auto-triggers matching.
 */
export async function POST(request: Request) {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Employers only" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = jobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Validate date is not in the past
    const jobDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (jobDate < today) {
      return NextResponse.json(
        { error: "Job date cannot be in the past" },
        { status: 400 }
      );
    }

    // Resolve fallback coordinates from city if GPS not provided
    let lat = data.locationLat ?? null;
    let lng = data.locationLng ?? null;
    if ((lat == null || lng == null) && data.locationName) {
      const coords = CITY_COORDINATES[data.locationName as CityId];
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
    }

    // Create job
    const job = await db.job.create({
      data: {
        employerId: user.id,
        title: data.title,
        description: data.description || null,
        workerType: data.workerType,
        requiredSkills: JSON.stringify(data.requiredSkills),
        numberOfWorkers: data.numberOfWorkers,
        date: jobDate,
        startTimeHour: data.startTimeHour,
        startTimeMinute: data.startTimeMinute,
        startTimePeriod: data.startTimePeriod,
        endTimeHour: data.endTimeHour,
        endTimeMinute: data.endTimeMinute,
        endTimePeriod: data.endTimePeriod,
        wage: data.wage,
        toolsRequired: JSON.stringify(data.toolsRequired),
        locationLat: lat,
        locationLng: lng,
        locationName: data.locationName,
        status: "OPEN",
      },
    });

    // Auto-trigger matching
    const excludeIds = [user.id];
    const matches = await findMatchingProfessionals(
      {
        workerType: job.workerType,
        requiredSkills: job.requiredSkills,
        wage: job.wage,
        locationLat: lat,
        locationLng: lng,
        locationName: job.locationName,
      },
      excludeIds
    );

    // Create JobOffer records for matched professionals
    if (matches.length > 0) {
      const offerData = matches.map((m) => ({
        jobId: job.id,
        workerId: m.userId,
        status: "PENDING" as const,
        matchScore: m.matchScore,
      }));
      await db.jobOffer.createMany({ data: offerData });

      // Update job status
      await db.job.update({
        where: { id: job.id },
        data: { status: "OFFERS_SENT" },
      });

      // Notify matched workers about new job offers
      await createBulkNotifications(
        matches.map((m) => m.userId),
        "JOB_OFFER",
        "New Job Offer",
        `${user.name} has posted a job: "${job.title}". Check your offers!`,
        { jobId: job.id, fromUserId: user.id, fromUserName: user.name }
      );
    }

    return NextResponse.json(
      {
        job: {
          ...job,
          requiredSkills: JSON.parse(job.requiredSkills || "[]"),
          toolsRequired: JSON.parse(job.toolsRequired || "[]"),
        },
        matches,
        noMatches: matches.length === 0,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
