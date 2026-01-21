# BaseCombobox - Create Any Combobox in Minutes

A powerful, reusable base component for creating custom comboboxes with minimal code. All existing comboboxes now use this base component!

## Why Use BaseCombobox?

- **Write Less Code**: Create a new combobox in ~20 lines instead of ~250 lines
- **Consistent Behavior**: All comboboxes work the same way
- **Highly Customizable**: Support for pagination, search, custom options, custom rendering, and more
- **Type Safe**: Full TypeScript generic support
- **Edit Mode Fixed**: Properly displays values even before data loads

## Quick Example

Here's how easy it is to create a new combobox:

```typescript
"use client";

import { BaseCombobox, BaseComboboxProps } from "./base-combobox";
import { useAppDispatch } from "@/redux/store";
import { MyDataType } from "@/types";
import { fetchMyDataService } from "@/services";

interface ComboboxSelectMyDataProps
  extends Omit<
    BaseComboboxProps<MyDataType>,
    "fetchData" | "getDisplayValue" | "getItemId" | "getItemValue" | "value" | "onValueChange"
  > {
  dataSelect: MyDataType | null;
  onChangeSelected: (item: MyDataType | null) => void;
}

export function ComboboxSelectMyData({
  dataSelect,
  onChangeSelected,
  ...props
}: ComboboxSelectMyDataProps) {
  const dispatch = useAppDispatch();

  const fetchData = async ({ search, pageNo, pageSize = 10 }) => {
    const result = await dispatch(
      fetchMyDataService({ search, pageNo, pageSize })
    ).unwrap();

    return {
      content: result?.content || [],
      pageNo: result?.pageNo || pageNo,
      last: result?.last || true,
    };
  };

  return (
    <BaseCombobox<MyDataType>
      {...props}
      value={dataSelect}
      onValueChange={onChangeSelected}
      fetchData={fetchData}
      getDisplayValue={(item) => item.name}
      getItemId={(item) => item.id}
      getItemValue={(item) => item.name}
      placeholder="Select..."
      searchPlaceholder="Search..."
      emptyMessage="No items found."
      label="My Data"
    />
  );
}
```

That's it! Your combobox is ready with:
- ✅ Infinite scroll pagination
- ✅ Search/filter
- ✅ Loading states
- ✅ Error handling
- ✅ Accessibility
- ✅ Edit mode support

## Real Examples From This Project

### Example 1: Simple Combobox (Schedule Type)

**Location**: `combobox_select_schedule_type.tsx`

This is the simplest case - just map data to display:

```typescript
export function ComboboxSelectScheduleType({
  value,
  onValueChange,
  ...props
}: ComboboxSelectScheduleTypeProps) {
  const dispatch = useAppDispatch();

  const fetchScheduleTypes = async ({ search, pageNo }) => {
    const result = await dispatch(
      fetchAllWorkSchedulesTypeService({ search, pageNo })
    ).unwrap();

    return {
      content: result?.content || [],
      pageNo: result?.pageNo || pageNo,
      last: result?.last || true,
    };
  };

  // Convert string value to object for BaseCombobox
  const scheduleTypeValue: ScheduleType | null = value
    ? { enumName: value, id: value }
    : null;

  const handleValueChange = (item: ScheduleType | null) => {
    onValueChange(item?.enumName || "");
  };

  return (
    <BaseCombobox<ScheduleType>
      {...props}
      value={scheduleTypeValue}
      onValueChange={handleValueChange}
      fetchData={fetchScheduleTypes}
      getDisplayValue={(item) => item.enumName}
      getItemId={(item) => item.id}
      getItemValue={(item) => item.enumName}
      placeholder="Select schedule type..."
      label="Schedule Type"
      enablePagination={false}  // No pagination needed
    />
  );
}
```

**Key Points:**
- No pagination (small dataset)
- String value conversion for simpler parent API
- ~70 lines vs ~200+ lines before

### Example 2: With "All" Option (Brand/Category)

**Location**: `combobox_select_brand.tsx`, `combobox_select_categories.tsx`

Add a special "All" option for filters:

```typescript
const ALL_OPTION: BrandResponseModel = {
  id: "all",
  name: "All",
  description: "",
} as unknown as BrandResponseModel;

export function ComboboxSelectBrand({
  dataSelect,
  onChangeSelected,
  showAllOption = true,
  ...props
}: ComboboxSelectBrandProps) {
  const dispatch = useAppDispatch();

  const fetchBrands = async ({ search, pageNo, pageSize = 10 }) => {
    const result = await dispatch(
      fetchAllBrandService({ search, pageNo, pageSize })
    ).unwrap();

    return {
      content: result?.content || [],
      pageNo: result?.pageNo || pageNo,
      last: result?.last || true,
    };
  };

  return (
    <BaseCombobox<BrandResponseModel>
      {...props}
      value={dataSelect}
      onValueChange={onChangeSelected}
      fetchData={fetchBrands}
      getDisplayValue={(item) => item.name}
      getItemId={(item) => item.id}
      getItemValue={(item) => item.name}
      customOptions={showAllOption ? [ALL_OPTION] : []}
      showCustomOptions={showAllOption}
      isCustomOption={(item) => item.id === "all"}
      label="Brand"
      labelClassName="text-[12px] font-normal text-gray-300"
      enablePagination={true}
      fetchOnMount={true}
    />
  );
}
```

