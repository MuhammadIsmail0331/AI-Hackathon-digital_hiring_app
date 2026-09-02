import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export interface ResolvedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  isAdmin: boolean;
  phone: string;
}

/**
 * Resolves the current authenticated user from the session JWT.
 *
 * Handles the case where the JWT contains a stale user ID (e.g. after
 * database re-seeding) by falling back to email-based lookup.
 *
 * Returns null if no valid session or user cannot be found in the database.
 */
export async function resolveSessionUser(): Promise<ResolvedUser | null> {
  const session = await auth();
  if (!session?.user) return null;

  const selectFields = {
    id: true,
    name: true,
    email: true,
    role: true,
    isBlocked: true,
    isAdmin: true,
    phone: true,
  } as const;

  // Primary: lookup by JWT user ID
  if (session.user.id) {
    const byId = await db.user.findUnique({
      where: { id: session.user.id },
      select: selectFields,
    });
    if (byId) return byId;
  }

  // Fallback: lookup by email (handles stale JWT after re-seeding)
  if (session.user.email) {
    const byEmail = await db.user.findUnique({
      where: { email: session.user.email },
      select: selectFields,
    });
    if (byEmail) return byEmail;
  }

  return null;
}

/**
 * Resolves the session user and verifies they are an admin.
 * Returns null if not authenticated or not an admin.
 */
export async function resolveAdminUser(): Promise<ResolvedUser | null> {
  const user = await resolveSessionUser();
  if (!user || !user.isAdmin || user.isBlocked) return null;
  return user;
}
