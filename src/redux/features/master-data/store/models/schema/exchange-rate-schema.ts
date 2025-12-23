import { z } from "zod";

// Helper to convert string/number to number
const numberSchema = z.union([z.string(), z.number()]).transform((val) => {
  const parsed = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(parsed)) throw new Error("Invalid number");
  return parsed;
});

/**
 * Create Exchange Rate Schema
 */
export const createExchangeRateSchema = z.object({
  usdToKhrRate: numberSchema.pipe(
    z.number().min(0.01, "USD To KHR rate must be greater than 0")
  ),
  usdToCnyRate: numberSchema
    .pipe(z.number().min(0.01, "USD To CNY rate must be greater than 0"))
    .optional(),
  usdToThbRate: numberSchema
    .pipe(z.number().min(0.01, "USD To THB rate must be greater than 0"))
    .optional(),
  usdToVndRate: numberSchema
    .pipe(z.number().min(0.01, "USD To VND rate must be greater than 0"))
    .optional(),
  notes: z.string().optional(),
});

/**
 * Update Exchange Rate Schema
 */
export const updateExchangeRateSchema = createExchangeRateSchema;

export type CreateExchangeRateData = z.infer<typeof createExchangeRateSchema>;
export type UpdateExchangeRateData = z.infer<typeof updateExchangeRateSchema>;

export type ExchangeRateFormData = {
  usdToKhrRate: number | string;
  usdToCnyRate?: number | string;
  usdToThbRate?: number | string;
  usdToVndRate?: number | string;
  notes?: string;
};