**Key Points:**
- Custom "All" option at the top
- Pagination enabled
- Fetch on mount for immediate use
- ~80 lines vs ~250+ lines before

### Example 3: Custom Item Rendering (User)

**Location**: `combobox_select_user.tsx`

Show extra info (roles) in the dropdown:

```typescript
export function ComboboxSelectUser({
  dataSelect,
  onChangeSelected,
  ...props
}: ComboboxSelectUserProps) {
  const dispatch = useAppDispatch();

  const fetchUsers = async ({ search, pageNo, pageSize = 10 }) => {
    const result = await dispatch(
      fetchAllUsersService({ search, pageNo, pageSize })
    ).unwrap();

    return {
      content: result?.content || [],
      pageNo: result?.pageNo || pageNo,
      last: result?.last || true,
    };
  };

  // Custom render to show user roles in the list
  const renderUserItem = (user: UserResponseModel) => {
    return (
      <span>
        {user.fullName}
        {user.roles && user.roles.length > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            ({user.roles.join(", ")})
          </span>
        )}
      </span>
    );
  };

  return (
    <BaseCombobox<UserResponseModel>
      {...props}
      value={dataSelect}
      onValueChange={onChangeSelected}
      fetchData={fetchUsers}
      getDisplayValue={(item) => item.fullName}
      getItemId={(item) => item.id}
      getItemValue={(item) => item.fullName}
      renderItem={renderUserItem}  // Custom rendering!
      placeholder="Select a user..."
      label="User"
      enablePagination={true}
      fetchOnMount={true}
    />
  );
}
```

**Key Points:**
- Custom rendering with `renderItem` prop
- Shows "John Doe (Admin, Manager)" in the list
- Shows just "John Doe" in the button
- ~80 lines vs ~240+ lines before

## BaseCombobox Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `T \| null` | Currently selected item |
| `onValueChange` | `(value: T \| null) => void` | Callback when selection changes |
| `fetchData` | `Function` | Async function to fetch data (see signature below) |
| `getDisplayValue` | `(item: T) => string` | Get display text for button |
| `getItemId` | `(item: T) => string` | Get unique ID for each item |
| `getItemValue` | `(item: T) => string` | Get value for search matching |

**fetchData Signature:**
```typescript
fetchData: (params: {
  search: string;
  pageNo: number;
  pageSize?: number;
}) => Promise<{
  content: T[];
  pageNo: number;
  last: boolean;
}>
```

### Optional Props - Display

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `renderItem` | `(item: T) => ReactNode` | - | Custom render for list items |
| `label` | `string` | - | Label above combobox |
| `required` | `boolean` | `false` | Show required asterisk |
| `placeholder` | `string` | `"Select an option..."` | Button placeholder |
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder |
| `emptyMessage` | `string` | `"No items found."` | Message when no results |
| `noMoreDataMessage` | `string` | `"No more items"` | Pagination end message |
| `loadingMessage` | `string` | `"Loading..."` | Loading spinner text |
| `error` | `string` | - | Error message to display |
| `disabled` | `boolean` | `false` | Disable the combobox |

### Optional Props - Custom Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `customOptions` | `T[]` | `[]` | Custom items (like "All") |
| `showCustomOptions` | `boolean` | `false` | Show custom options |
| `isCustomOption` | `(item: T) => boolean` | `() => false` | Identify custom options |

### Optional Props - Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size variant |
| `labelClassName` | `string` | - | Custom label CSS class |
| `buttonClassName` | `string` | - | Custom button CSS class |
| `popoverClassName` | `string` | - | Custom popover CSS class |

### Optional Props - Behavior

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fetchOnMount` | `boolean` | `false` | Fetch data on component mount |
| `pageSize` | `number` | `10` | Items per page |
| `debounceMs` | `number` | `400` | Search debounce delay |
| `enablePagination` | `boolean` | `true` | Enable infinite scroll |
| `enableSearch` | `boolean` | `true` | Enable search functionality |

## Creating Your Own Combobox - Step by Step

### Step 1: Define Your Data Type

```typescript
interface Department {
  id: string;
  name: string;
  code: string;
  employeeCount: number;
}
```

### Step 2: Create the Combobox Component

```typescript
"use client";

import { BaseCombobox, BaseComboboxProps } from "./base-combobox";
import { useAppDispatch } from "@/redux/store";
import { fetchDepartmentsService } from "@/services/department-service";

// Define props, omitting what BaseCombobox handles
interface ComboboxSelectDepartmentProps
  extends Omit<
    BaseComboboxProps<Department>,
    "fetchData" | "getDisplayValue" | "getItemId" | "getItemValue" | "value" | "onValueChange"
  > {
  dataSelect: Department | null;
  onChangeSelected: (item: Department | null) => void;
}

