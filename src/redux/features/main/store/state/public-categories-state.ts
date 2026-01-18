/**
 * Public Categories State Hook
 */

import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectCategories,
  selectCategoriesPagination,
  selectCategoriesLoading,
  selectCategoriesError,
  selectCategoriesLoaded,
} from "../selectors/public-categories-selectors";
import {
  clearCategories,
  resetCategoriesState,
} from "../slice/public-categories-slice";
import { fetchPublicCategories } from "../thunks/public-categories-thunks";

export const usePublicCategoriesState = () => {
  const dispatch = useAppDispatch();

  const categories = useAppSelector(selectCategories);
  const pagination = useAppSelector(selectCategoriesPagination);
  const loading = useAppSelector(selectCategoriesLoading);
  const error = useAppSelector(selectCategoriesError);
  const loaded = useAppSelector(selectCategoriesLoaded);

  return {
    // State
    categories,
    pagination,
    loading,
    error,
    loaded,

    // Actions
    fetchCategories: (params: Parameters<typeof fetchPublicCategories>[0]) =>
      dispatch(fetchPublicCategories(params)),
    clearCategories: () => dispatch(clearCategories()),
    resetState: () => dispatch(resetCategoriesState()),

    // Computed
    isInitialLoading: loading.initial,
    isLoadingMore: loading.loadMore,
    hasMore: pagination.hasMore,
    totalCategories: pagination.totalElements,

    // Dispatch for advanced usage
    dispatch,
  };
};
