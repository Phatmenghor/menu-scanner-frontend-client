/**
 * Home Page Slice - Complete Redux State Management
 *
 * Features:
 * - Data persistence without page refresh
 * - Scroll position tracking and restoration
 * - Smart loading prevention when data exists
 * - Maintain state when navigating away and back
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

// ========== INTERFACES ==========

/**
 * Scroll position state
 */
interface ScrollState {
  position: number;
  savedAt: number;
}

/**
 * Main home page state interface
 */
interface HomePageState {
  // ========== DATA STORAGE ==========
  banners: BannerResponseModel[];
  categories: CategoriesResponseModel[];
  products: ProductDetailResponseModel[];
  brands: BrandResponseModel[];

  // ========== LOADING STATES ==========
  bannersLoading: boolean;
  categoriesLoading: boolean;
  productsLoading: boolean;
  brandsLoading: boolean;

  // ========== ERROR STATES ==========
  bannersError: string | null;
  categoriesError: string | null;
  productsError: string | null;
  brandsError: string | null;

  // ========== LOADED FLAGS - KEY FOR NO REFRESH ==========
  /**
   * These flags are CRITICAL for data persistence
   * When a section is loaded, its flag is set to true
   * On component mount, we check these flags before fetching
   * This prevents unnecessary API calls
   */
  bannersLoaded: boolean;
  categoriesLoaded: boolean;
  productsLoaded: boolean;
  brandsLoaded: boolean;

  // ========== PAGE STATE ==========
  initialLoadComplete: boolean;
  lastFetchTimestamp: number | null;

  // ========== SCROLL POSITION TRACKING ==========
  /**
   * Tracks scroll position for restoration when returning from detail page
   */
  scrollState: ScrollState;
  shouldRestoreScroll: boolean;
  lastDetailPage: string | null;
}

// ========== INITIAL STATE ==========
const initialState: HomePageState = {
  // Empty data arrays
  banners: [],
  categories: [],
  products: [],
  brands: [],

  // Loading states - all false initially
  bannersLoading: false,
  categoriesLoading: false,
  productsLoading: false,
  brandsLoading: false,

  // Error states - all null initially
  bannersError: null,
  categoriesError: null,
  productsError: null,
  brandsError: null,

  // Loaded flags - all false initially (CRITICAL for persistence)
  bannersLoaded: false,
  categoriesLoaded: false,
  productsLoaded: false,
  brandsLoaded: false,

  // Overall state
  initialLoadComplete: false,
  lastFetchTimestamp: null,

  // Scroll tracking
  scrollState: { position: 0, savedAt: 0 },
  shouldRestoreScroll: false,
  lastDetailPage: null,
};