export function ComboboxSelectDepartment({
  dataSelect,
  onChangeSelected,
  ...props
}: ComboboxSelectDepartmentProps) {
  const dispatch = useAppDispatch();

  // Implement data fetching
  const fetchDepartments = async ({
    search,
    pageNo,
    pageSize = 10,
  }: {
    search: string;
    pageNo: number;
    pageSize?: number;
  }) => {
    const result = await dispatch(
      fetchDepartmentsService({ search, pageNo, pageSize })
    ).unwrap();

    return {
      content: result?.content || [],
      pageNo: result?.pageNo || pageNo,
      last: result?.last || true,
    };
  };

  return (
    <BaseCombobox<Department>
      {...props}
      value={dataSelect}
      onValueChange={onChangeSelected}
      fetchData={fetchDepartments}
      getDisplayValue={(item) => item.name}
      getItemId={(item) => item.id}
      getItemValue={(item) => item.name}
      placeholder="Select department..."
      searchPlaceholder="Search departments..."
      emptyMessage="No departments found."
      label="Department"
      enablePagination={true}
      fetchOnMount={true}
    />
  );
}
```

### Step 3: Use Your Combobox

```typescript
function MyForm() {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  return (
    <ComboboxSelectDepartment
      dataSelect={selectedDept}
      onChangeSelected={setSelectedDept}
      required
      error={errors.department?.message}
    />
  );
}
```

## Advanced Customizations

### Adding an "All" Option

```typescript
const ALL_OPTION: Department = {
  id: "all",
  name: "All Departments",
  code: "ALL",
  employeeCount: 0,
} as Department;

<BaseCombobox<Department>
  // ... other props
  customOptions={[ALL_OPTION]}
  showCustomOptions={true}
  isCustomOption={(item) => item.id === "all"}
/>
```

### Custom Item Rendering

Show extra info in the dropdown:

```typescript
const renderDeptItem = (dept: Department) => {
  return (
    <div>
      <span className="font-medium">{dept.name}</span>
      <span className="text-xs text-muted-foreground ml-2">
        ({dept.code}) - {dept.employeeCount} employees
      </span>
    </div>
  );
};

<BaseCombobox<Department>
  // ... other props
  renderItem={renderDeptItem}
/>
```

### Different Value Type

If your parent component uses strings but the API returns objects:

```typescript
export function ComboboxSelectDepartment({
  value, // string (department ID)
  onValueChange, // (id: string) => void
  ...props
}: Props) {
  const dispatch = useAppDispatch();

  // ... fetchData implementation

  // Convert string ID to Department object
  const deptValue: Department | null = value
    ? { id: value, name: value, code: value, employeeCount: 0 }
    : null;

  // Convert Department object back to string
  const handleValueChange = (dept: Department | null) => {
    onValueChange(dept?.id || "");
  };

  return (
    <BaseCombobox<Department>
      {...props}
      value={deptValue}
      onValueChange={handleValueChange}
      // ... rest of props
    />
  );
}
```

### Disable Pagination

For small datasets:

```typescript
<BaseCombobox<Department>
  // ... other props
  enablePagination={false}
  pageSize={100}  // Fetch all at once
/>
```

### Disable Search

For very small lists:

```typescript
<BaseCombobox<Department>
  // ... other props
  enableSearch={false}
/>
```

### Custom Styling

```typescript
<BaseCombobox<Department>
  // ... other props
  size="lg"
  labelClassName="text-blue-600 font-bold"
  buttonClassName="border-2 border-blue-500"
  popoverClassName="shadow-2xl"
/>
```

## Benefits Summary

### Before BaseCombobox ❌
- ~250 lines per combobox
- Duplicate code everywhere
- Hard to maintain consistency
- Edit mode bugs
- Manual pagination logic
- Manual search/debounce logic

### After BaseCombobox ✅
- ~70 lines per combobox (70% less code!)
- Single source of truth
- Consistent behavior
- Edit mode works perfectly
- Pagination built-in
- Search/debounce built-in
- Easy to create new comboboxes
- Easy to add features (just update BaseCombobox)

## Migration Checklist

If you have old comboboxes to migrate:

1. [ ] Keep the existing props interface (maintain API compatibility)
2. [ ] Import `BaseCombobox` and `BaseComboboxProps`
3. [ ] Extend `BaseComboboxProps<YourType>` with Omit
4. [ ] Implement `fetchData` function
5. [ ] Return `<BaseCombobox>` with required props
6. [ ] Test in both create and edit modes
7. [ ] Delete old implementation code

## Questions?

Look at the existing combobox files as examples:
- `combobox_select_schedule_type.tsx` - Simple case
- `combobox_select_brand.tsx` - With "All" option
- `combobox_select_categories.tsx` - With "All" option
- `combobox_select_user.tsx` - Custom rendering

All of them use BaseCombobox and are fully functional!
