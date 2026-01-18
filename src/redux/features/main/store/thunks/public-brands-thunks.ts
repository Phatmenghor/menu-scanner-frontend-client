/**
 * Public Brands Thunks
 * API calls for public brands data
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "@/utils/axios";
import { PaginationResponseModel } from "@/redux/features/master-data/store/models/response/pagination-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";

export interface FetchPublicBrandsParams {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  append?: boolean; // For infinite scroll
}

/**
 * Fetch public brands with pagination
 */
export const fetchPublicBrands = createAsyncThunk<
  PaginationResponseModel<BrandResponseModel>,
  FetchPublicBrandsParams,
  { rejectValue: string }
>(
  "publicBrands/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<
        PaginationResponseModel<BrandResponseModel>
      >("/public/brands", {
        params: {
          pageNo: params.pageNo || 1,
          pageSize: params.pageSize || 12,
          search: params.search || undefined,
          status: params.status || "ACTIVE",
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brands"
      );
    }
  }
);
