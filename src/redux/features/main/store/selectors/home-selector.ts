/**
 * Home Page Selectors - Complete Redux Selectors
 *
 * Provides all selectors for accessing home page state
 * Uses createSelector for memoization to prevent unnecessary re-renders
 */

import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

// ========== BASE SELECTOR ==========
/**
 * Select entire home state
 */
export const selectHomeState = (state: RootState) => state.home;

// ========== DATA SELECTORS - Get data stored in home slice ==========
/**
 * Select banner data array
 */
export const selectHomeBanners = (state: RootState) => state.home.banners;

/**
 * Select categories data array
 */
export const selectHomeCategories = (state: RootState) => state.home.categories;

/**
 * Select products data array
 */
export const selectHomeProducts = (state: RootState) => state.home.products;

/**
 * Select brands data array
 */
export const selectHomeBrands = (state: RootState) => state.home.brands;

// ========== LOADING STATE SELECTORS ==========
/**
 * Select banners loading state
 */
export const selectBannersLoading = (state: RootState) =>
  state.home.bannersLoading;

/**
 * Select categories loading state
 */
export const selectCategoriesLoading = (state: RootState) =>
  state.home.categoriesLoading;

/**
 * Select products loading state
 */
export const selectProductsLoading = (state: RootState) =>
  state.home.productsLoading;

/**
 * Select brands loading state
 */
export const selectBrandsLoading = (state: RootState) =>
  state.home.brandsLoading;

// ========== ERROR STATE SELECTORS ==========
/**
 * Select banners error message
 */
export const selectBannersError = (state: RootState) => state.home.bannersError;

/**
 * Select categories error message
 */
export const selectCategoriesError = (state: RootState) =>
  state.home.categoriesError;

/**
 * Select products error message
 */
export const selectProductsError = (state: RootState) =>
  state.home.productsError;

/**
 * Select brands error message
 */
export const selectBrandsError = (state: RootState) => state.home.brandsError;

// ========== LOADED FLAGS SELECTORS ==========
/**
 * Select banners loaded flag (CRITICAL for persistence)
 */
export const selectBannersLoaded = (state: RootState) =>
  state.home.bannersLoaded;

/**
 * Select categories loaded flag (CRITICAL for persistence)
 */
export const selectCategoriesLoaded = (state: RootState) =>
  state.home.categoriesLoaded;

/**
 * Select products loaded flag (CRITICAL for persistence)
 */
export const selectProductsLoaded = (state: RootState) =>
  state.home.productsLoaded;

/**
 * Select brands loaded flag (CRITICAL for persistence)
 */
export const selectBrandsLoaded = (state: RootState) => state.home.brandsLoaded;

// ========== OVERALL STATE SELECTORS ==========
/**
 * Select initial load complete flag
 */
export const selectInitialLoadComplete = (state: RootState) =>
  state.home.initialLoadComplete;

/**
 * Select last fetch timestamp
 */
export const selectLastFetchTimestamp = (state: RootState) =>
  state.home.lastFetchTimestamp;

// ========== SCROLL TRACKING SELECTORS ==========
/**
 * Select scroll position value
 */
export const selectScrollPosition = (state: RootState) =>
  state.home.scrollState.position;

/**
 * Select when scroll was saved
 */
export const selectScrollSavedAt = (state: RootState) =>
  state.home.scrollState.savedAt;

/**
 * Select should restore scroll flag
 */
export const selectShouldRestoreScroll = (state: RootState) =>
  state.home.shouldRestoreScroll;

/**
 * Select last detail page ID
 */
export const selectLastDetailPage = (state: RootState) =>
  state.home.lastDetailPage;

// ========== MEMOIZED/COMPUTED SELECTORS ==========
/**
 * Check if ANY data is currently loading
 *
 * Memoized - only recomputes if inputs change
 * Use this instead of checking individual flags
 */
export const selectAnyLoading = createSelector(
  [
    selectBannersLoading,
    selectCategoriesLoading,
    selectProductsLoading,
    selectBrandsLoading,
  ],
  (bannersLoading, categoriesLoading, productsLoading, brandsLoading) =>
    bannersLoading || categoriesLoading || productsLoading || brandsLoading
);

