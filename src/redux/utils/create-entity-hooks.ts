/**
 * Redux Toolkit Entity Hooks Factory
 *
 * Creates standardized hooks for entity slices that follow React Rules of Hooks
 *
 * @example
 * ```ts
 * import { createEntityHooks } from '@/redux/utils/create-entity-hooks';
 * import { productSelectors } from '../selectors/product-selectors';
 * import * as productActions from '../slice/product-slice';
 *
 * export const {
 *   useEntityState: useProductState,
 *   useEntityData: useProductData,
 *   useEntityContent: useProductContent,
 *   useEntityActions: useProductActions,
 * } = createEntityHooks({
 *   selectors: productSelectors,
 *   actions: productActions,
 * });
 *
 * // Usage in components:
 * function ProductList() {
 *   const products = useProductContent();
 *   const { setFilters, setPage } = useProductActions();
 *
 *   return <div>...</div>;
 * }
 * ```
 */

import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { EntitySelectors } from "./create-entity-selectors";
import { EntityState } from "./create-entity-slice";

export interface EntityHooksConfig<TState, TData, TFilters, TActions> {
  selectors: EntitySelectors<TState, TData, TFilters>;
  actions: TActions;
}

export interface EntityHooks<TState, TData, TFilters, TActions> {
  // State hooks
  useEntityState: () => EntityState<TData, TFilters>;
  useEntityData: () => TData | null;
  useEntityContent: () => TData[];
  useEntityIsLoading: () => boolean;
  useEntityError: () => string | null;
  useEntityFilters: () => TFilters;
  useEntityPagination: () => EntityState<TData, TFilters>["pagination"];
  useEntityOperations: () => EntityState<TData, TFilters>["operations"];

  // Computed state hooks
  useEntityHasData: () => boolean;
  useEntityHasError: () => boolean;
  useEntityIsEmpty: () => boolean;

  // Actions hook
  useEntityActions: () => TActions & {
    dispatch: ReturnType<typeof useAppDispatch>;
  };

  // Combined hook (most commonly used)
  useEntity: () => {
    state: EntityState<TData, TFilters>;
    data: TData | null;
    content: TData[];
    isLoading: boolean;
    error: string | null;
    filters: TFilters;
    pagination: EntityState<TData, TFilters>["pagination"];
    operations: EntityState<TData, TFilters>["operations"];
    hasData: boolean;
    hasError: boolean;
    isEmpty: boolean;
    actions: TActions & { dispatch: ReturnType<typeof useAppDispatch> };
  };
}

/**
 * Creates a complete set of hooks for an entity slice
 * All hooks follow React Rules of Hooks and can be safely called at component top level
 */
export function createEntityHooks<TState, TData = any, TFilters = any, TActions = any>({
  selectors,
  actions,
}: EntityHooksConfig<TState, TData, TFilters, TActions>): EntityHooks<
  TState,
  TData,
  TFilters,
  TActions
> {
  // State hooks
  const useEntityState = () => useAppSelector(selectors.selectState);
  const useEntityData = () => useAppSelector(selectors.selectData);
  const useEntityContent = () => useAppSelector(selectors.selectContent);
  const useEntityIsLoading = () => useAppSelector(selectors.selectIsLoading);
  const useEntityError = () => useAppSelector(selectors.selectError);
  const useEntityFilters = () => useAppSelector(selectors.selectFilters);
  const useEntityPagination = () => useAppSelector(selectors.selectPagination);
  const useEntityOperations = () => useAppSelector(selectors.selectOperations);

  // Computed state hooks
  const useEntityHasData = () => useAppSelector(selectors.selectHasData);
  const useEntityHasError = () => useAppSelector(selectors.selectHasError);
  const useEntityIsEmpty = () => useAppSelector(selectors.selectIsEmpty);

  // Actions hook
  const useEntityActions = () => {
    const dispatch = useAppDispatch();

    return useMemo(() => {
      // Wrap all actions with dispatch
      const wrappedActions = Object.keys(actions).reduce((acc, key) => {
        const action = (actions as any)[key];
        if (typeof action === "function") {
          acc[key] = (...args: any[]) => dispatch(action(...args));
        }
        return acc;
      }, {} as any);

      return {
        ...wrappedActions,
        dispatch,
      };
    }, [dispatch]);
  };

  // Combined hook
  const useEntity = () => {
    const state = useEntityState();
    const data = useEntityData();
    const content = useEntityContent();
    const isLoading = useEntityIsLoading();
    const error = useEntityError();
    const filters = useEntityFilters();
    const pagination = useEntityPagination();
    const operations = useEntityOperations();
    const hasData = useEntityHasData();
    const hasError = useEntityHasError();
    const isEmpty = useEntityIsEmpty();
    const entityActions = useEntityActions();

    return {
      state,
      data,
      content,
      isLoading,
      error,
      filters,
      pagination,
      operations,
      hasData,
      hasError,
      isEmpty,
      actions: entityActions,
    };
  };

  return {
    useEntityState,
    useEntityData,
    useEntityContent,
    useEntityIsLoading,
    useEntityError,
    useEntityFilters,
    useEntityPagination,
    useEntityOperations,
    useEntityHasData,
    useEntityHasError,
    useEntityIsEmpty,
    useEntityActions,
    useEntity,
  };
}

/**
 * Helper to create bound actions that don't require dispatch
 */
export function useEntityActionsHelper<TActions extends Record<string, any>>(
  actions: TActions
): TActions & { dispatch: ReturnType<typeof useAppDispatch> } {
  const dispatch = useAppDispatch();

  return useMemo(() => {
    const boundActions = Object.keys(actions).reduce((acc, key) => {
      const action = actions[key];
      if (typeof action === "function") {
        acc[key] = (...args: any[]) => dispatch(action(...args));
      }
      return acc;
    }, {} as any);

    return {
      ...boundActions,
      dispatch,
    };
  }, [dispatch]);
}
