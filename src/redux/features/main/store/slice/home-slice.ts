/**
 * Home Page Slice
 * Coordinates fetching data from multiple sources for the home page
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllBannerService,
  fetchBannerByIdService,
} from "@/redux/features/master-data/store/thunks/banner-thunks";
import {
  fetchAllProductAdminService,
  fetchAllProductService,
} from "@/redux/features/business/store/thunks/product-thunks";
import {
  fetchAllBrandService,
  fetchBrandByIdService,
} from "@/redux/features/master-data/store/thunks/brand-thunks";

interface HomePageState {
  // Loading states for progressive loading
  bannersLoading: boolean;
  promotionsLoading: boolean;
  productsLoading: boolean;
  brandsLoading: boolean;

  // Error states
  bannersError: string | null;
  promotionsError: string | null;
  productsError: string | null;
  brandsError: string | null;

  // Loaded flags to track what's been fetched
  bannersLoaded: boolean;
  promotionsLoaded: boolean;
  productsLoaded: boolean;
  brandsLoaded: boolean;

  // Overall page state
  initialLoadComplete: boolean;
}

const initialState: HomePageState = {
  bannersLoading: false,
  promotionsLoading: false,
  productsLoading: false,
  brandsLoading: false,

  bannersError: null,
  promotionsError: null,
  productsError: null,
  brandsError: null,

  bannersLoaded: false,
  promotionsLoaded: false,
  productsLoaded: false,
  brandsLoaded: false,

  initialLoadComplete: false,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    resetHomeState: () => initialState,
    setInitialLoadComplete: (state) => {
      state.initialLoadComplete = true;
    },
  },
  extraReducers: (builder) => {
    // ==================== BANNERS ====================
    builder
      .addCase(fetchAllBannerService.pending, (state) => {
        state.bannersLoading = true;
        state.bannersError = null;
      })
      .addCase(fetchAllBannerService.fulfilled, (state) => {
        state.bannersLoading = false;
        state.bannersLoaded = true;
        state.bannersError = null;
      })
      .addCase(fetchAllBannerService.rejected, (state, action) => {
        state.bannersLoading = false;
        state.bannersError = action.payload as string;
      });

    // ==================== PRODUCTS (All & Promotions) ====================
    builder
      .addCase(fetchAllProductService.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(fetchAllProductService.fulfilled, (state) => {
        state.productsLoading = false;
        state.productsLoaded = true;
        state.productsError = null;
      })
      .addCase(fetchAllProductService.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload as string;
      });

    // ==================== BRANDS ====================
    builder
      .addCase(fetchAllBrandService.pending, (state) => {
        state.brandsLoading = true;
        state.brandsError = null;
      })
      .addCase(fetchAllBrandService.fulfilled, (state) => {
        state.brandsLoading = false;
        state.brandsLoaded = true;
        state.brandsError = null;
      })
      .addCase(fetchAllBrandService.rejected, (state, action) => {
        state.brandsLoading = false;
        state.brandsError = action.payload as string;
      });
  },
});

export const { resetHomeState, setInitialLoadComplete } = homeSlice.actions;
export default homeSlice.reducer;
