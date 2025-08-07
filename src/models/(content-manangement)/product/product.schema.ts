import { z } from "zod";

// Image Schema
export const ImageSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  imageType: z.string().min(1, "Image type is required"),
});

// Size Schema
export const SizeSchema = z.object({
  name: z.string().min(1, "Size name is required"),
  price: z.number().nonnegative("Price must be non-negative"),
  promotionType: z.string().optional(),
  promotionValue: z.number().optional(),
  promotionFromDate: z.string().optional(),
  promotionToDate: z.string().optional(),
});

// ProductFormData Schema
export const ProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  categoryId: z.string().min(1, "Category ID is required"),
  images: z.array(ImageSchema).min(1, "At least one image is required"),

  description: z.string().optional(),
  brandId: z.string().optional(),
  price: z.number().nonnegative().optional(),

  promotionType: z.string().optional(),
  promotionValue: z.number().nonnegative().optional(),
  promotionFromDate: z.string().optional(),
  promotionToDate: z.string().optional(),

  sizes: z.array(SizeSchema).optional(),
  status: z.string().optional(),
});

export type productFormData = z.infer<typeof ProductFormSchema> & {
  id?: string;
};