/**
 * Check if ALL data has been loaded
 *
 * Memoized - prevents unnecessary re-renders
 * Use this to determine if initial load is complete
 */
export const selectAllLoaded = createSelector(
  [
    selectBannersLoaded,
    selectCategoriesLoaded,
    selectProductsLoaded,
    selectBrandsLoaded,
  ],
  (bannersLoaded, categoriesLoaded, productsLoaded, brandsLoaded) =>
    bannersLoaded && categoriesLoaded && productsLoaded && brandsLoaded
);

/**
 * Check if ANY data is available (at least one section has data)
 *
 * Useful for determining if page should show content
 */
export const selectHasAnyData = createSelector(
  [
    selectHomeBanners,
    selectHomeCategories,
    selectHomeProducts,
    selectHomeBrands,
  ],
  (banners, categories, products, brands) =>
    banners.length > 0 ||
    categories.length > 0 ||
    products.length > 0 ||
    brands.length > 0
);

/**
 * Check if data is stale (older than 5 minutes)
 *
 * Can be used to determine if refresh is needed
 */
export const selectIsDataStale = createSelector(
  [selectLastFetchTimestamp],
  (lastFetch) => {
    if (!lastFetch) return true;
    const STALE_TIME = 5 * 60 * 1000; // 5 minutes
    return Date.now() - lastFetch > STALE_TIME;
  }
);

/**
 * Get all errors in a single object
 *
 * Useful for rendering error messages per section
 */
export const selectAllErrors = createSelector(
  [
    selectBannersError,
    selectCategoriesError,
    selectProductsError,
    selectBrandsError,
  ],
  (bannersError, categoriesError, productsError, brandsError) => ({
    banners: bannersError,
    categories: categoriesError,
    products: productsError,
    brands: brandsError,
  })
);

/**
 * Check if ANY errors exist
 *
 * Use this to show error indicator
 */
export const selectHasAnyError = createSelector([selectAllErrors], (errors) =>
  Boolean(
    errors.banners || errors.categories || errors.products || errors.brands
  )
);

/**
 * Get all loading states in an object
 *
 * Useful for component-level loading management
 */
export const selectAllLoadingStates = createSelector(
  [
    selectBannersLoading,
    selectCategoriesLoading,
    selectProductsLoading,
    selectBrandsLoading,
  ],
  (bannersLoading, categoriesLoading, productsLoading, brandsLoading) => ({
    banners: bannersLoading,
    categories: categoriesLoading,
    products: productsLoading,
    brands: brandsLoading,
  })
);

/**
 * Get all loaded flags in an object
 *
 * CRITICAL for checking if data needs to be fetched
 */
export const selectAllLoadedFlags = createSelector(
  [
    selectBannersLoaded,
    selectCategoriesLoaded,
    selectProductsLoaded,
    selectBrandsLoaded,
  ],
  (bannersLoaded, categoriesLoaded, productsLoaded, brandsLoaded) => ({
    banners: bannersLoaded,
    categories: categoriesLoaded,
    products: productsLoaded,
    brands: brandsLoaded,
  })
);

/**
 * Get loading state for specific section
 *
 * @param sectionType - "banners" | "categories" | "products" | "brands"
 */
export const selectLoadingBySectionType = (sectionType: string) =>
  createSelector([selectHomeState], (homeState) => {
    switch (sectionType) {
      case "banners":
        return homeState.bannersLoading;
      case "categories":
        return homeState.categoriesLoading;
      case "products":
        return homeState.productsLoading;
      case "brands":
        return homeState.brandsLoading;
      default:
        return false;
    }
  });

/**
 * Get data for specific section
 *
 * @param sectionType - "banners" | "categories" | "products" | "brands"
 */
export const selectDataBySectionType = (sectionType: string) =>
  createSelector([selectHomeState], (homeState) => {
    switch (sectionType) {
      case "banners":
        return homeState.banners;
      case "categories":
        return homeState.categories;
      case "products":
        return homeState.products;
      case "brands":
        return homeState.brands;
      default:
        return [];
    }
  });

