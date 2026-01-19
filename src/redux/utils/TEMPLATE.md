# Redux Feature Template

Copy this template to create new Redux features quickly.

## Quick Copy-Paste Template

Replace `{FeatureName}` with your feature name (e.g., Product, Category, User)
Replace `{featureName}` with camelCase version (e.g., product, category, user)
Replace `{feature-name}` with kebab-case version (e.g., product, category, user)

---

### 1. Types Definition (Optional)

```typescript
// src/redux/features/{feature-name}/types/{feature-name}-types.ts

export interface {FeatureName} {
  id: string;
  name: string;
  // Add your fields here
}

export interface {FeatureName}Filters {
  search: string;
  // Add your filter fields here
}
```

---

### 2. Slice Definition

```typescript
// src/redux/features/{feature-name}/slice/{feature-name}-slice.ts

import { createEntitySlice } from "@/redux/utils";

export interface {FeatureName} {
  id: string;
  name: string;
  // Add your fields here
}

export interface {FeatureName}Filters {
  search: string;
  status?: string;
  // Add your filter fields here
}

const {featureName}Slice = createEntitySlice<{FeatureName}, {FeatureName}Filters>({
  name: "{featureName}",
  initialFilters: {
    search: "",
    status: "",
  },
  initialPageSize: 10, // Optional, defaults to 10
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
} = {featureName}Slice.actions;

export default {featureName}Slice.reducer;
```

---

### 3. Selectors

```typescript
// src/redux/features/{feature-name}/selectors/{feature-name}-selectors.ts

import { createEntitySelectors } from "@/redux/utils";
import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

// Create base selectors
export const {featureName}Selectors = createEntitySelectors<RootState>(
  (state) => state.{featureName}
);

// Re-export commonly used selectors for convenience
export const {
  selectState: select{FeatureName}State,
  selectData: select{FeatureName}Data,
  selectContent: select{FeatureName}Content,
  selectIsLoading: select{FeatureName}Loading,
  selectError: select{FeatureName}Error,
  selectFilters: select{FeatureName}Filters,
  selectPagination: select{FeatureName}Pagination,
  selectOperations: select{FeatureName}Operations,
  selectHasData: selectHas{FeatureName}Data,
  selectIsEmpty: select{FeatureName}Empty,
} = {featureName}Selectors;

// Add custom selectors here (optional)
// export const select{FeatureName}ById = (id: string) =>
//   createSelector([select{FeatureName}Content], ({featureName}s) =>
//     {featureName}s.find((item) => item.id === id)
//   );
```

---

### 4. Hooks

```typescript
// src/redux/features/{feature-name}/state/{feature-name}-state.ts

import { createEntityHooks } from "@/redux/utils";
import { {featureName}Selectors } from "../selectors/{feature-name}-selectors";
import * as {featureName}Actions from "../slice/{feature-name}-slice";
import { useAppSelector } from "@/redux/store";
// import { select{FeatureName}ById } from "../selectors/{feature-name}-selectors"; // If you have custom selectors

// Create base hooks
export const {
  useEntityState: use{FeatureName}State,
  useEntityData: use{FeatureName}Data,
  useEntityContent: use{FeatureName}s,
  useEntityIsLoading: use{FeatureName}sLoading,
  useEntityError: use{FeatureName}sError,
  useEntityFilters: use{FeatureName}Filters,
  useEntityPagination: use{FeatureName}Pagination,
  useEntityOperations: use{FeatureName}Operations,
  useEntityHasData: useHas{FeatureName}s,
  useEntityHasError: useHas{FeatureName}sError,
  useEntityIsEmpty: use{FeatureName}sEmpty,
  useEntityActions: use{FeatureName}Actions,
  useEntity: use{FeatureName},
} = createEntityHooks({
  selectors: {featureName}Selectors,
  actions: {featureName}Actions,
});

// Add custom hooks here (optional)
// export const use{FeatureName}ById = (id: string) => {
//   return useAppSelector((state) => select{FeatureName}ById(id)(state));
// };
```

---

### 5. Add to Store

```typescript
// src/redux/store.ts

import { configureStore } from "@reduxjs/toolkit";
import {featureName}Reducer from "./features/{feature-name}/slice/{feature-name}-slice";
// ... other imports

export const store = configureStore({
  reducer: {
    {featureName}: {featureName}Reducer,
    // ... other reducers
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

### 6. Usage in Components

```typescript
// src/app/{feature-name}/page.tsx
"use client";

import {
  use{FeatureName}s,
  use{FeatureName}sLoading,
  use{FeatureName}Actions,
  use{FeatureName}Filters,
  use{FeatureName}Pagination,
} from "@/redux/features/{feature-name}/state/{feature-name}-state";

export default function {FeatureName}sPage() {
  // Get state
  const {featureName}s = use{FeatureName}s();
  const isLoading = use{FeatureName}sLoading();
  const filters = use{FeatureName}Filters();
  const pagination = use{FeatureName}Pagination();

  // Get actions
  const { setFilters, setPage, setContent, setLoading } = use{FeatureName}Actions();

  // Fetch data (example)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/{feature-name}');
        const data = await response.json();
        setContent(data.items);
        setPagination({
          totalPages: data.totalPages,
          totalItems: data.totalItems,
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, pagination.currentPage]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{FeatureName}s</h1>

      {/* Filters */}
      <input
        type="text"
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
      />

      {/* List */}
      <div>
        {{featureName}s.map((item) => (
          <div key={item.id}>
            <h2>{item.name}</h2>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div>
        <button
          disabled={pagination.currentPage === 1}
          onClick={() => setPage(pagination.currentPage - 1)}
        >
          Previous
        </button>
        <span>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => setPage(pagination.currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

---

### 7. Alternative: Using Combined Hook

```typescript
// Simpler approach using the combined hook
"use client";

import { use{FeatureName} } from "@/redux/features/{feature-name}/state/{feature-name}-state";

export default function {FeatureName}sPage() {
  const {
    content: {featureName}s,
    isLoading,
    error,
    filters,
    pagination,
    isEmpty,
    actions,
  } = use{FeatureName}();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (isEmpty) return <div>No {featureName}s found</div>;

  return (
    <div>
      <h1>{FeatureName}s</h1>

      <input
        type="text"
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => actions.setFilters({ search: e.target.value })}
      />

      <div>
        {{featureName}s.map((item) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>

      <button onClick={() => actions.setPage(pagination.currentPage - 1)}>
        Previous
      </button>
      <button onClick={() => actions.setPage(pagination.currentPage + 1)}>
        Next
      </button>
    </div>
  );
}
```

---

## Checklist

- [ ] Copy slice definition
- [ ] Copy selectors
- [ ] Copy hooks
- [ ] Add reducer to store
- [ ] Replace `{FeatureName}`, `{featureName}`, `{feature-name}`
- [ ] Define your interface fields
- [ ] Define your filter fields
- [ ] Set initial filter values
- [ ] Use hooks in components
- [ ] Test that everything works

## File Structure

```
src/redux/features/{feature-name}/
├── slice/
│   └── {feature-name}-slice.ts
├── selectors/
│   └── {feature-name}-selectors.ts
├── state/
│   └── {feature-name}-state.ts
└── types/ (optional)
    └── {feature-name}-types.ts
```

Done! You now have a fully functional Redux feature with:
- ✅ Type-safe state management
- ✅ Pagination
- ✅ Filtering
- ✅ Loading states
- ✅ Error handling
- ✅ CRUD operations
- ✅ React hooks that follow Rules of Hooks
