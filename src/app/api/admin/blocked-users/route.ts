import { NextResponse } from "next/server";
import { resolveAdminUser } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * GET /api/admin/blocked-users
 * Lists all blocked users. Requires admin access.
 */
export async function GET() {
  try {
    const admin = await resolveAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }
    const blockedUsers = await db.blockedUser.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      },
      orderBy: { blockedAt: "desc" },
    });

    return NextResponse.json({ blockedUsers }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch blocked users" }, { status: 500 });
  }
}

/**
 * POST /api/admin/blocked-users
 * Block a user. Body: { userId: string, reason?: string }
 */
export async function POST(request: Request) {
  try {
    const admin = await resolveAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { userId, reason } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Prevent self-blocking
    if (userId === admin.id) {
      return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert blocked status
    await db.blockedUser.upsert({
      where: { userId },
      create: { userId, reason: reason || null },
      update: { reason: reason || null },
    });

    // Also set isBlocked on the user record
    await db.user.update({
      where: { id: userId },
      data: { isBlocked: true },
    });

    return NextResponse.json(
      { message: `User ${targetUser.name} has been blocked` },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to block user" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/blocked-users
 * Unblock a user. Body: { userId: string }
 */
export async function DELETE(request: Request) {
  try {
    const admin = await resolveAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await db.blockedUser.deleteMany({ where: { userId } });
    await db.user.update({
      where: { id: userId },
      data: { isBlocked: false },
    });

    return NextResponse.json({ message: "User unblocked" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to unblock user" }, { status: 500 });
  }
}
