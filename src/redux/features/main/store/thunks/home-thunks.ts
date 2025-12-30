/**
 * home-thunks.ts
 * All API calls specific to home page using createApiThunk
 */

import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";

/**
 * Fetch banners for home page
 */
export const fetchHomeBanners = createApiThunk<any, void>(
  "home/fetchBanners",
  async () => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/banners/my-business/all",
      {
        pageSize: 10,
      }
    );
    return response.data.data;
  }
);

/**
 * Fetch categories for home page
 */
export const fetchHomeCategories = createApiThunk<any, void>(
  "home/fetchCategories",
  async () => {
    const response = await axiosClientWithAuth.post("/api/v1/categories/all", {
      pageSize: 20,
    });
    return response.data.data;
  }
);

/**
 * Fetch promotion products (hasPromotion = true)
 */
export const fetchHomePromotionProducts = createApiThunk<any, void>(
  "home/fetchPromotionProducts",
  async () => {
    const response = await axiosClientWithAuth.post("/api/v1/products/all", {
      pageSize: 10,
      hasPromotion: true,
    });
    return response.data.data;
  }
);

/**
 * Fetch featured products (status = ACTIVE)
 */
export const fetchHomeFeaturedProducts = createApiThunk<any, void>(
  "home/fetchFeaturedProducts",
  async () => {
    const response = await axiosClientWithAuth.post("/api/v1/products/all", {
      pageSize: 10,
      status: "ACTIVE",
    });
    return response.data.data;
  }
);

/**
 * Fetch new arrivals (status = NEW)
 */
export const fetchHomeNewArrivals = createApiThunk<any, void>(
  "home/fetchNewArrivals",
  async () => {
    const response = await axiosClientWithAuth.post("/api/v1/products/all", {
      pageSize: 10,
      status: "NEW",
    });
    return response.data.data;
  }
);

/**
 * Fetch brands for home page
 */
export const fetchHomeBrands = createApiThunk<any, void>(
  "home/fetchBrands",
  async () => {
    const response = await axiosClientWithAuth.post("/api/v1/brands/all", {
      pageSize: 20,
    });
    return response.data.data;
  }
);
