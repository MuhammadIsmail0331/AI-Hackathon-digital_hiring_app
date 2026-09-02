import { db } from "@/lib/db";

/**
 * Reads a system config value by key, returning the provided default if not found.
 * This allows admin-tunable settings without code changes.
 */
export async function getSystemConfig(
  key: string,
  fallback: string
): Promise<string> {
  try {
    const row = await db.systemConfig.findUnique({ where: { key } });
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Returns the current search radius in kilometres.
 * Stored in SystemConfig as key "SEARCH_RADIUS_KM".
 * Falls back to 50 km if the config row is missing.
 */
export async function getSearchRadiusKm(): Promise<number> {
  const value = await getSystemConfig("SEARCH_RADIUS_KM", "50");
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 50;
}
