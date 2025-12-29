/**
 * Home Page Slice
 * Stores its own copy of data to maintain state when navigating away
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BannerResponseModel } from "@/redux/features/master-data/store/models/response/banner-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { fetchAllBannerService } from "@/redux/features/master-data/store/thunks/banner-thunks";
import { fetchAllProductService } from "@/redux/features/business/store/thunks/product-thunks";
import { fetchAllBrandService } from "@/redux/features/master-data/store/thunks/brand-thunks";
import { fetchAllCategoriesService } from "@/redux/features/master-data/store/thunks/categories-thunks";

interface HomePageState {
  // Data storage - home page keeps its own copy
  banners: BannerResponseModel[];
  categories: CategoriesResponseModel[];
  products: ProductDetailResponseModel[];
  brands: BrandResponseModel[];

  // Loading states for progressive loading
  bannersLoading: boolean;
  categoriesLoading: boolean;
  productsLoading: boolean;
  brandsLoading: boolean;

  // Error states
  bannersError: string | null;
  categoriesError: string | null;
  productsError: string | null;
  brandsError: string | null;

  // Loaded flags to track what's been fetched
  bannersLoaded: boolean;
  categoriesLoaded: boolean;
  productsLoaded: boolean;
  brandsLoaded: boolean;

  // Overall page state
  initialLoadComplete: boolean;
  lastFetchTimestamp: number | null;
}

const initialState: HomePageState = {
  // Empty data arrays
  banners: [],
  categories: [],
  products: [],
  brands: [],

  // Loading states
  bannersLoading: false,
  categoriesLoading: false,
  productsLoading: false,
  brandsLoading: false,

  // Error states
  bannersError: null,
  categoriesError: null,
  productsError: null,
  brandsError: null,

  // Loaded flags
  bannersLoaded: false,
  categoriesLoaded: false,
  productsLoaded: false,
  brandsLoaded: false,

  // Overall state
  initialLoadComplete: false,
  lastFetchTimestamp: null,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    resetHomeState: () => initialState,
    setInitialLoadComplete: (state) => {
      state.initialLoadComplete = true;
      state.lastFetchTimestamp = Date.now();
    },
    // Force refresh - clears all loaded flags and data
    forceRefresh: (state) => {
      state.banners = [];
      state.categories = [];
      state.products = [];
      state.brands = [];
      state.bannersLoaded = false;
      state.categoriesLoaded = false;
      state.productsLoaded = false;
      state.brandsLoaded = false;
      state.initialLoadComplete = false;
      state.lastFetchTimestamp = null;
    },
  },
  extraReducers: (builder) => {
    // ==================== BANNERS ====================
    builder
      .addCase(fetchAllBannerService.pending, (state) => {
        state.bannersLoading = true;
        state.bannersError = null;
      })
      .addCase(fetchAllBannerService.fulfilled, (state, action) => {
        state.bannersLoading = false;
        state.bannersLoaded = true;
        state.bannersError = null;
        // Store banners data in home slice
        state.banners = action.payload.content || [];
      })
      .addCase(fetchAllBannerService.rejected, (state, action) => {
        state.bannersLoading = false;
        state.bannersError = action.payload as string;
      });

    // ==================== CATEGORIES ====================
    builder
      .addCase(fetchAllCategoriesService.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchAllCategoriesService.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesLoaded = true;
        state.categoriesError = null;
        // Store categories data in home slice
        state.categories = action.payload.content || [];
      })
      .addCase(fetchAllCategoriesService.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload as string;
      });

    // ==================== PRODUCTS ====================
    builder
      .addCase(fetchAllProductService.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(fetchAllProductService.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.productsLoaded = true;
        state.productsError = null;
        // Store products data in home slice
        state.products = action.payload.content || [];
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
      .addCase(fetchAllBrandService.fulfilled, (state, action) => {
        state.brandsLoading = false;
        state.brandsLoaded = true;
        state.brandsError = null;
        // Store brands data in home slice
        state.brands = action.payload.content || [];
      })
      .addCase(fetchAllBrandService.rejected, (state, action) => {
        state.brandsLoading = false;
        state.brandsError = action.payload as string;
      });
  },
});

export const { resetHomeState, setInitialLoadComplete, forceRefresh } =
  homeSlice.actions;
export default homeSlice.reducer;
