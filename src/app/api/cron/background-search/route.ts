import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { findMatchingProfessionals } from "@/lib/matching";
import { createBulkNotifications } from "@/lib/notifications";

/**
 * POST /api/cron/background-search
 * Processes expired background searches: re-runs matching and notifies new candidates.
 *
 * In production, call this endpoint from a cron service (e.g. Vercel Cron,
 * cron-job.org, or GitHub Actions) every 10-15 minutes.
 *
 * Secured by CRON_SECRET env var. Pass as Authorization: Bearer <CRON_SECRET>.
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret (skip in dev)
    if (process.env.NODE_ENV === "production") {
      const auth = request.headers.get("authorization");
      const secret = process.env.CRON_SECRET;
      if (!secret || auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Find jobs with active background searches that haven't expired yet,
    // OR jobs whose background search has expired (needs processing)
    const jobsWithActiveSearch = await db.job.findMany({
      where: {
        status: { in: ["OPEN"] },
        backgroundSearchUntil: { not: null },
      },
      include: {
        employer: { select: { id: true, name: true } },
        offers: { select: { workerId: true } },
      },
    });

    let processedCount = 0;
    let newMatchesCount = 0;
    const expiredJobs: string[] = [];

    for (const job of jobsWithActiveSearch) {
      const isExpired =
        job.backgroundSearchUntil &&
        new Date() > job.backgroundSearchUntil;

      // Re-run matching
      const excludeIds = [
        job.employerId,
        ...job.offers.map((o) => o.workerId),
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

      // Create offers for new matches
      if (matches.length > 0) {
        const offerData = matches.map((m) => ({
          jobId: job.id,
          workerId: m.userId,
          status: "PENDING" as const,
          matchScore: m.matchScore,
        }));
        await db.jobOffer.createMany({ data: offerData });

        // Notify new matches
        await createBulkNotifications(
          matches.map((m) => m.userId),
          "JOB_OFFER",
          "New Job Offer",
          `${job.employer.name} has posted a job: "${job.title}". Check your offers!`,
          { jobId: job.id, fromUserId: job.employerId, fromUserName: job.employer.name }
        );

        newMatchesCount += matches.length;

        // Update job status if we now have offers
        if (job.status === "OPEN") {
          await db.job.update({
            where: { id: job.id },
            data: { status: "OFFERS_SENT" },
          });
        }
      }

      // If search has expired, stop it
      if (isExpired) {
        expiredJobs.push(job.id);
      }

      processedCount++;
    }

    // Stop expired searches
    if (expiredJobs.length > 0) {
      await db.job.updateMany({
        where: { id: { in: expiredJobs } },
        data: {
          backgroundSearchUntil: null,
          backgroundSearchExtensions: 0,
        },
      });
    }

    return NextResponse.json({
      message: "Background search processed",
      processedJobs: processedCount,
      newMatches: newMatchesCount,
      expiredSearches: expiredJobs.length,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process background search" },
      { status: 500 }
    );
  }
}
