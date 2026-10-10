import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ workerId: string }>;
}

function parseProfile(p: {
  workerType: string;
  skills: string;
  experience: number;
  locationName: string | null;
  expectedWage: number;
  isAvailable: boolean;
  availableDays: string;
  bio: string | null;
  avgRating: number;
  totalJobs: number;
  portfolioJson: string | null;
}) {
  let images: string[] = [];
  try {
    const v = p.portfolioJson ? JSON.parse(p.portfolioJson) : [];
    if (Array.isArray(v)) images = v.filter((x) => typeof x === "string").slice(0, 6);
  } catch {
    images = [];
  }
  return {
    workerType: p.workerType,
    skills: JSON.parse(p.skills || "[]"),
    experience: p.experience,
    locationName: p.locationName,
    expectedWage: p.expectedWage,
    isAvailable: p.isAvailable,
    availableDays: JSON.parse(p.availableDays || "[]"),
    bio: p.bio,
    avgRating: p.avgRating,
    totalJobs: p.totalJobs,
    images,
  };
}

/**
 * GET /api/employer/workers/[workerId]
 * Full public profile of a worker for the Find Professionals detail view.
 * Contact info (phone/email) is NOT included - it is only shared after
 * the worker accepts an offer.
 */
export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workerId } = await params;

    const worker = await db.user.findFirst({
      where: { id: workerId, isBlocked: false },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        workerProfiles: {
          orderBy: { createdAt: "asc" as const },
        },
      },
    });

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        worker: {
          id: worker.id,
          name: worker.name,
          avatarUrl: worker.avatarUrl,
          memberSince: worker.createdAt,
          profiles: worker.workerProfiles.map((p) =>
            parseProfile({
              workerType: p.workerType,
              skills: p.skills,
              experience: p.experience,
              locationName: p.locationName,
              expectedWage: p.expectedWage,
              isAvailable: p.isAvailable,
              availableDays: p.availableDays,
              bio: p.bio,
              avgRating: p.avgRating,
              totalJobs: p.totalJobs,
              portfolioJson: p.portfolioJson,
            })
          ),
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch worker profile" },
      { status: 500 }
    );
  }
}
