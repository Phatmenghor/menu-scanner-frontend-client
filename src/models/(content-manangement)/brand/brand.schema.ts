import { z } from "zod";

// Create schema (adjust required fields as needed)
export const BrandSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required").optional(),
});

export type BrandFormData = z.infer<typeof BrandSchema> & {
  id?: string;
};
