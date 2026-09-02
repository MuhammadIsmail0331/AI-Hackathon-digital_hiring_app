import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

const PAKISTANI_PHONE = /^(\+92|0)?3\d{9}$/;

/**
 * GET /api/employer/profile
 * Fetches the employer's basic account information and job statistics.
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "EMPLOYER") {
      return NextResponse.json(
        { error: "Employers only" },
        { status: 403 }
      );
    }

    const account = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const [totalJobs, activeJobs, completedJobs] = await Promise.all([
      db.job.count({ where: { employerId: user.id } }),
      db.job.count({
        where: {
          employerId: user.id,
          status: { in: ["OPEN", "MATCHING", "OFFERS_SENT", "IN_PROGRESS"] },
        },
      }),
      db.job.count({ where: { employerId: user.id, status: "COMPLETED" } }),
    ]);

    return NextResponse.json(
      {
        profile: {
          ...account,
          stats: { totalJobs, activeJobs, completedJobs },
        },
      },
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
 * PUT /api/employer/profile
 * Updates the employer's basic account information (name and phone).
 * Email is the login identifier and cannot be changed here.
 */
export async function PUT(request: Request) {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "EMPLOYER") {
      return NextResponse.json(
        { error: "Employers only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    if (!PAKISTANI_PHONE.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid Pakistani phone number" },
        { status: 400 }
      );
    }

    // Phone must remain unique across all users
    const phoneTaken = await db.user.findFirst({
      where: { phone, id: { not: user.id } },
      select: { id: true },
    });
    if (phoneTaken) {
      return NextResponse.json(
        { error: "This phone number is already registered to another account" },
        { status: 400 }
      );
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });

    return NextResponse.json(
      { profile: updated, message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
