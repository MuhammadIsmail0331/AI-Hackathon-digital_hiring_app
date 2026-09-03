import { NextResponse } from "next/server";
import { resolveAdminUser } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * GET /api/admin/issues
 * List ALL issue reports (admin only) with user info.
 */
export async function GET(request: Request) {
  try {
    const admin = await resolveAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    const issues = await db.issueReport.findMany({
      where: status && status !== "all" ? { status } : {},
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ issues }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/issues
 * Update issue status and/or add an admin response.
 * Body: { issueId: string, status?: string, adminResponse?: string }
 */
export async function PATCH(request: Request) {
  try {
    const admin = await resolveAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = (await request.json()) as {
      issueId: string;
      status?: string;
      adminResponse?: string;
    };

    if (!body.issueId) {
      return NextResponse.json({ error: "issueId is required" }, { status: 400 });
    }

    const data: Record<string, string> = {};
    if (body.status) data.status = body.status;
    if (body.adminResponse !== undefined) data.adminResponse = body.adminResponse;

    const issue = await db.issueReport.update({
      where: { id: body.issueId },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ issue }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 });
  }
}