/**
 * Get loaded flag for specific section
 *
 * @param sectionType - "banners" | "categories" | "products" | "brands"
 */
export const selectLoadedBySectionType = (sectionType: string) =>
  createSelector([selectHomeState], (homeState) => {
    switch (sectionType) {
      case "banners":
        return homeState.bannersLoaded;
      case "categories":
        return homeState.categoriesLoaded;
      case "products":
        return homeState.productsLoaded;
      case "brands":
        return homeState.brandsLoaded;
      default:
        return false;
    }
  });

/**
 * Get error for specific section
 *
 * @param sectionType - "banners" | "categories" | "products" | "brands"
 */
export const selectErrorBySectionType = (sectionType: string) =>
  createSelector([selectHomeState], (homeState) => {
    switch (sectionType) {
      case "banners":
        return homeState.bannersError;
      case "categories":
        return homeState.categoriesError;
      case "products":
        return homeState.productsError;
      case "brands":
        return homeState.brandsError;
      default:
        return null;
    }
  });

/**
 * Check if should fetch for specific section
 *
 * Returns true if data not loaded AND not loading
 */
export const selectShouldFetchBySection = (sectionType: string) =>
  createSelector(
    [
      selectLoadedBySectionType(sectionType),
      selectLoadingBySectionType(sectionType),
    ],
    (loaded, loading) => !loaded && !loading
  );

/**
 * Get scroll restoration info
 *
 * Contains all scroll-related state in one object
 */
export const selectScrollRestoreInfo = createSelector(
  [selectScrollPosition, selectShouldRestoreScroll, selectLastDetailPage],
  (position, shouldRestore, lastDetailPage) => ({
    position,
    shouldRestore,
    lastDetailPage,
  })
);

/**
 * Get scroll state
 *
 * Contains position and timestamp
 */
export const selectScrollState = createSelector(
  [selectScrollPosition, selectScrollSavedAt],
  (position, savedAt) => ({
    position,
    savedAt,
  })
);

/**
 * Get complete data status
 *
 * Useful for determining what to render
 */
export const selectDataStatus = createSelector(
  [selectAllLoaded, selectAnyLoading, selectHasAnyError, selectHasAnyData],
  (allLoaded, anyLoading, hasError, hasData) => ({
    allLoaded,
    anyLoading,
    hasError,
    hasData,
    isReady: hasData && !anyLoading,
    isEmpty: !hasData && !anyLoading && !hasError,
    isError: hasError && !anyLoading,
  })
);

/**
 * Get data count across all sections
 *
 * Useful for analytics or displaying totals
 */
export const selectDataCounts = createSelector(
  [
    selectHomeBanners,
    selectHomeCategories,
    selectHomeProducts,
    selectHomeBrands,
  ],
  (banners, categories, products, brands) => ({
    banners: banners.length,
    categories: categories.length,
    products: products.length,
    brands: brands.length,
    total: banners.length + categories.length + products.length + brands.length,
  })
);

/**
 * Check if need to load specific sections
 *
 * Returns object with boolean for each section
 */
export const selectSectionsToLoad = createSelector(
  [selectAllLoadedFlags],
  (flags) => ({
    banners: !flags.banners,
    categories: !flags.categories,
    products: !flags.products,
    brands: !flags.brands,
    needsAnyLoad:
      !flags.banners || !flags.categories || !flags.products || !flags.brands,
  })
);

/**
 * Get complete home page state summary
 *
 * Useful for component that needs comprehensive state info
 */
export const selectHomePageSummary = createSelector(
  [
    selectHomeState,
    selectAllLoaded,
    selectAnyLoading,
    selectHasAnyError,
    selectHasAnyData,
    selectDataCounts,
    selectDataStatus,
  ],
  (homeState, allLoaded, anyLoading, hasError, hasData, counts, status) => ({
    ...homeState,
    allLoaded,
    anyLoading,
    hasError,
    hasData,
    counts,
    status,
  })
);
