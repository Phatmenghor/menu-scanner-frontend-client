import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

// Base selector
export const selectHomeState = (state: RootState) => state.home;

// Loading states
export const selectBannersLoading = (state: RootState) =>
  state.home.bannersLoading;
export const selectPromotionsLoading = (state: RootState) =>
  state.home.promotionsLoading;
export const selectProductsLoading = (state: RootState) =>
  state.home.productsLoading;
export const selectBrandsLoading = (state: RootState) =>
  state.home.brandsLoading;

// Error states
export const selectBannersError = (state: RootState) => state.home.bannersError;
export const selectPromotionsError = (state: RootState) =>
  state.home.promotionsError;
export const selectProductsError = (state: RootState) =>
  state.home.productsError;
export const selectBrandsError = (state: RootState) => state.home.brandsError;

// Loaded flags
export const selectBannersLoaded = (state: RootState) =>
  state.home.bannersLoaded;
export const selectPromotionsLoaded = (state: RootState) =>
  state.home.promotionsLoaded;
export const selectProductsLoaded = (state: RootState) =>
  state.home.productsLoaded;
export const selectBrandsLoaded = (state: RootState) => state.home.brandsLoaded;

// Overall state
export const selectInitialLoadComplete = (state: RootState) =>
  state.home.initialLoadComplete;

// Combined selector for any loading
export const selectAnyLoading = createSelector(
  [
    selectBannersLoading,
    selectPromotionsLoading,
    selectProductsLoading,
    selectBrandsLoading,
  ],
  (bannersLoading, promotionsLoading, productsLoading, brandsLoading) =>
    bannersLoading || promotionsLoading || productsLoading || brandsLoading
);

// Combined selector for all loaded
export const selectAllLoaded = createSelector(
  [
    selectBannersLoaded,
    selectPromotionsLoaded,
    selectProductsLoaded,
    selectBrandsLoaded,
  ],
  (bannersLoaded, promotionsLoaded, productsLoaded, brandsLoaded) =>
    bannersLoaded && promotionsLoaded && productsLoaded && brandsLoaded
);
