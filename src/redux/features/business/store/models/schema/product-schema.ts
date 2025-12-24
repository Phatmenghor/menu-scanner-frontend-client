// product.schema.ts
import { z } from "zod";

/**
 * Image Schema
 */
export const imageSchema = z.object({
  id: z.string().optional(),
  imageUrl: z
    .string()
    .url("Invalid image URL")
    .or(z.string().min(1, "Image URL required")),
});

/**
 * Size Schema
 */
export const sizeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Size name is required"),
  price: z.number().min(0, "Price must be positive"),
  promotionType: z.string().optional().or(z.literal("")),
  promotionValue: z
    .number()
    .min(0, "Promotion value must be positive")
    .optional(),
  promotionFromDate: z.string().optional().or(z.literal("")),
  promotionToDate: z.string().optional().or(z.literal("")),
});

/**
 * Create Product Schema
 */
export const createProductSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.string().min(1, "Category is required"),
    brandId: z.string().optional().or(z.literal("")),
    mainImageUrl: z
      .string()
      .url("Invalid main image URL")
      .or(z.string().min(1, "Main image required")),

    // Pricing - optional because it depends on sizes
    price: z.number().min(0, "Price must be positive").optional(),
    promotionType: z.string().optional().or(z.literal("")),
    promotionValue: z
      .number()
      .min(0, "Promotion value must be positive")
      .optional(),
    promotionFromDate: z.string().optional().or(z.literal("")),
    promotionToDate: z.string().optional().or(z.literal("")),

    images: z.array(imageSchema).optional().default([]),
    sizes: z.array(sizeSchema).optional().default([]),
    status: z.string().min(1, "Status is required"),
  })
  .refine(
    (data) => {
      // If no sizes, price is required
      if (!data.sizes || data.sizes.length === 0) {
        return data.price !== undefined && data.price >= 0;
      }
      return true;
    },
    {
      message: "Price is required when product has no sizes",
      path: ["price"],
    }
  );

/**
 * Update Product Schema
 */
export const updateProductSchema = z
  .object({
    id: z.string().min(1, "Product ID is required"),
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.string().min(1, "Category is required"),
    brandId: z.string().optional().or(z.literal("")),
    mainImageUrl: z
      .string()
      .url("Invalid main image URL")
      .or(z.string().min(1, "Main image required")),

    // Pricing - optional because it depends on sizes
    price: z.number().min(0, "Price must be positive").optional(),
    promotionType: z.string().optional().or(z.literal("")),
    promotionValue: z
      .number()
      .min(0, "Promotion value must be positive")
      .optional(),
    promotionFromDate: z.string().optional().or(z.literal("")),
    promotionToDate: z.string().optional().or(z.literal("")),

    images: z.array(imageSchema).optional().default([]),
    sizes: z.array(sizeSchema).optional().default([]),
    status: z.string().min(1, "Status is required"),
  })
  .refine(
    (data) => {
      // If no sizes, price is required
      if (!data.sizes || data.sizes.length === 0) {
        return data.price !== undefined && data.price >= 0;
      }
      return true;
    },
    {
      message: "Price is required when product has no sizes",
      path: ["price"],
    }
  );

/**
 * Combined form data type - includes all possible fields
 */
export type ProductFormData = {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  brandId?: string;
  price: number;
  mainImageUrl: string;
  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
  images?: Array<{
    id?: string;
    imageUrl: string;
  }>;
  sizes?: Array<{
    id?: string;
    name: string;
    price: number;
    promotionType?: string;
    promotionValue?: number;
    promotionFromDate?: string;
    promotionToDate?: string;
  }>;
  status: string;
};

export type CreateProductData = z.infer<typeof createProductSchema>;
export type UpdateProductData = z.infer<typeof updateProductSchema>;
export type ImageData = z.infer<typeof imageSchema>;
export type SizeData = z.infer<typeof sizeSchema>;
