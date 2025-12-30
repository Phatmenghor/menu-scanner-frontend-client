import { axiosClient } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
} from "@/redux/features/business/store/models/response/product-response";

export interface PublicProductListParams {
  pageNo?: number;
  pageSize?: number;
  categoryId?: string;
  brandId?: string;
  hasPromotion?: boolean;
  status?: string;
  search?: string;
  sortBy?: string;
}

export const fetchPublicProducts = createApiThunk<
  AllProductResponseModel,
  PublicProductListParams
>("publicProducts/fetchList", async (params) => {
  const response = await axiosClient.post("/api/v1/public/products/all", {
    pageNo: params.pageNo || 1,
    pageSize: params.pageSize || 30,
    ...(params.categoryId && { categoryId: params.categoryId }),
    ...(params.brandId && { brandId: params.brandId }),
    ...(params.hasPromotion && { hasPromotion: params.hasPromotion }),
    ...(params.status && { status: params.status }),
    ...(params.search && { search: params.search }),
    ...(params.sortBy && { sortBy: params.sortBy }),
  });
  return response.data.data;
});

export const fetchPublicProductById = createApiThunk<
  ProductDetailResponseModel,
  string
>("publicProducts/fetchById", async (productId) => {
  const response = await axiosClient.get(
    `/api/v1/public/products/${productId}`
  );
  return response.data.data;
});

export const fetchPublicCategories = createApiThunk<any, void>(
  "publicProducts/fetchCategories",
  async () => {
    const response = await axiosClient.post("/api/v1/categories/all", {
      pageSize: 100,
    });
    return response.data.data.content;
  }
);

export const fetchPublicBrands = createApiThunk<any, void>(
  "publicProducts/fetchBrands",
  async () => {
    const response = await axiosClient.post("/api/v1/brands/all", {
      pageSize: 100,
    });
    return response.data.data.content;
  }
);
