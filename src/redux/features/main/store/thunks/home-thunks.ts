/**
 * home-thunks.ts
 * All API calls specific to home page with pagination support
 */

import { AppDefault } from "@/constants/app-resource/default/default";
import { Status } from "@/constants/status/status";
import { AllBannerRequest } from "@/redux/features/master-data/store/models/request/banner-request";
import { axiosClient, axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";

export const fetchHomeBanners = createApiThunk<any, AllBannerRequest>(
  "home/fetchBanners",
  async (request) => {
    const response = await axiosClient.post("/api/v1/public/banners/all", {
      status: Status.ACTIVE,
      businessId: AppDefault.BUSINESS_ID,
      ...request,
    });
    return response.data.data;
  }
);

export const fetchHomeCategories = createApiThunk<any, void>(
  "home/fetchCategories",
  async () => {
    const response = await axiosClient.post("/api/v1/public/categories/all", {
      pageSize: 16,
      status: Status.ACTIVE,
      businessId: AppDefault.BUSINESS_ID,
    });
    return response.data.data;
  }
);

export const fetchHomePromotionProducts = createApiThunk<any, void>(
  "home/fetchPromotionProducts",
  async () => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/products/all",
      {
        pageSize: 30,
        hasPromotion: true,
        status: Status.ACTIVE,
        businessId: AppDefault.BUSINESS_ID,
      }
    );
    return response.data.data;
  }
);

// Paginated Featured Products
export const fetchHomeFeaturedProducts = createApiThunk<
  any,
  { pageNo: number; pageSize: number }
>("home/fetchFeaturedProducts", async ({ pageNo, pageSize }) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/public/products/all",
    {
      pageNo,
      pageSize,
      status: Status.ACTIVE,
      businessId: AppDefault.BUSINESS_ID,
    }
  );
  return response.data.data;
});

export const fetchHomeBrands = createApiThunk<any, void>(
  "home/fetchBrands",
  async () => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/brands/all",
      {
        pageSize: 30,
        status: Status.ACTIVE,
        businessId: AppDefault.BUSINESS_ID,
      }
    );
    return response.data.data;
  }
);