// ========== SLICE DEFINITION ==========
const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    // ========== SCROLL POSITION MANAGEMENT ==========
    /**
     * Save scroll position before navigating away
     * Called before user navigates to detail page
     */
    saveScrollPosition: (state, action: PayloadAction<number>) => {
      state.scrollState = {
        position: action.payload,
        savedAt: Date.now(),
      };
    },

    /**
     * Enable scroll restoration
     * Tells component to restore scroll position
     */
    enableScrollRestoration: (state) => {
      state.shouldRestoreScroll = true;
    },

    /**
     * Disable scroll restoration
     * Called after scroll is restored
     */
    disableScrollRestoration: (state) => {
      state.shouldRestoreScroll = false;
    },

    /**
     * Track which detail page user came from
     * Used to identify navigation path
     */
    setLastDetailPage: (state, action: PayloadAction<string | null>) => {
      state.lastDetailPage = action.payload;
    },

    // ========== STATE MANAGEMENT ==========
    /**
     * Mark initial load as complete
     * Called after first batch of data loads
     */
    setInitialLoadComplete: (state) => {
      state.initialLoadComplete = true;
      state.lastFetchTimestamp = Date.now();
    },

    /**
     * Force refresh - clear all data and refetch
     * Resets all loaded flags to force new API calls
     */
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
      state.bannersError = null;
      state.categoriesError = null;
      state.productsError = null;
      state.brandsError = null;
    },

    /**
     * Reset to initial state
     */
    resetHomeState: () => initialState,

    /**
     * Clear specific section data
     */
    clearSection: (
      state,
      action: PayloadAction<"banners" | "categories" | "products" | "brands">
    ) => {
      const section = action.payload;
      state[section] = [];
      state[`${section}Loaded`] = false;
      state[`${section}Error`] = null;
    },
  },

  // ========== EXTRA REDUCERS FOR ASYNC THUNKS ==========
  extraReducers: (builder) => {
    // ==================== BANNERS ====================
    /**
     * Handle banner fetching lifecycle
     */
    builder
      // Pending: Request started
      .addCase(fetchAllBannerService.pending, (state) => {
        // Only show loading if data doesn't exist
        // This prevents re-rendering when returning with cached data
        if (!state.bannersLoaded) {
          state.bannersLoading = true;
        }
        state.bannersError = null;
      })
      // Fulfilled: Request succeeded
      .addCase(fetchAllBannerService.fulfilled, (state, action) => {
        state.bannersLoading = false;
        state.bannersLoaded = true; // ⭐ CRITICAL: Mark as loaded
        state.bannersError = null;
        state.banners = action.payload.content || [];
      })
      // Rejected: Request failed
      .addCase(fetchAllBannerService.rejected, (state, action) => {
        state.bannersLoading = false;
        state.bannersError = action.payload as string;
        // Keep loaded flag as false if error occurs
        state.bannersLoaded = false;
      });

    // ==================== CATEGORIES ====================
    /**
     * Handle category fetching lifecycle
     */
    builder
      // Pending: Request started
      .addCase(fetchAllCategoriesService.pending, (state) => {
        if (!state.categoriesLoaded) {
          state.categoriesLoading = true;
        }
        state.categoriesError = null;
      })
      // Fulfilled: Request succeeded
      .addCase(fetchAllCategoriesService.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesLoaded = true; // ⭐ CRITICAL: Mark as loaded
        state.categoriesError = null;
        state.categories = action.payload.content || [];
      })
      // Rejected: Request failed
      .addCase(fetchAllCategoriesService.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload as string;
        state.categoriesLoaded = false;
      });

    // ==================== PRODUCTS ====================
    /**
     * Handle product fetching lifecycle
     */
    builder
      // Pending: Request started
      .addCase(fetchAllProductService.pending, (state) => {
        if (!state.productsLoaded) {
          state.productsLoading = true;
        }
        state.productsError = null;
      })
      // Fulfilled: Request succeeded
      .addCase(fetchAllProductService.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.productsLoaded = true; // ⭐ CRITICAL: Mark as loaded
        state.productsError = null;
        state.products = action.payload.content || [];
      })
      // Rejected: Request failed
      .addCase(fetchAllProductService.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload as string;
        state.productsLoaded = false;
      });

    // ==================== BRANDS ====================
    /**
     * Handle brand fetching lifecycle
     */
    builder
      // Pending: Request started
      .addCase(fetchAllBrandService.pending, (state) => {
        if (!state.brandsLoaded) {
          state.brandsLoading = true;
        }
        state.brandsError = null;
      })
      // Fulfilled: Request succeeded
      .addCase(fetchAllBrandService.fulfilled, (state, action) => {
        state.brandsLoading = false;
        state.brandsLoaded = true; // ⭐ CRITICAL: Mark as loaded
        state.brandsError = null;
        state.brands = action.payload.content || [];
      })
      // Rejected: Request failed
      .addCase(fetchAllBrandService.rejected, (state, action) => {
        state.brandsLoading = false;
        state.brandsError = action.payload as string;
        state.brandsLoaded = false;
      });
  },
});

// ========== EXPORT ACTIONS ==========
export const {
  saveScrollPosition,
  enableScrollRestoration,
  disableScrollRestoration,
  setLastDetailPage,
  setInitialLoadComplete,
  forceRefresh,
  resetHomeState,
  clearSection,
} = homeSlice.actions;

// ========== EXPORT REDUCER ==========
export default homeSlice.reducer;
