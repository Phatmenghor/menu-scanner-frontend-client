import { z } from "zod";

export const createWorkScheduleSchema = z.object({
  enumName: z.string().min(1, "Work schedule name is required"),
  description: z.string().optional().or(z.literal("")),
});

export const updateWorkScheduleSchema = z.object({
  enumName: z.string().min(1, "Work schedule name is required"),
  description: z.string().optional().or(z.literal("")),
});

export type WorkScheduleFormData = {
  id: string;
  enumName: string;
  description: string;
};
