import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * POST /api/issues
 * Submit an issue report. Uses the authenticated user's name and phone.
 * Body: { subject: string, description: string }
 */
export async function POST(request: Request) {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subject, description } = body;

    if (!subject || !description) {
      return NextResponse.json(
        { error: "Subject and description are required" },
        { status: 400 }
      );
    }

    if (description.length > 2000) {
      return NextResponse.json(
        { error: "Description must be under 2000 characters" },
        { status: 400 }
      );
    }

    const report = await db.issueReport.create({
      data: {
        userId: user.id,
        subject: subject.trim(),
        description: description.trim(),
      },
    });

    // In production, send email to support when SMTP is configured
    // For now, just store in database

    return NextResponse.json(
      {
        message: "Issue reported successfully. We will review it shortly.",
        reportId: report.id,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

/**
 * GET /api/issues
 * List the authenticated user's issue reports.
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await db.issueReport.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ reports }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
