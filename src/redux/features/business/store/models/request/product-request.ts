import { BaseGetAllRequest } from "@/utils/common/get-all-request";
import { UpdateProductData } from "../schema/product-schema";

export interface AllProductRequest extends BaseGetAllRequest {
  businessId?: string;
  categoryId?: string;
  brandId?: string;
  status?: string;
  hasPromotion?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface UpdateProductParams {
  id: string;
  payload: UpdateProductData;
}
