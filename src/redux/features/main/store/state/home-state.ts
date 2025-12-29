/**
 * useHomeState - Complete Custom Hook
 *
 * Bundles all home page selectors and dispatch into one convenient hook
 * Provides complete access to home page state and actions
 */

import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  // Data selectors
  selectHomeBanners,
  selectHomeCategories,
  selectHomeProducts,
  selectHomeBrands,
  // Loading selectors
  selectBannersLoading,
  selectCategoriesLoading,
  selectProductsLoading,
  selectBrandsLoading,
  selectAnyLoading,
  selectAllLoadingStates,
  // Error selectors
  selectBannersError,
  selectCategoriesError,
  selectProductsError,
  selectBrandsError,
  selectAllErrors,
  selectHasAnyError,
  // Loaded flag selectors
  selectBannersLoaded,
  selectCategoriesLoaded,
  selectProductsLoaded,
  selectBrandsLoaded,
  selectAllLoaded,
  selectAllLoadedFlags,
  // Overall state selectors
  selectInitialLoadComplete,
  selectLastFetchTimestamp,
  selectIsDataStale,
  selectHasAnyData,
  selectDataCounts,
  // Scroll tracking selectors
  selectScrollPosition,
  selectScrollSavedAt,
  selectShouldRestoreScroll,
  selectLastDetailPage,
  selectScrollRestoreInfo,
  selectScrollState,
  // Utility selectors
  selectDataStatus,
  selectSectionsToLoad,
  selectHomePageSummary,
  selectDataBySectionType,
  selectLoadingBySectionType,
  selectLoadedBySectionType,
  selectErrorBySectionType,
  selectShouldFetchBySection,
} from "../selectors/home-selector";

/**
 * Complete home page state hook
 *
 * Usage:
 * const {
 *   banners,
 *   products,
 *   anyLoading,
 *   allLoaded,
 *   dispatch
 * } = useHomeState();
 */
export const useHomeState = () => {
  const dispatch = useAppDispatch();

  // ========== DATA ==========
  const banners = useAppSelector(selectHomeBanners);
  const categories = useAppSelector(selectHomeCategories);
  const products = useAppSelector(selectHomeProducts);
  const brands = useAppSelector(selectHomeBrands);

  // ========== LOADING STATES ==========
  const bannersLoading = useAppSelector(selectBannersLoading);
  const categoriesLoading = useAppSelector(selectCategoriesLoading);
  const productsLoading = useAppSelector(selectProductsLoading);
  const brandsLoading = useAppSelector(selectBrandsLoading);
  const anyLoading = useAppSelector(selectAnyLoading);
  const allLoadingStates = useAppSelector(selectAllLoadingStates);

  // ========== ERROR STATES ==========
  const bannersError = useAppSelector(selectBannersError);
  const categoriesError = useAppSelector(selectCategoriesError);
  const productsError = useAppSelector(selectProductsError);
  const brandsError = useAppSelector(selectBrandsError);
  const allErrors = useAppSelector(selectAllErrors);
  const hasAnyError = useAppSelector(selectHasAnyError);

  // ========== LOADED FLAGS ==========
  const bannersLoaded = useAppSelector(selectBannersLoaded);
  const categoriesLoaded = useAppSelector(selectCategoriesLoaded);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const brandsLoaded = useAppSelector(selectBrandsLoaded);
  const allLoaded = useAppSelector(selectAllLoaded);
  const allLoadedFlags = useAppSelector(selectAllLoadedFlags);

  // ========== OVERALL STATE ==========
  const initialLoadComplete = useAppSelector(selectInitialLoadComplete);
  const lastFetchTimestamp = useAppSelector(selectLastFetchTimestamp);
  const isDataStale = useAppSelector(selectIsDataStale);
  const hasAnyData = useAppSelector(selectHasAnyData);
  const dataCounts = useAppSelector(selectDataCounts);

  // ========== SCROLL TRACKING ==========
  const scrollPosition = useAppSelector(selectScrollPosition);
  const scrollSavedAt = useAppSelector(selectScrollSavedAt);
  const shouldRestoreScroll = useAppSelector(selectShouldRestoreScroll);
  const lastDetailPage = useAppSelector(selectLastDetailPage);
  const scrollRestoreInfo = useAppSelector(selectScrollRestoreInfo);
  const scrollState = useAppSelector(selectScrollState);

  // ========== UTILITY ==========
  const dataStatus = useAppSelector(selectDataStatus);
  const sectionsToLoad = useAppSelector(selectSectionsToLoad);
  const homePageSummary = useAppSelector(selectHomePageSummary);

  // ========== RETURN OBJECT ==========
  return {
    // Dispatch for actions
    dispatch,

    // ========== DATA ==========
    banners,
    categories,
    products,
    brands,

    // ========== LOADING STATES ==========
    bannersLoading,
    categoriesLoading,
    productsLoading,
    brandsLoading,
    anyLoading,
    allLoadingStates,

    // ========== ERROR STATES ==========
    bannersError,
    categoriesError,
    productsError,
    brandsError,
    allErrors,
    hasAnyError,

    // ========== LOADED FLAGS ==========
    bannersLoaded,
    categoriesLoaded,
    productsLoaded,
    brandsLoaded,
    allLoaded,
    allLoadedFlags,

    // ========== OVERALL STATE ==========
    initialLoadComplete,
    lastFetchTimestamp,
    isDataStale,
    hasAnyData,
    dataCounts,

    // ========== SCROLL TRACKING ==========
    scrollPosition,
    scrollSavedAt,
    shouldRestoreScroll,
    lastDetailPage,
    scrollRestoreInfo,
    scrollState,

    // ========== UTILITY ==========
    dataStatus,
    sectionsToLoad,
    homePageSummary,

    // ========== SELECTOR FUNCTIONS FOR DYNAMIC SECTION ACCESS ==========
    /**
     * Get data for a specific section dynamically
     * @param sectionType - "banners" | "categories" | "products" | "brands"
     */
    getDataBySection: (sectionType: string) =>
      useAppSelector((state) => selectDataBySectionType(sectionType)(state)),

    /**
     * Get loading state for a specific section
     * @param sectionType - "banners" | "categories" | "products" | "brands"
     */
    getLoadingBySection: (sectionType: string) =>
      useAppSelector((state) => selectLoadingBySectionType(sectionType)(state)),

    /**
     * Get loaded flag for a specific section
     * @param sectionType - "banners" | "categories" | "products" | "brands"
     */
    getLoadedBySection: (sectionType: string) =>
      useAppSelector((state) => selectLoadedBySectionType(sectionType)(state)),

    /**
     * Get error for a specific section
     * @param sectionType - "banners" | "categories" | "products" | "brands"
     */
    getErrorBySection: (sectionType: string) =>
      useAppSelector((state) => selectErrorBySectionType(sectionType)(state)),

    /**
     * Check if should fetch for a specific section
     * @param sectionType - "banners" | "categories" | "products" | "brands"
     */
    shouldFetchSection: (sectionType: string) =>
      useAppSelector((state) => selectShouldFetchBySection(sectionType)(state)),
  };
};

