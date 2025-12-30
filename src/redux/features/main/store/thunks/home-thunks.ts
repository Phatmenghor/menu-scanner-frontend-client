/**
 * home-thunks.ts
 * All API calls specific to home page with pagination support
 */

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";

export const fetchHomeBanners = createApiThunk<any, void>(
  "home/fetchBanners",
  async () => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/banners/my-business/all",
      { pageSize: 10 }
    );
    return response.data.data;
  }
);

export const fetchHomeCategories = createApiThunk<any, void>(
  "home/fetchCategories",
  async () => {
    const response = await axiosClientWithAuth.post("/api/v1/categories/all", {
      pageSize: 20,
    });
    return response.data.data;
  }
);

export const fetchHomePromotionProducts = createApiThunk<any, void>(
  "home/fetchPromotionProducts",
  async () => {
    const response = await axiosClientWithAuth.post("/api/v1/products/all", {
      pageSize: 50,
      hasPromotion: true,
    });
    return response.data.data;
  }
);

// Paginated Featured Products
export const fetchHomeFeaturedProducts = createApiThunk<
  any,
  { pageNo: number; pageSize: number }
>("home/fetchFeaturedProducts", async ({ pageNo, pageSize }) => {
  const response = await axiosClientWithAuth.post("/api/v1/products/all", {
    pageNo,
    pageSize,
    status: "ACTIVE",
  });
  return response.data.data;
});

export const fetchHomeBrands = createApiThunk<any, void>(
  "home/fetchBrands",
  async () => {
    const response = await axiosClientWithAuth.post("/api/v1/brands/all", {
      pageSize: 50,
    });
    return response.data.data;
  }
);
