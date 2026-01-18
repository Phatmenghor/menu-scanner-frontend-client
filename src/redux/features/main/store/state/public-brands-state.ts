/**
 * Public Brands State Hook
 */

import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectBrands,
  selectBrandsPagination,
  selectBrandsLoading,
  selectBrandsError,
  selectBrandsLoaded,
} from "../selectors/public-brands-selectors";
import { clearBrands, resetBrandsState } from "../slice/public-brands-slice";
import { fetchPublicBrands } from "../thunks/public-brands-thunks";

export const usePublicBrandsState = () => {
  const dispatch = useAppDispatch();

  const brands = useAppSelector(selectBrands);
  const pagination = useAppSelector(selectBrandsPagination);
  const loading = useAppSelector(selectBrandsLoading);
  const error = useAppSelector(selectBrandsError);
  const loaded = useAppSelector(selectBrandsLoaded);

  return {
    // State
    brands,
    pagination,
    loading,
    error,
    loaded,

    // Actions
    fetchBrands: (params: Parameters<typeof fetchPublicBrands>[0]) =>
      dispatch(fetchPublicBrands(params)),
    clearBrands: () => dispatch(clearBrands()),
    resetState: () => dispatch(resetBrandsState()),

    // Computed
    isInitialLoading: loading.initial,
    isLoadingMore: loading.loadMore,
    hasMore: pagination.hasMore,
    totalBrands: pagination.totalElements,

    // Dispatch for advanced usage
    dispatch,
  };
};
