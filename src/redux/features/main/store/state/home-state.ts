import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectHomeState,
  selectHomeBanners,
  selectHomeCategories,
  selectHomeProducts,
  selectHomeBrands,
  selectBannersLoading,
  selectCategoriesLoading,
  selectProductsLoading,
  selectBrandsLoading,
  selectBannersError,
  selectCategoriesError,
  selectProductsError,
  selectBrandsError,
  selectBannersLoaded,
  selectCategoriesLoaded,
  selectProductsLoaded,
  selectBrandsLoaded,
  selectInitialLoadComplete,
  selectLastFetchTimestamp,
  selectAnyLoading,
  selectAllLoaded,
  selectIsDataStale,
  selectHasAnyData,
} from "../selectors/home-selector";

export const useHomeState = () => {
  const dispatch = useAppDispatch();

  // State
  const homeState = useAppSelector(selectHomeState);

  // Data from home slice
  const banners = useAppSelector(selectHomeBanners);
  const categories = useAppSelector(selectHomeCategories);
  const products = useAppSelector(selectHomeProducts);
  const brands = useAppSelector(selectHomeBrands);

  // Loading states
  const bannersLoading = useAppSelector(selectBannersLoading);
  const categoriesLoading = useAppSelector(selectCategoriesLoading);
  const productsLoading = useAppSelector(selectProductsLoading);
  const brandsLoading = useAppSelector(selectBrandsLoading);

  // Error states
  const bannersError = useAppSelector(selectBannersError);
  const categoriesError = useAppSelector(selectCategoriesError);
  const productsError = useAppSelector(selectProductsError);
  const brandsError = useAppSelector(selectBrandsError);

  // Loaded flags
  const bannersLoaded = useAppSelector(selectBannersLoaded);
  const categoriesLoaded = useAppSelector(selectCategoriesLoaded);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const brandsLoaded = useAppSelector(selectBrandsLoaded);

  // Overall state
  const initialLoadComplete = useAppSelector(selectInitialLoadComplete);
  const lastFetchTimestamp = useAppSelector(selectLastFetchTimestamp);
  const anyLoading = useAppSelector(selectAnyLoading);
  const allLoaded = useAppSelector(selectAllLoaded);
  const isDataStale = useAppSelector(selectIsDataStale);
  const hasAnyData = useAppSelector(selectHasAnyData);

  return {
    homeState,
    dispatch,

    // Data
    banners,
    categories,
    products,
    brands,

    // Loading states
    bannersLoading,
    categoriesLoading,
    productsLoading,
    brandsLoading,
    anyLoading,

    // Error states
    bannersError,
    categoriesError,
    productsError,
    brandsError,

    // Loaded flags
    bannersLoaded,
    categoriesLoaded,
    productsLoaded,
    brandsLoaded,
    allLoaded,

    // Overall
    initialLoadComplete,
    lastFetchTimestamp,
    isDataStale,
    hasAnyData,
  };
};
