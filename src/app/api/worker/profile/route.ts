import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { profileSchema } from "@/lib/validation/profile.schemas";

/**
 * GET /api/worker/profile
 * Fetches the authenticated worker's profile.
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.workerProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    // Parse JSON fields
    const parsed = {
      ...profile,
      skills: JSON.parse(profile.skills || "[]"),
      availableDays: JSON.parse(profile.availableDays || "[]"),
    };

    return NextResponse.json({ profile: parsed }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/worker/profile
 * Creates or updates the authenticated worker's profile.
 */
export async function PUT(request: Request) {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a worker
    if (user.role !== "WORKER") {
      return NextResponse.json({ error: "Only workers can create profiles" }, { status: 403 });
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

    // Upsert worker profile
    const profile = await db.workerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        workerType: data.workerType,
        skills: JSON.stringify(data.skills),
        experience: data.experience,
        locationName: data.locationName,
        expectedWage: data.expectedWage,
        isAvailable: data.isAvailable,
        availableDays: JSON.stringify(data.availableDays),
        bio: data.bio || null,
      },
      update: {
        workerType: data.workerType,
        skills: JSON.stringify(data.skills),
        experience: data.experience,
        locationName: data.locationName,
        expectedWage: data.expectedWage,
        isAvailable: data.isAvailable,
        availableDays: JSON.stringify(data.availableDays),
        bio: data.bio || null,
      },
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