/**
 * Alternative hook for minimal state access
 * Use when you only need a few pieces of state
 *
 * Usage:
 * const { products, productsLoading, allLoaded } = useHomeStateMinimal();
 */
export const useHomeStateMinimal = () => {
  const dispatch = useAppDispatch();

  const products = useAppSelector(selectHomeProducts);
  const productsLoading = useAppSelector(selectProductsLoading);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const allLoaded = useAppSelector(selectAllLoaded);
  const anyLoading = useAppSelector(selectAnyLoading);
  const scrollRestoreInfo = useAppSelector(selectScrollRestoreInfo);

  return {
    dispatch,
    products,
    productsLoading,
    productsLoaded,
    allLoaded,
    anyLoading,
    scrollRestoreInfo,
  };
};

/**
 * Hook for scroll position management only
 * Use when component only cares about scroll
 *
 * Usage:
 * const { scrollPosition, shouldRestore, dispatch } = useHomeScroll();
 */
export const useHomeScroll = () => {
  const dispatch = useAppDispatch();

  const scrollPosition = useAppSelector(selectScrollPosition);
  const shouldRestoreScroll = useAppSelector(selectShouldRestoreScroll);
  const lastDetailPage = useAppSelector(selectLastDetailPage);
  const scrollRestoreInfo = useAppSelector(selectScrollRestoreInfo);

  return {
    dispatch,
    scrollPosition,
    shouldRestoreScroll,
    lastDetailPage,
    scrollRestoreInfo,
  };
};

/**
 * Hook for data loading management only
 * Use when component only cares about loading state
 *
 * Usage:
 * const { allLoaded, anyLoading, allLoadedFlags, sectionsToLoad } = useHomeLoading();
 */
export const useHomeLoading = () => {
  const dispatch = useAppDispatch();

  const allLoaded = useAppSelector(selectAllLoaded);
  const anyLoading = useAppSelector(selectAnyLoading);
  const allLoadedFlags = useAppSelector(selectAllLoadedFlags);
  const allLoadingStates = useAppSelector(selectAllLoadingStates);
  const sectionsToLoad = useAppSelector(selectSectionsToLoad);
  const initialLoadComplete = useAppSelector(selectInitialLoadComplete);

  return {
    dispatch,
    allLoaded,
    anyLoading,
    allLoadedFlags,
    allLoadingStates,
    sectionsToLoad,
    initialLoadComplete,
  };
};

/**
 * Hook for data error management only
 * Use when component only cares about errors
 *
 * Usage:
 * const { hasAnyError, allErrors, dispatch } = useHomeErrors();
 */
export const useHomeErrors = () => {
  const dispatch = useAppDispatch();

  const hasAnyError = useAppSelector(selectHasAnyError);
  const allErrors = useAppSelector(selectAllErrors);
  const bannersError = useAppSelector(selectBannersError);
  const categoriesError = useAppSelector(selectCategoriesError);
  const productsError = useAppSelector(selectProductsError);
  const brandsError = useAppSelector(selectBrandsError);

  return {
    dispatch,
    hasAnyError,
    allErrors,
    bannersError,
    categoriesError,
    productsError,
    brandsError,
  };
};

/**
 * Hook for data access only
 * Use when component only needs data
 *
 * Usage:
 * const { banners, products, brands, categories } = useHomeData();
 */
export const useHomeData = () => {
  const banners = useAppSelector(selectHomeBanners);
  const categories = useAppSelector(selectHomeCategories);
  const products = useAppSelector(selectHomeProducts);
  const brands = useAppSelector(selectHomeBrands);

  return {
    banners,
    categories,
    products,
    brands,
  };
};
