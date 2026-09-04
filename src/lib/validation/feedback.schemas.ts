import { z } from "zod";

/** Strip ASCII control characters (keeps Urdu/emoji intact). */
const stripCtrl = (s: string) => s.replace(/[\u0000-\u001F\u007F]/g, "");

export const feedbackSchema = z.object({
  jobId: z.string().uuid(),
  subjectId: z.string().uuid(),
  type: z.enum(["EMPLOYER_TO_WORKER", "WORKER_TO_EMPLOYER"]),
  overallRating: z.number().int().min(1).max(5),
  punctuality: z.number().int().min(0).max(5).optional(),
  attitude: z.number().int().min(0).max(5).optional(),
  workQuality: z.number().int().min(0).max(5).optional(),
  paymentOnTime: z.number().int().min(0).max(5).optional(),
  fairTreatment: z.number().int().min(0).max(5).optional(),
  comment: z.string().trim().max(500).transform(stripCtrl).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
