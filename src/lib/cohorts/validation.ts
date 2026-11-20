import { z } from "zod";
import { isValidDate, isValidTime } from "./schedule";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

/** What an admin submits to create or fully edit a cohort. */
export const cohortInputSchema = z.object({
  teacherId: z.string().uuid(),
  titleEn: z.string().trim().min(3).max(500),
  titleUr: optionalText(500),
  titleAr: optionalText(500),
  titleFr: optionalText(500),
  titleId: optionalText(500),
  descriptionEn: optionalText(5000),
  descriptionUr: optionalText(5000),
  descriptionAr: optionalText(5000),
  descriptionFr: optionalText(5000),
  descriptionId: optionalText(5000),
  weekdaysUtc: z
    .array(z.number().int().min(0).max(6))
    .min(1)
    .max(7)
    .transform((days) => [...new Set(days)].sort((a, b) => a - b)),
  startTimeUtc: z.string().refine(isValidTime, "Time must be HH:MM (24h, UTC)"),
  sessionMinutes: z.number().int().min(15).max(240),
  startDate: z.string().refine(isValidDate, "Date must be YYYY-MM-DD"),
  durationWeeks: z.number().int().min(1).max(104),
  monthlyFee: z.number().positive().max(10000),
  currency: z.enum(["USD", "GBP", "EUR", "CAD", "AUD"]),
  maxSeats: z.number().int().min(1).max(500),
  enrollmentOpen: z.boolean(),
  trialEnabled: z.boolean(),
  isPublished: z.boolean(),
  meetingLink: z
    .string()
    .trim()
    .max(2000)
    .nullish()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^https:\/\//i.test(v), {
      message: "Meeting link must start with https://",
    }),
});

export type CohortInput = z.infer<typeof cohortInputSchema>;

export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "group-class"
  );
}
