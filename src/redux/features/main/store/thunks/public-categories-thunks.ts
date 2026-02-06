/**
 * Public Categories Thunks
 * API calls for public categories data
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "@/utils/axios";
import { PaginationResponseModel } from "@/redux/features/master-data/store/models/response/pagination-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

export interface FetchPublicCategoriesParams {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  append?: boolean;
}

/**
 * Fetch public categories with pagination
 */
export const fetchPublicCategories = createAsyncThunk<
  PaginationResponseModel<CategoriesResponseModel>,
  FetchPublicCategoriesParams,
  { rejectValue: string }
>("publicCategories/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get<
      PaginationResponseModel<CategoriesResponseModel>
    >("/public/categories", {
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
      error.response?.data?.message || "Failed to fetch categories",
    );
  }
});
