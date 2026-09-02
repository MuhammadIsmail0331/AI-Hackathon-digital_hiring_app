import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * GET /api/notifications
 * Lists notifications for the authenticated user.
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await db.notification.count({
      where: { userId: user.id, read: false },
    });

    const parsed = notifications.map((n) => ({
      ...n,
      data: JSON.parse(n.data || "{}"),
    }));

    return NextResponse.json({ notifications: parsed, unreadCount }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

/**
 * PUT /api/notifications
 * Mark notifications as read.
 * Body: { ids?: string[], all?: boolean }
 */
export async function PUT(request: Request) {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (body.all) {
      await db.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
    } else if (body.ids && Array.isArray(body.ids)) {
      await db.notification.updateMany({
        where: { id: { in: body.ids }, userId: user.id },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
