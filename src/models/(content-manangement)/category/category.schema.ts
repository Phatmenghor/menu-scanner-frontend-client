import { z } from "zod";

export const CategoryFormSchema = z.object({
  name: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof CategoryFormSchema> & {
  id?: string;
};
