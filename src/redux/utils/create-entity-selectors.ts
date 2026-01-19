/**
 * Redux Toolkit Entity Selectors Factory
 *
 * Creates standardized selectors for entity slices
 *
 * @example
 * ```ts
 * import { createEntitySelectors } from '@/redux/utils/create-entity-selectors';
 * import { RootState } from '@/redux/store';
 *
 * export const productSelectors = createEntitySelectors<RootState, 'products'>(
 *   (state) => state.products
 * );
 *
 * // Usage in components:
 * const products = useAppSelector(productSelectors.selectContent);
 * const isLoading = useAppSelector(productSelectors.selectIsLoading);
 * const filters = useAppSelector(productSelectors.selectFilters);
 * ```
 */

import { createSelector } from "@reduxjs/toolkit";
import { EntityState } from "./create-entity-slice";

export interface EntitySelectors<TState, TData = any, TFilters = any> {
  // Base selector
  selectState: (state: TState) => EntityState<TData, TFilters>;

  // Data selectors
  selectData: (state: TState) => TData | null;
  selectContent: (state: TState) => TData[];
  selectIsLoading: (state: TState) => boolean;
  selectError: (state: TState) => string | null;

  // Filter selectors
  selectFilters: (state: TState) => TFilters;

  // Pagination selectors
  selectPagination: (state: TState) => EntityState<TData, TFilters>["pagination"];
  selectCurrentPage: (state: TState) => number;
  selectPageSize: (state: TState) => number;
  selectTotalPages: (state: TState) => number;
  selectTotalItems: (state: TState) => number;

  // Operation selectors
  selectOperations: (state: TState) => EntityState<TData, TFilters>["operations"];
  selectIsCreating: (state: TState) => boolean;
  selectIsUpdating: (state: TState) => boolean;
  selectIsDeleting: (state: TState) => boolean;
  selectIsAnyOperationLoading: (state: TState) => boolean;

  // Computed selectors
  selectHasData: (state: TState) => boolean;
  selectHasError: (state: TState) => boolean;
  selectIsEmpty: (state: TState) => boolean;
}

/**
 * Creates a complete set of selectors for an entity slice
 */
export function createEntitySelectors<
  TState,
  TData = any,
  TFilters = any
>(
  selectSlice: (state: TState) => EntityState<TData, TFilters>
): EntitySelectors<TState, TData, TFilters> {
  // Base selector
  const selectState = selectSlice;

  // Data selectors
  const selectData = createSelector([selectState], (state) => state.data);

  const selectContent = createSelector([selectState], (state) => state.content);

  const selectIsLoading = createSelector(
    [selectState],
    (state) => state.isLoading
  );

  const selectError = createSelector([selectState], (state) => state.error);

  // Filter selectors
  const selectFilters = createSelector([selectState], (state) => state.filters);

  // Pagination selectors
  const selectPagination = createSelector(
    [selectState],
    (state) => state.pagination
  );

  const selectCurrentPage = createSelector(
    [selectPagination],
    (pagination) => pagination.currentPage
  );

  const selectPageSize = createSelector(
    [selectPagination],
    (pagination) => pagination.pageSize
  );

  const selectTotalPages = createSelector(
    [selectPagination],
    (pagination) => pagination.totalPages
  );

  const selectTotalItems = createSelector(
    [selectPagination],
    (pagination) => pagination.totalItems
  );

  // Operation selectors
  const selectOperations = createSelector(
    [selectState],
    (state) => state.operations
  );

  const selectIsCreating = createSelector(
    [selectOperations],
    (operations) => operations.isCreating
  );

  const selectIsUpdating = createSelector(
    [selectOperations],
    (operations) => operations.isUpdating
  );

  const selectIsDeleting = createSelector(
    [selectOperations],
    (operations) => operations.isDeleting
  );

  const selectIsAnyOperationLoading = createSelector(
    [selectOperations],
    (operations) =>
      operations.isCreating || operations.isUpdating || operations.isDeleting
  );

  // Computed selectors
  const selectHasData = createSelector(
    [selectContent],
    (content) => content.length > 0
  );

  const selectHasError = createSelector(
    [selectError],
    (error) => error !== null
  );

  const selectIsEmpty = createSelector(
    [selectContent, selectIsLoading],
    (content, isLoading) => content.length === 0 && !isLoading
  );

  return {
    selectState,
    selectData,
    selectContent,
    selectIsLoading,
    selectError,
    selectFilters,
    selectPagination,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectTotalItems,
    selectOperations,
    selectIsCreating,
    selectIsUpdating,
    selectIsDeleting,
    selectIsAnyOperationLoading,
    selectHasData,
    selectHasError,
    selectIsEmpty,
  };
}
