# Redux Toolkit Utilities

Reusable utilities for creating standardized, type-safe Redux slices with common patterns.

## Features

✨ **Standardized Structure**: Consistent patterns across all slices
🔒 **Type-Safe**: Full TypeScript support with generic types
🎣 **Hook-Ready**: Pre-built hooks that follow React Rules of Hooks
📦 **Reusable**: Copy-paste templates for rapid development
🧹 **Clean Code**: No more duplicate boilerplate

## Quick Start

### 1. Create Your Slice

```typescript
// src/redux/features/products/slice/product-slice.ts
import { createEntitySlice } from "@/redux/utils";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface ProductFilters {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
}

const productSlice = createEntitySlice<Product, ProductFilters>({
  name: "products",
  initialFilters: {
    search: "",
    category: "",
    minPrice: 0,
    maxPrice: 1000,
  },
  initialPageSize: 20,
});

export const {
  setData,
  setContent,
  addItem,
  updateItem,
  removeItem,
  clearData,
  setLoading,
  setError,
  clearError,
  setFilters,
  resetFilters,
  setPagination,
  setPage,
  setPageSize,
  setOperations,
  setCreating,
  setUpdating,
  setDeleting,
  reset,
} = productSlice.actions;

export default productSlice.reducer;
```

### 2. Create Your Selectors

```typescript
// src/redux/features/products/selectors/product-selectors.ts
import { createEntitySelectors } from "@/redux/utils";
import { RootState } from "@/redux/store";

export const productSelectors = createEntitySelectors<RootState>(
  (state) => state.products
);

// Available selectors:
// - selectState
// - selectData
// - selectContent
// - selectIsLoading
// - selectError
// - selectFilters
// - selectPagination
// - selectCurrentPage
// - selectPageSize
// - selectTotalPages
// - selectTotalItems
// - selectOperations
// - selectIsCreating
// - selectIsUpdating
// - selectIsDeleting
// - selectIsAnyOperationLoading
// - selectHasData
// - selectHasError
// - selectIsEmpty
```

### 3. Create Your Hooks

```typescript
// src/redux/features/products/state/product-state.ts
import { createEntityHooks } from "@/redux/utils";
import { productSelectors } from "../selectors/product-selectors";
import * as productActions from "../slice/product-slice";

export const {
  useEntityState: useProductState,
  useEntityData: useProductData,
  useEntityContent: useProducts,
  useEntityIsLoading: useProductsLoading,
  useEntityError: useProductsError,
  useEntityFilters: useProductFilters,
  useEntityPagination: useProductPagination,
  useEntityOperations: useProductOperations,
  useEntityHasData: useHasProducts,
  useEntityHasError: useHasProductsError,
  useEntityIsEmpty: useProductsEmpty,
  useEntityActions: useProductActions,
  useEntity: useProduct,
} = createEntityHooks({
  selectors: productSelectors,
  actions: productActions,
});
```

### 4. Add to Store

```typescript
// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./features/products/slice/product-slice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    // ... other reducers
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 5. Use in Components

```typescript
// src/app/products/page.tsx
"use client";

import { useProducts, useProductActions, useProductsLoading } from "@/redux/features/products/state/product-state";

export default function ProductsPage() {
  const products = useProducts();
  const isLoading = useProductsLoading();
  const { setFilters, setPage } = useProductActions();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Products</h1>

      {/* Filters */}
      <input
        placeholder="Search..."
        onChange={(e) => setFilters({ search: e.target.value })}
      />

      {/* Product List */}
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}

      {/* Pagination */}
      <button onClick={() => setPage(1)}>Page 1</button>
    </div>
  );
}
```

## Advanced Usage

### Using the Combined Hook

The `useEntity` hook provides everything in one call:

```typescript
function ProductsPage() {
  const {
    content: products,
    isLoading,
    error,
    filters,
    pagination,
    hasData,
    isEmpty,
    actions,
  } = useProduct();

  return (
    <div>
      {isLoading && <Spinner />}
      {error && <Error message={error} />}
      {isEmpty && <EmptyState />}

      {hasData && (
        <ProductList
          products={products}
          onFilterChange={actions.setFilters}
          onPageChange={actions.setPage}
        />
      )}
    </div>
  );
}
```

### Custom Selectors

You can still create custom selectors:

```typescript
// src/redux/features/products/selectors/product-selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import { productSelectors } from "./product-selectors";

// Get products by category
export const selectProductsByCategory = (category: string) =>
  createSelector([productSelectors.selectContent], (products) =>
    products.filter((p) => p.category === category)
  );

