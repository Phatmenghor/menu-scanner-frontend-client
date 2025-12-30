/**
 * home-selectors.ts
 * All selectors for home page state
 */

import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

// ========== BASE ==========
export const selectHomeState = (state: RootState) => state.home;

// ========== DATA SELECTORS ==========
export const selectHomeBanners = (state: RootState) => state.home.banners;
export const selectHomeCategories = (state: RootState) => state.home.categories;
export const selectHomePromotionProducts = (state: RootState) =>
  state.home.promotionProducts;
export const selectHomeFeaturedProducts = (state: RootState) =>
  state.home.featuredProducts;
export const selectHomeNewArrivals = (state: RootState) =>
  state.home.newArrivals;
export const selectHomeBrands = (state: RootState) => state.home.brands;

// ========== SECTION STATE SELECTORS ==========
export const selectSections = (state: RootState) => state.home.sections;

export const selectBannersSection = (state: RootState) =>
  state.home.sections.banners;
export const selectCategoriesSection = (state: RootState) =>
  state.home.sections.categories;
export const selectPromotionProductsSection = (state: RootState) =>
  state.home.sections.promotionProducts;
export const selectFeaturedProductsSection = (state: RootState) =>
  state.home.sections.featuredProducts;
export const selectNewArrivalsSection = (state: RootState) =>
  state.home.sections.newArrivals;
export const selectBrandsSection = (state: RootState) =>
  state.home.sections.brands;

// ========== PAGE STATE ==========
export const selectInitialLoadComplete = (state: RootState) =>
  state.home.initialLoadComplete;
export const selectLastFetchTimestamp = (state: RootState) =>
  state.home.lastFetchTimestamp;

// ========== SCROLL STATE ==========
export const selectScrollState = (state: RootState) => state.home.scrollState;
export const selectScrollPosition = (state: RootState) =>
  state.home.scrollState.position;
export const selectScrollSavedAt = (state: RootState) =>
  state.home.scrollState.savedAt;
export const selectShouldRestoreScroll = (state: RootState) =>
  state.home.shouldRestoreScroll;
export const selectLastDetailPage = (state: RootState) =>
  state.home.lastDetailPage;

// ========== COMPUTED SELECTORS ==========

/**
 * Check if all sections are loaded
 */
export const selectAllSectionsLoaded = createSelector(
  [selectSections],
  (sections) =>
    sections.banners.loaded &&
    sections.categories.loaded &&
    sections.promotionProducts.loaded &&
    sections.featuredProducts.loaded &&
    sections.newArrivals.loaded &&
    sections.brands.loaded
);

/**
 * Check if any section is currently loading
 */
export const selectAnySectionLoading = createSelector(
  [selectSections],
  (sections) =>
    sections.banners.loading ||
    sections.categories.loading ||
    sections.promotionProducts.loading ||
    sections.featuredProducts.loading ||
    sections.newArrivals.loading ||
    sections.brands.loading
);

/**
 * Check if any section has error
 */
export const selectHasAnyError = createSelector(
  [selectSections],
  (sections) =>
    !!sections.banners.error ||
    !!sections.categories.error ||
    !!sections.promotionProducts.error ||
    !!sections.featuredProducts.error ||
    !!sections.newArrivals.error ||
    !!sections.brands.error
);

/**
 * Get all errors
 */
export const selectAllErrors = createSelector([selectSections], (sections) => ({
  banners: sections.banners.error,
  categories: sections.categories.error,
  promotionProducts: sections.promotionProducts.error,
  featuredProducts: sections.featuredProducts.error,
  newArrivals: sections.newArrivals.error,
  brands: sections.brands.error,
}));

/**
 * Get scroll restore info
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
 * Check if data is stale (older than 5 minutes)
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
 * Get count of loaded sections
 */
export const selectLoadedSectionsCount = createSelector(
  [selectSections],
  (sections) => {
    let count = 0;
    if (sections.banners.loaded) count++;
    if (sections.categories.loaded) count++;
    if (sections.promotionProducts.loaded) count++;
    if (sections.featuredProducts.loaded) count++;
    if (sections.newArrivals.loaded) count++;
    if (sections.brands.loaded) count++;
    return count;
  }
);
