import { z } from "zod";
import { WORKER_CATEGORIES, PAKISTAN_CITIES } from "@/lib/constants";

const categoryIds = WORKER_CATEGORIES.map((c) => c.id) as [string, ...string[]];
const cityIds = PAKISTAN_CITIES.map((c) => c.id) as [string, ...string[]];

export const profileSchema = z.object({
  workerType: z.enum(categoryIds, {
    message: "Please select a worker type",
  }),
  skills: z.array(z.string()).min(1, "Please select at least one skill").max(10),
  experience: z.number().int().min(0).max(40),
  locationName: z.enum(cityIds, {
    message: "Please select your city",
  }),
  expectedWage: z.number().int().min(100, "Minimum wage is 100 PKR").max(100000),
  isAvailable: z.boolean(),
  availableDays: z.array(z.string()).min(1, "Please select at least one day"),
  bio: z.string().max(500).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
