import { db } from "@/lib/db";
import { CITY_COORDINATES } from "@/lib/constants";
import { getSearchRadiusKm } from "@/lib/system-config";
import type { CityId } from "@/lib/constants";

export interface JobData {
  workerType: string;
  requiredSkills: string; // JSON string
  wage: number;
  locationLat: number | null;
  locationLng: number | null;
  locationName: string | null;
  date?: Date | string;
}

export interface MatchResult {
  userId: string;
  name: string;
  workerType: string;
  skills: string[];
  experience: number;
  expectedWage: number;
  avgRating: number;
  totalJobs: number;
  locationName: string | null;
  matchScore: number;
  /** Human-readable match explanation. */
  reason: string;
}

/**
 * Haversine formula: returns distance in km between two lat/lng points.
 */
function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Resolves lat/lng for a given location.
 * Prefers explicit GPS coords; falls back to city-center from CITY_COORDINATES.
 */
function resolveCoords(
  lat: number | null | undefined,
  lng: number | null | undefined,
  cityName: string | null
): { lat: number; lng: number } | null {
  if (lat != null && lng != null) return { lat, lng };
  if (cityName && cityName in CITY_COORDINATES) {
    return CITY_COORDINATES[cityName as CityId];
  }
  return null;
}

/**
 * Finds matching professionals for a job.
 * - Uses actual GPS coordinates with city-center fallback
 * - Reads search radius from SystemConfig (admin-tunable)
 * - Excludes employer's own user ID (self-exclusion)
 * - Excludes workers who already have an offer for this job (no duplicates)
 * - Returns sorted by match score descending
 */
export async function findMatchingProfessionals(
  job: JobData,
  excludeIds: string[]
): Promise<MatchResult[]> {
  const radiusKm = await getSearchRadiusKm();
  const jobCoords = resolveCoords(
    job.locationLat,
    job.locationLng,
    job.locationName
  );

  const requiredSkills: string[] = JSON.parse(job.requiredSkills || "[]");

  // Query all available workers of the matching type
  const workers = await db.workerProfile.findMany({
    where: {
      workerType: job.workerType,
      isAvailable: true,
      userId: { notIn: excludeIds.length > 0 ? excludeIds : undefined },
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  const results: MatchResult[] = [];

  for (const w of workers) {
    const workerSkills: string[] = JSON.parse(w.skills || "[]");
    const workerCoords = resolveCoords(
      w.locationLat,
      w.locationLng,
      w.locationName
    );

    // Distance check
    if (jobCoords && workerCoords) {
      const distance = haversineKm(
        jobCoords.lat, jobCoords.lng,
        workerCoords.lat, workerCoords.lng
      );
      if (distance > radiusKm) continue;
    }

    // Skill overlap score (0-40)
    const matchingSkills = workerSkills.filter((s) =>
      requiredSkills.includes(s)
    );
    if (matchingSkills.length === 0 && requiredSkills.length > 0) continue;
    const skillScore =
      requiredSkills.length > 0
        ? (matchingSkills.length / requiredSkills.length) * 40
        : 20;

    // Wage compatibility score (0-20)
    let wageScore = 20;
    if (w.expectedWage > 0 && job.wage > 0) {
      const ratio = job.wage / w.expectedWage;
      if (ratio >= 1) wageScore = 20;
      else if (ratio >= 0.8) wageScore = 15;
      else if (ratio >= 0.6) wageScore = 10;
      else wageScore = 5;
    }

    // Experience score (0-10)
    const expScore = Math.min(w.experience / 10, 1) * 10;

    // Rating score (0-10)
    const ratingScore = (w.avgRating / 5) * 10;

    // Availability score (0-20)
    const availScore = w.isAvailable ? 20 : 0;

    const totalScore = Math.round(
      skillScore + wageScore + expScore + ratingScore + availScore
    );

    const skillPct =
      requiredSkills.length > 0
        ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
        : 100;
    const distKm =
      jobCoords && workerCoords
        ? haversineKm(jobCoords.lat, jobCoords.lng, workerCoords.lat, workerCoords.lng)
        : null;

    results.push({
      userId: w.user.id,
      name: w.user.name,
      workerType: w.workerType,
      skills: workerSkills,
      experience: w.experience,
      expectedWage: w.expectedWage,
      avgRating: w.avgRating,
      totalJobs: w.totalJobs,
      locationName: w.locationName,
      matchScore: totalScore,
      reason: JSON.stringify({
        skillPct,
        distKm: distKm != null ? Math.round(distKm * 10) / 10 : null,
        wageOk: job.wage >= w.expectedWage,
      }),
    });
  }

  results.sort(
    (a, b) => b.matchScore - a.matchScore || b.avgRating - a.avgRating
  );

  return results;
}