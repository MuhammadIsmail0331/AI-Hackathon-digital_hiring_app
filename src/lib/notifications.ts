import { db } from "@/lib/db";

export type NotificationType =
  | "JOB_OFFER"
  | "JOB_ACCEPTED"
  | "JOB_DECLINED"
  | "JOB_COMPLETED"
  | "NEW_JOB_MATCH"
  | "REMINDER"
  | "FEEDBACK_REQUEST"
  | "SYSTEM";

interface NotificationData {
  jobId?: string;
  offerId?: string;
  fromUserName?: string;
  fromUserId?: string;
  [key: string]: unknown;
}

/**
 * Creates an in-app notification for a user.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data: NotificationData = {}
): Promise<void> {
  try {
    await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: JSON.stringify(data),
      },
    });
  } catch {
    // Silently fail - notifications are non-critical
  }
}

/**
 * Creates notifications for multiple users at once.
 */
export async function createBulkNotifications(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  data: NotificationData = {}
): Promise<void> {
  try {
    const records = userIds.map((userId) => ({
      userId,
      type,
      title,
      message,
      data: JSON.stringify(data),
    }));
    await db.notification.createMany({ data: records });
  } catch {
    // Silently fail
  }
}