// Get total price
export const selectTotalPrice = createSelector(
  [productSelectors.selectContent],
  (products) => products.reduce((sum, p) => sum + p.price, 0)
);
```

### Custom Hooks for Parameterized Selectors

```typescript
// src/redux/features/products/state/product-state.ts
import { useAppSelector } from "@/redux/store";
import { selectProductsByCategory } from "../selectors/product-selectors";

/**
 * Get products filtered by category
 * @param category - Category to filter by
 */
export const useProductsByCategory = (category: string) => {
  return useAppSelector((state) => selectProductsByCategory(category)(state));
};
```

### Async Actions with Thunks

```typescript
// src/redux/features/products/thunks/product-thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setContent, setLoading, setError, setPagination } from "../slice/product-slice";

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (params: { page: number; filters: any }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await fetch(`/api/products?page=${params.page}`);
      const data = await response.json();

      dispatch(setContent(data.items));
      dispatch(setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
      }));

      return data;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Usage in components:
// const { dispatch } = useProductActions();
// dispatch(fetchProducts({ page: 1, filters: {} }));
```

## Migration Guide

### Migrating Existing Slices

If you have existing slices, here's how to migrate:

**Before:**

```typescript
// Old custom slice
const brandSlice = createSlice({
  name: "brand",
  initialState: {
    data: null,
    content: [],
    loading: false,
    error: null,
    // ... custom fields
  },
  reducers: {
    // ... many custom reducers
  },
});
```

**After:**

```typescript
// New standardized slice
const brandSlice = createEntitySlice<Brand, BrandFilters>({
  name: "brand",
  initialFilters: { search: "" },
});

// If you need custom reducers, you can still add them:
const enhancedBrandSlice = createSlice({
  name: "brand",
  initialState: createEntitySlice<Brand, BrandFilters>({
    name: "brand",
    initialFilters: { search: "" },
  }).getInitialState(),
  reducers: {
    ...createEntitySlice<Brand, BrandFilters>({
      name: "brand",
      initialFilters: { search: "" },
    }).caseReducers,
    // Add your custom reducers here
    customAction: (state) => {
      // custom logic
    },
  },
});
```

## Best Practices

### ✅ DO

- Call hooks at the component top level
- Use specific hooks for what you need (e.g., `useProducts()` instead of `useProduct().content`)
- Create custom hooks for parameterized selectors
- Use the combined hook (`useEntity`) when you need multiple pieces of state
- Keep filters and pagination in Redux for persistence

### ❌ DON'T

- Call hooks inside loops, conditions, or nested functions
- Return functions that call hooks from other hooks
- Use hooks in non-React functions
- Mutate state directly (always use actions)

### Example of What NOT to Do

```typescript
// ❌ BAD - Don't do this!
export const useBadHook = () => {
  const dispatch = useAppDispatch();

  return {
    // ❌ This function calls a hook - violates Rules of Hooks!
    getProducts: () => useAppSelector(selectProducts),
  };
};

// ✅ GOOD - Do this instead!
export const useProducts = () => {
  return useAppSelector(selectProducts);
};
```

## File Structure

Recommended structure for features:

```
src/redux/features/products/
├── slice/
│   └── product-slice.ts       # Slice definition
├── selectors/
│   └── product-selectors.ts   # Selectors
├── state/
│   └── product-state.ts       # Hooks
├── thunks/                    # Optional
│   └── product-thunks.ts      # Async actions
└── types/                     # Optional
    └── product-types.ts       # Type definitions
```

## Type Safety

All utilities are fully typed:

```typescript
// TypeScript will infer all types correctly
const products = useProducts(); // Type: Product[]
const filters = useProductFilters(); // Type: ProductFilters
const actions = useProductActions(); // Type: All action creators

// Custom types work seamlessly
interface MyProduct {
  id: string;
  customField: string;
}

const slice = createEntitySlice<MyProduct>({
  name: "myProducts",
  initialFilters: {},
});
```

## Performance

All selectors use `createSelector` for memoization:

```typescript
// This won't cause re-renders unless products actually change
const products = useProducts();

// Pagination changes won't re-render components using products
const pagination = useProductPagination();
```

## Summary

1. **Create Slice**: Use `createEntitySlice` for standardized state
2. **Create Selectors**: Use `createEntitySelectors` for memoized selectors
3. **Create Hooks**: Use `createEntityHooks` for React hooks
4. **Use in Components**: Import and use hooks at top level
5. **Extend as Needed**: Add custom selectors and hooks for specific use cases

This pattern ensures:
- ✅ No hook errors
- ✅ Consistent code structure
- ✅ Easy to copy and reuse
- ✅ Type-safe
- ✅ Performant with memoization
- ✅ Scalable for any data type
