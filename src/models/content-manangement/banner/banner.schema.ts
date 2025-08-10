import { z } from "zod";

export const UploadBannerSchema = z.object({
  imageUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  status: z.string().optional(), // adjust values as needed
});

// For form inference
export type UploadBannerFormData = z.infer<typeof UploadBannerSchema> & {
  id?: string;
};
