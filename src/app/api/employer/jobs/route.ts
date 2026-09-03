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

    // Relevance cap: enough candidates to fill positions quickly without spamming
    const cappedMatches = matches.slice(0, Math.max(10, job.numberOfWorkers * 3));

    // Create JobOffer records for matched professionals
    if (cappedMatches.length > 0) {
      const offerData = cappedMatches.map((m) => ({
        jobId: job.id,
        workerId: m.userId,
        status: "PENDING" as const,
        matchScore: m.matchScore,
        matchReason: m.reason,
      }));
      await db.jobOffer.createMany({ data: offerData });

      // Update job status
      await db.job.update({
        where: { id: job.id },
        data: { status: "OFFERS_SENT" },
      });

      // Notify matched workers about new job offers
      await createBulkNotifications(
        cappedMatches.map((m) => m.userId),
        "JOB_OFFER",
        "New Job Offer",
        `${user.name} has posted a job: "${job.title}". Check your offers!`,
        { jobId: job.id, fromUserId: user.id, fromUserName: user.name }
      );
    }

    // No immediate matches: start the background search right away (best-effort).
    // The Vercel cron stays as a backstop for extending/processing the search.
    if (cappedMatches.length === 0) {
      try {
        await db.job.update({
          where: { id: job.id },
          data: { backgroundSearchUntil: new Date(Date.now() + 60 * 60 * 1000) },
        });
        await fetch(new URL("/api/cron/background-search", request.url), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}`,
          },
        }).catch(() => {});
      } catch {
        // best-effort only
      }
    }

    return NextResponse.json(
      {
        job: {
          ...job,
          requiredSkills: JSON.parse(job.requiredSkills || "[]"),
          toolsRequired: JSON.parse(job.toolsRequired || "[]"),
        },
        matches: cappedMatches,
        totalMatches: matches.length,
        noMatches: cappedMatches.length === 0,
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
