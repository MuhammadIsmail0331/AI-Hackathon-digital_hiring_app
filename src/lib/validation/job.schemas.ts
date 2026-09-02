import { z } from "zod";
import { WORKER_CATEGORIES, PAKISTAN_CITIES } from "@/lib/constants";

const categoryIds = WORKER_CATEGORIES.map((c) => c.id) as [string, ...string[]];
const cityIds = PAKISTAN_CITIES.map((c) => c.id) as [string, ...string[]];

export const jobSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be 100 characters or less"),
  workerType: z.enum(categoryIds, {
    message: "Please select the type of professional needed",
  }),
  requiredSkills: z
    .array(z.string())
    .min(1, "Please select at least one skill")
    .max(10),
  numberOfWorkers: z
    .number()
    .int()
    .min(1, "At least 1 person needed")
    .max(50, "Maximum 50 people"),
  date: z.string().min(1, "Please select a job date"),
  startTimeHour: z.number().int().min(1).max(12),
  startTimeMinute: z.number().int(),
  startTimePeriod: z.enum(["AM", "PM"]),
  endTimeHour: z.number().int().min(1).max(12),
  endTimeMinute: z.number().int(),
  endTimePeriod: z.enum(["AM", "PM"]),
  wage: z
    .number()
    .int()
    .min(100, "Minimum wage is 100 PKR")
    .max(100000, "Maximum wage is 100,000 PKR"),
  toolsRequired: z.array(z.string()).max(20),
  locationName: z.enum(cityIds, {
    message: "Please select the job location",
  }),
  locationLat: z.number().optional().nullable(),
  locationLng: z.number().optional().nullable(),
  description: z.string().max(1000).optional(),
});

export type JobInput = z.infer<typeof jobSchema>;
