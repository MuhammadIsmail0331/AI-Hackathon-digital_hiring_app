import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { profileSchema } from "@/lib/validation/profile.schemas";
import { MAX_PROFILES_PER_WORKER } from "@/lib/constants";

function parseProfile(p: {
  id: string;
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
}) {
  return {
    ...p,
    skills: JSON.parse(p.skills || "[]"),
    availableDays: JSON.parse(p.availableDays || "[]"),
  };
}

/**
 * GET /api/worker/profile
 * Returns all professions for the authenticated worker.
 * Backward compatible: `profile` = primary (first) profile.
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profiles = await db.workerProfile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    const parsed = profiles.map(parseProfile);
    return NextResponse.json(
      { profile: parsed[0] ?? null, profiles: parsed },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/worker/profile
 * Creates or updates ONE profession profile (identified by userId + workerType).
 * Dual-mode: any authenticated user may hold worker profiles.
 */
export async function PUT(request: Request) {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Resolve "Other" free-text values into normalized stored values
    let workerType = data.workerType;
    if (workerType === "other") {
      const custom = data.customWorkerType
        ? data.customWorkerType.trim().replace(/\s+/g, " ").toLowerCase()
        : "";
      if (custom.length < 2) {
        return NextResponse.json(
          { error: "Please specify your profession" },
          { status: 400 }
        );
      }
      workerType = custom;
    }

    let locationName = data.locationName;
    if (locationName === "other_city") {
      const custom = data.customCity
        ? data.customCity.trim().replace(/\s+/g, " ").toLowerCase()
        : "";
      if (custom.length < 2) {
        return NextResponse.json(
          { error: "Please type your city name" },
          { status: 400 }
        );
      }
      locationName = custom;
    }

    const existing = await db.workerProfile.findFirst({
      where: { userId: user.id, workerType },
    });

    const count = await db.workerProfile.count({ where: { userId: user.id } });
    if (!existing && count >= MAX_PROFILES_PER_WORKER) {
      return NextResponse.json(
        { error: `You can add up to ${MAX_PROFILES_PER_WORKER} professions` },
        { status: 400 }
      );
    }

    const profileData = {
      workerType,
      skills: JSON.stringify(data.skills),
      experience: data.experience,
      locationName,
      locationLat:
        data.locationLat === undefined
          ? (existing?.locationLat ?? null)
          : data.locationLat,
      locationLng:
        data.locationLng === undefined
          ? (existing?.locationLng ?? null)
          : data.locationLng,
      expectedWage: data.expectedWage,
      isAvailable: data.isAvailable,
      availableDays: JSON.stringify(data.availableDays),
      bio: data.bio || null,
    };

    const profile = existing
      ? await db.workerProfile.update({
          where: { id: existing.id },
          data: profileData,
        })
      : await db.workerProfile.create({
          data: { userId: user.id, ...profileData },
        });

    return NextResponse.json(
      { profile, message: "Profile saved successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
