import { z } from "zod";
import { WORKER_CATEGORIES, PAKISTAN_CITIES } from "@/lib/constants";

/** Strip ASCII control characters (keeps Urdu/emoji intact). */
const stripCtrl = (s: string) => s.replace(/[\u0000-\u001F\u007F]/g, "");

const categoryIds = WORKER_CATEGORIES.map((c) => c.id) as [string, ...string[]];
const cityIds = PAKISTAN_CITIES.map((c) => c.id) as [string, ...string[]];

export const profileSchema = z.object({
  workerType: z.enum(categoryIds, {
    message: "Please select a worker type",
  }),
  /** Free-text profession when workerType === "other" (stored normalized). */
  customWorkerType: z.string().trim().min(2, "Profession must be at least 2 characters").max(40).transform(stripCtrl).optional(),
  skills: z.array(z.string().trim().max(60)).min(1, "Please select at least one skill").max(10),
  experience: z.number().int().min(0).max(40),
  locationName: z.enum(cityIds, {
    message: "Please select your city",
  }),
  /** Free-text city when locationName === "other_city" (stored normalized). */
  customCity: z.string().trim().min(2, "City name must be at least 2 characters").max(40).transform(stripCtrl).optional(),
  /** GPS coordinates captured on the device (used for the 50 km radius check). */
  locationLat: z.number().min(-90).max(90).optional().nullable(),
  locationLng: z.number().min(-180).max(180).optional().nullable(),
  expectedWage: z.number().int().min(100, "Minimum wage is 100 PKR").max(100000),
  isAvailable: z.boolean(),
  availableDays: z.array(z.string()).min(1, "Please select at least one day"),
  bio: z.string().trim().max(500).transform(stripCtrl).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
