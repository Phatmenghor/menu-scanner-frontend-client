import { DayOfWeek } from "@/types/business-profile";
import { z } from "zod";

const timeSchema = z
  .string()
  .min(1, "Required")
  .regex(/^\d{2}:\d{2}(:\d{2})?$/);

export const createWorkScheduleSchema = z.object({
  userId: z.string(),
  businessId: z.string(),
  name: z.string().min(1, "Required"),
  scheduleTypeEnumName: z.string().min(1, "Required"),

  workDays: z.array(z.enum(DayOfWeek)).min(1, "Required"),

  startTime: timeSchema,
  endTime: timeSchema,

  breakStartTime: timeSchema.optional(),
  breakEndTime: timeSchema.optional(),
});

export const updateWorkScheduleSchema = z.object({
  name: z.string().min(1, "Required"),
  scheduleTypeEnumName: z.string().min(1, "Required"),

  workDays: z.array(z.enum(DayOfWeek)).min(1, "Required"),

  startTime: timeSchema,
  endTime: timeSchema,

  breakStartTime: timeSchema.optional(),
  breakEndTime: timeSchema.optional(),
});
