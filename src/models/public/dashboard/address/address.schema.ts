import { z } from "zod";

export const AddressRequestSchema = z.object({
  village: z.string().optional(),
  commune: z.string().optional(),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  streetNumber: z.string().optional(),
  houseNumber: z.string().optional(),
  note: z.string().optional(),
  latitude: z
    .number("Latitude is required")
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number("Longitude is required")
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  isDefault: z.boolean().optional().default(false),
});

export type AddressFormData = z.infer<typeof AddressRequestSchema> & {
  id?: string;
};
