# DataTable Page Size Selector - Usage Guide

## Overview

The `DataTableWithPagination` component now includes a page size selector that allows users to choose how many rows to display per page. The selected page size is stored in cookies and persists across all admin tables.

## Features

✅ **Page Size Selector** - Dropdown to select rows per page (10, 20, 50, 100)
✅ **Cookie Storage** - User's preference persists across sessions and all tables
✅ **Customizable Options** - Configure available page size options
✅ **Responsive Design** - Works on all screen sizes
✅ **Consistent UX** - Same page size across all admin tables

## Quick Start

### 1. Import the Hook

```tsx
import { usePageSize } from "@/hooks/use-page-size";
```

### 2. Use in Your Component

```tsx
export function MyTable() {
  const [pageSize, setPageSize] = usePageSize(); // Default: 10
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <DataTableWithPagination
      data={data}
      columns={columns}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      // ... other props
    />
  );
}
```

## Complete Example

```tsx
"use client";

import { useState, useEffect } from "react";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { usePageSize } from "@/hooks/use-page-size";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchProducts } from "@/redux/features/products/thunks";

interface Product {
  id: string;
  name: string;
  price: number;
}

export function ProductTable() {
  const dispatch = useAppDispatch();

  // Page size with cookie storage
  const [pageSize, setPageSize] = usePageSize(20); // Default: 20

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data
  useEffect(() => {
    dispatch(fetchProducts({
      search: searchTerm,
      pageNo: currentPage,
      pageSize: pageSize, // Use the pageSize from hook
    }));
  }, [currentPage, pageSize, searchTerm, dispatch]);

  // Get data from Redux
  const { data, loading, totalPages } = useAppSelector((state) => state.products);

  // Define columns
  const columns: TableColumn<Product>[] = [
    {
      key: "name",
      label: "Product Name",
      truncate: true,
      maxWidth: "300px",
    },
    {
      key: "price",
      label: "Price",
      render: (item) => `$${item.price.toFixed(2)}`,
    },
  ];

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize); // Saves to cookie automatically
    setCurrentPage(1); // Reset to first page when page size changes
  };

  return (
    <DataTableWithPagination
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      emptyMessage="No products found"
      paginationSize="md"
      showPagination={true}
      showPageSizeSelector={true} // Show the selector (default: true)
      pageSizeOptions={[10, 20, 50, 100]} // Available options (default)
    />
  );
}
```

## Props Reference

### New Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageSize` | `number` | **Required** | Current page size |
| `onPageSizeChange` | `(size: number) => void` | **Required** | Callback when page size changes |
| `pageSizeOptions` | `number[]` | `[10, 20, 50, 100]` | Available page size options |
| `showPageSizeSelector` | `boolean` | `true` | Show/hide the page size selector |

### Existing Props (No Changes)

All existing props work exactly the same:
- `data`, `columns`, `loading`, `emptyMessage`, etc.
- `currentPage`, `totalPages`, `onPageChange`
- `paginationSize`, `showPagination`

## Custom Page Size Options

You can customize the available page size options:

```tsx
<DataTableWithPagination
  // ... other props
  pageSizeOptions={[5, 15, 25, 50, 200]} // Custom options
/>
```

## Custom Default Page Size

Set a different default page size:

```tsx
const [pageSize, setPageSize] = usePageSize(50); // Default: 50
```

## Hide Page Size Selector

If you don't want to show the selector on a specific table:

```tsx
<DataTableWithPagination
  // ... other props
  showPageSizeSelector={false}
/>
```

## Important: Reset Page When Size Changes

Always reset to page 1 when page size changes to avoid edge cases:

```tsx
const handlePageSizeChange = (newSize: number) => {
  setPageSize(newSize);
  setCurrentPage(1); // ← Important!
};
```

## Cookie Details

- **Cookie Name**: `admin_table_page_size`
- **Expires**: 1 year
- **Scope**: All admin tables
- **Storage**: Browser cookies (not localStorage)

## Migration Guide

### Before (Old Code)

```tsx
export function MyTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Hardcoded

  return (
    <DataTableWithPagination
      // ... props
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    />
  );
}
```

### After (New Code)

```tsx
import { usePageSize } from "@/hooks/use-page-size";

export function MyTable() {
  const [pageSize, setPageSize] = usePageSize();
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <DataTableWithPagination
      // ... props
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
```

## Visual Layout

```
┌────────────────────────────────────────────────────────────┐
│                     Data Table                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Column 1 │ Column 2 │ Column 3 │                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Row 1                                                 │  │
│  │ Row 2                                                 │  │
│  │ ...                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Rows per page: [10 ▼]      [◀ Prev] 1 2 3 [Next ▶]│   │
│  │  └─ Page Size                └─ Page Navigation     │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

## Best Practices

1. **Always use `usePageSize` hook** - Don't hardcode page sizes
2. **Reset to page 1** when page size changes
3. **Same options everywhere** - Use the default `[10, 20, 50, 100]` for consistency
4. **Don't hide selector** unless you have a good reason
5. **Update API calls** - Make sure to pass `pageSize` to your API

## Troubleshooting

### Page size doesn't persist

**Problem**: Page size resets to default on refresh

**Solution**: Make sure you're using the `usePageSize` hook, not `useState`

```tsx
// ❌ Wrong
const [pageSize, setPageSize] = useState(10);

// ✅ Correct
const [pageSize, setPageSize] = usePageSize(10);
```

### Showing wrong number of rows

**Problem**: Table shows 10 rows even though page size is set to 20

**Solution**: Make sure you're passing `pageSize` to your API call:

```tsx
useEffect(() => {
  dispatch(fetchData({
    pageNo: currentPage,
    pageSize: pageSize, // ← Make sure this is included!
  }));
}, [currentPage, pageSize]);
```

### Page selector not showing

**Problem**: Can't see the page size selector

**Solution 1**: Make sure `showPagination` is true and `totalPages > 1`

```tsx
<DataTableWithPagination
  showPagination={true}
  showPageSizeSelector={true}
  totalPages={totalPages} // Must be > 1
  // ...
/>
```

**Solution 2**: Check if you explicitly set `showPageSizeSelector={false}`

## Questions?

The page size selector is now integrated into all admin tables for a consistent user experience. The user's preference is stored in cookies and persists across all tables in the admin panel.
