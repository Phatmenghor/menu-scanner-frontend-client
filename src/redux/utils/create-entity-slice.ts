/**
 * Redux Toolkit Entity Slice Factory
 *
 * Reusable factory for creating standardized Redux slices with common patterns:
 * - CRUD operations
 * - Pagination
 * - Filtering
 * - Loading states
 * - Error handling
 *
 * @example
 * ```ts
 * import { createEntitySlice } from '@/redux/utils/create-entity-slice';
 *
 * interface Product {
 *   id: string;
 *   name: string;
 * }
 *
 * const productSlice = createEntitySlice<Product>({
 *   name: 'products',
 *   initialFilters: { search: '', category: '' }
 * });
 *
 * export const {
 *   setData,
 *   setFilters,
 *   resetFilters,
 *   setPage,
 *   setLoading,
 *   setError
 * } = productSlice.actions;
 *
 * export default productSlice.reducer;
 * ```
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface OperationsState {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface EntityState<TData = any, TFilters = any> {
  data: TData | null;
  content: TData[];
  isLoading: boolean;
  error: string | null;
  filters: TFilters;
  pagination: PaginationState;
  operations: OperationsState;
}

export interface EntitySliceConfig<TFilters = any> {
  name: string;
  initialFilters: TFilters;
  initialPageSize?: number;
}

const createInitialPagination = (pageSize: number = 10): PaginationState => ({
  currentPage: 1,
  pageSize,
  totalPages: 0,
  totalItems: 0,
});

const createInitialOperations = (): OperationsState => ({
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
});

/**
 * Creates a standardized entity slice with common CRUD patterns
 */
export function createEntitySlice<TData = any, TFilters = any>({
  name,
  initialFilters,
  initialPageSize = 10,
}: EntitySliceConfig<TFilters>) {
  const initialState: EntityState<TData, TFilters> = {
    data: null,
    content: [],
    isLoading: false,
    error: null,
    filters: initialFilters,
    pagination: createInitialPagination(initialPageSize),
    operations: createInitialOperations(),
  };

  return createSlice({
    name,
    initialState,
    reducers: {
      // Data Management
      setData: (state, action: PayloadAction<TData | null>) => {
        state.data = action.payload;
      },

      setContent: (state, action: PayloadAction<TData[]>) => {
        state.content = action.payload;
      },

      addItem: (state, action: PayloadAction<TData>) => {
        state.content.push(action.payload);
      },

      updateItem: (
        state,
        action: PayloadAction<{ index: number; data: Partial<TData> }>
      ) => {
        const { index, data } = action.payload;
        if (state.content[index]) {
          state.content[index] = { ...state.content[index], ...data };
        }
      },

      removeItem: (state, action: PayloadAction<number>) => {
        state.content.splice(action.payload, 1);
      },

      clearData: (state) => {
        state.data = null;
        state.content = [];
      },

      // Loading States
      setLoading: (state, action: PayloadAction<boolean>) => {
        state.isLoading = action.payload;
      },

      // Error Handling
      setError: (state, action: PayloadAction<string | null>) => {
        state.error = action.payload;
      },

      clearError: (state) => {
        state.error = null;
      },

      // Filters
      setFilters: (state, action: PayloadAction<Partial<TFilters>>) => {
        state.filters = { ...state.filters, ...action.payload };
      },

      resetFilters: (state) => {
        state.filters = initialFilters;
        state.pagination.currentPage = 1;
      },

      // Pagination
      setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
        state.pagination = { ...state.pagination, ...action.payload };
      },

      setPage: (state, action: PayloadAction<number>) => {
        state.pagination.currentPage = action.payload;
      },

      setPageSize: (state, action: PayloadAction<number>) => {
        state.pagination.pageSize = action.payload;
        state.pagination.currentPage = 1;
      },

      // Operations
      setOperations: (
        state,
        action: PayloadAction<Partial<OperationsState>>
      ) => {
        state.operations = { ...state.operations, ...action.payload };
      },

      setCreating: (state, action: PayloadAction<boolean>) => {
        state.operations.isCreating = action.payload;
      },

      setUpdating: (state, action: PayloadAction<boolean>) => {
        state.operations.isUpdating = action.payload;
      },

      setDeleting: (state, action: PayloadAction<boolean>) => {
        state.operations.isDeleting = action.payload;
      },

      // Reset
      reset: () => initialState,
    },
  });
}
