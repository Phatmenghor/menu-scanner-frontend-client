import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

// Base selector
export const selectHomeState = (state: RootState) => state.home;

// Data selectors - get data stored in home slice
export const selectHomeBanners = (state: RootState) => state.home.banners;
export const selectHomeCategories = (state: RootState) => state.home.categories;
export const selectHomeProducts = (state: RootState) => state.home.products;
export const selectHomeBrands = (state: RootState) => state.home.brands;

// Loading states
export const selectBannersLoading = (state: RootState) =>
  state.home.bannersLoading;
export const selectCategoriesLoading = (state: RootState) =>
  state.home.categoriesLoading;
export const selectProductsLoading = (state: RootState) =>
  state.home.productsLoading;
export const selectBrandsLoading = (state: RootState) =>
  state.home.brandsLoading;

// Error states
export const selectBannersError = (state: RootState) => state.home.bannersError;
export const selectCategoriesError = (state: RootState) =>
  state.home.categoriesError;
export const selectProductsError = (state: RootState) =>
  state.home.productsError;
export const selectBrandsError = (state: RootState) => state.home.brandsError;

// Loaded flags
export const selectBannersLoaded = (state: RootState) =>
  state.home.bannersLoaded;
export const selectCategoriesLoaded = (state: RootState) =>
  state.home.categoriesLoaded;
export const selectProductsLoaded = (state: RootState) =>
  state.home.productsLoaded;
export const selectBrandsLoaded = (state: RootState) => state.home.brandsLoaded;

// Overall state
export const selectInitialLoadComplete = (state: RootState) =>
  state.home.initialLoadComplete;
export const selectLastFetchTimestamp = (state: RootState) =>
  state.home.lastFetchTimestamp;

// Combined selector for any loading
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

// Combined selector for all loaded
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

// Check if data is stale (older than 5 minutes)
export const selectIsDataStale = createSelector(
  [selectLastFetchTimestamp],
  (lastFetch) => {
    if (!lastFetch) return true;
    const STALE_TIME = 5 * 60 * 1000; // 5 minutes
    return Date.now() - lastFetch > STALE_TIME;
  }
);

// Check if we have any data
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
