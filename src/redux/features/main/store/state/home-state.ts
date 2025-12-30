/**
 * home-state.ts
 * Custom hooks for accessing home page state
 */

import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectHomeBanners,
  selectHomeCategories,
  selectHomePromotionProducts,
  selectHomeFeaturedProducts,
  selectHomeNewArrivals,
  selectHomeBrands,
  selectBannersSection,
  selectCategoriesSection,
  selectPromotionProductsSection,
  selectFeaturedProductsSection,
  selectNewArrivalsSection,
  selectBrandsSection,
  selectSections,
  selectScrollPosition,
  selectShouldRestoreScroll,
  selectLastDetailPage,
  selectAllSectionsLoaded,
  selectAnySectionLoading,
  selectHasAnyError,
  selectAllErrors,
  selectScrollRestoreInfo,
  selectInitialLoadComplete,
  selectIsDataStale,
  selectLoadedSectionsCount,
} from "../selectors/home-selector";

/**
 * Main home state hook
 * Provides complete access to all home page state
 */
export const useHomeState = () => {
  const dispatch = useAppDispatch();

  return {
    // Dispatch
    dispatch,

    // ========== DATA ==========
    banners: useAppSelector(selectHomeBanners),
    categories: useAppSelector(selectHomeCategories),
    promotionProducts: useAppSelector(selectHomePromotionProducts),
    featuredProducts: useAppSelector(selectHomeFeaturedProducts),
    newArrivals: useAppSelector(selectHomeNewArrivals),
    brands: useAppSelector(selectHomeBrands),

    // ========== SECTION STATES ==========
    // Each section has: { loading, loaded, error }
    bannersSection: useAppSelector(selectBannersSection),
    categoriesSection: useAppSelector(selectCategoriesSection),
    promotionProductsSection: useAppSelector(selectPromotionProductsSection),
    featuredProductsSection: useAppSelector(selectFeaturedProductsSection),
    newArrivalsSection: useAppSelector(selectNewArrivalsSection),
    brandsSection: useAppSelector(selectBrandsSection),
    sections: useAppSelector(selectSections),

    // ========== SCROLL STATE ==========
    scrollPosition: useAppSelector(selectScrollPosition),
    shouldRestoreScroll: useAppSelector(selectShouldRestoreScroll),
    lastDetailPage: useAppSelector(selectLastDetailPage),
    scrollRestoreInfo: useAppSelector(selectScrollRestoreInfo),

    // ========== COMPUTED STATE ==========
    allSectionsLoaded: useAppSelector(selectAllSectionsLoaded),
    anySectionLoading: useAppSelector(selectAnySectionLoading),
    hasAnyError: useAppSelector(selectHasAnyError),
    allErrors: useAppSelector(selectAllErrors),
    initialLoadComplete: useAppSelector(selectInitialLoadComplete),
    isDataStale: useAppSelector(selectIsDataStale),
    loadedSectionsCount: useAppSelector(selectLoadedSectionsCount),
  };
};
