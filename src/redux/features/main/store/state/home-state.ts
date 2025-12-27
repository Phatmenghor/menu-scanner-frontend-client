import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectHomeState,
  selectBannersLoading,
  selectPromotionsLoading,
  selectProductsLoading,
  selectBrandsLoading,
  selectBannersError,
  selectPromotionsError,
  selectProductsError,
  selectBrandsError,
  selectBannersLoaded,
  selectPromotionsLoaded,
  selectProductsLoaded,
  selectBrandsLoaded,
  selectInitialLoadComplete,
  selectAnyLoading,
  selectAllLoaded,
} from "../selectors/home-selector";

export const useHomeState = () => {
  const dispatch = useAppDispatch();

  // State
  const homeState = useAppSelector(selectHomeState);

  // Loading states
  const bannersLoading = useAppSelector(selectBannersLoading);
  const promotionsLoading = useAppSelector(selectPromotionsLoading);
  const productsLoading = useAppSelector(selectProductsLoading);
  const brandsLoading = useAppSelector(selectBrandsLoading);

  // Error states
  const bannersError = useAppSelector(selectBannersError);
  const promotionsError = useAppSelector(selectPromotionsError);
  const productsError = useAppSelector(selectProductsError);
  const brandsError = useAppSelector(selectBrandsError);

  // Loaded flags
  const bannersLoaded = useAppSelector(selectBannersLoaded);
  const promotionsLoaded = useAppSelector(selectPromotionsLoaded);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const brandsLoaded = useAppSelector(selectBrandsLoaded);

  // Overall state
  const initialLoadComplete = useAppSelector(selectInitialLoadComplete);
  const anyLoading = useAppSelector(selectAnyLoading);
  const allLoaded = useAppSelector(selectAllLoaded);

  return {
    homeState,
    dispatch,

    // Loading states
    bannersLoading,
    promotionsLoading,
    productsLoading,
    brandsLoading,
    anyLoading,

    // Error states
    bannersError,
    promotionsError,
    productsError,
    brandsError,

    // Loaded flags
    bannersLoaded,
    promotionsLoaded,
    productsLoaded,
    brandsLoaded,
    allLoaded,

    // Overall
    initialLoadComplete,
  };
};
