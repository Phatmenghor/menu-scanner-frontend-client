# ComboboxSelectScheduleType - Usage Guide

## Overview
A flexible, reusable combobox component for selecting schedule types with support for custom options, dynamic data loading, and edit mode.

## Features

1. **Edit Mode Support** - Displays the selected value even before data is loaded
2. **Custom Options** - Add custom options like "All", "None", etc.
3. **Flexible Data Loading** - Load data on mount or on dropdown open
4. **Search Functionality** - Filter schedule types by name
5. **Error Handling** - Display validation errors
6. **Loading States** - Shows loading spinner while fetching data

## Basic Usage

### Simple Usage (Default Behavior)
```tsx
import { ComboboxSelectScheduleType } from "@/components/shared/combobox/combobox_select_schedule_type";

function MyComponent() {
  const [scheduleType, setScheduleType] = useState("");

  return (
    <ComboboxSelectScheduleType
      value={scheduleType}
      onValueChange={setScheduleType}
      label="Schedule Type"
      required
      placeholder="Select schedule type"
    />
  );
}
```

### With React Hook Form (Recommended)
```tsx
import { useForm } from "react-hook-form";
import { ComboboxSelectScheduleType } from "@/components/shared/combobox/combobox_select_schedule_type";

function WorkScheduleForm() {
  const { setValue, formState: { errors } } = useForm();
  const [selectedScheduleType, setSelectedScheduleType] = useState("");

  return (
    <ComboboxSelectScheduleType
      value={selectedScheduleType}
      onValueChange={(value) => {
        setSelectedScheduleType(value);
        setValue("scheduleTypeEnum", value, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }}
      label="Schedule Type"
      required
      placeholder="Select schedule type"
      error={errors.scheduleTypeEnum?.message}
    />
  );
}
```

## Advanced Usage

### With Custom "All" Option
```tsx
// Define a custom "All" option
const ALL_OPTION = {
  id: "all",
  enumName: "All Schedule Types",
};

<ComboboxSelectScheduleType
  value={scheduleType}
  onValueChange={(value) => {
    if (value === "all") {
      // Handle "All" selection
      setScheduleType("");
      // Clear filters, show all schedules, etc.
    } else {
      setScheduleType(value);
    }
  }}
  customOptions={[ALL_OPTION]}
  showCustomOptions={true}
  label="Filter by Schedule Type"
  placeholder="Select schedule type"
/>
```

### With Multiple Custom Options
```tsx
const CUSTOM_OPTIONS = [
  { id: "all", enumName: "All" },
  { id: "none", enumName: "None" },
  { id: "unassigned", enumName: "Unassigned" },
];

<ComboboxSelectScheduleType
  value={scheduleType}
  onValueChange={setScheduleType}
  customOptions={CUSTOM_OPTIONS}
  showCustomOptions={true}
  label="Schedule Type"
  placeholder="Select schedule type"
/>
```

### Fetch Data on Component Mount (Edit Mode)
Use `fetchOnMount` when you know the value will be set immediately (like in edit mode):

```tsx
function EditWorkScheduleModal({ workScheduleId }) {
  const [selectedScheduleType, setSelectedScheduleType] = useState("");

  useEffect(() => {
    // Fetch work schedule data
    const data = await fetchWorkScheduleById(workScheduleId);
    setSelectedScheduleType(data.scheduleTypeEnum); // e.g., "FULL_TIME"
  }, [workScheduleId]);

  return (
    <ComboboxSelectScheduleType
      value={selectedScheduleType}
      onValueChange={setSelectedScheduleType}
      fetchOnMount={true}  // Load data immediately
      label="Schedule Type"
      required
    />
  );
}
```

### With Form Validation
```tsx
<ComboboxSelectScheduleType
  value={scheduleType}
  onValueChange={(value) => {
    setScheduleType(value);
    setValue("scheduleTypeEnum", value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }}
  disabled={isSubmitting}
  label="Schedule Type"
  required
  placeholder="Select schedule type"
  error={errors.scheduleTypeEnum?.message}
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | The currently selected value (required) |
| `onValueChange` | `(value: string) => void` | - | Callback when selection changes (required) |
| `disabled` | `boolean` | `false` | Disable the combobox |
| `label` | `string` | `"Schedule Type"` | Label text |
| `required` | `boolean` | `false` | Show required asterisk |
| `placeholder` | `string` | `"Select schedule type..."` | Placeholder text |
| `error` | `string` | - | Error message to display |
| `customOptions` | `CustomOption[]` | `[]` | Array of custom options to include |
| `showCustomOptions` | `boolean` | `false` | Whether to show custom options |
| `fetchOnMount` | `boolean` | `false` | Fetch data on component mount (vs on dropdown open) |

## CustomOption Interface

```typescript
interface CustomOption {
  id: string;
  enumName: string;
}
```

## When to Use Each Feature

### `fetchOnMount={true}`
- **Use when**: Edit mode, when you need to display a pre-selected value immediately
- **Example**: Editing an existing work schedule where the schedule type is already set
- **Benefit**: The component can display the correct label immediately, not just the enum value

### `fetchOnMount={false}` (default)
- **Use when**: Create mode, when the user will select a value
- **Example**: Creating a new work schedule
- **Benefit**: Saves unnecessary API calls if the user never opens the dropdown

### `customOptions` + `showCustomOptions`
- **Use when**: You need special options like "All", "None", "Unassigned"
- **Example**: Filter dropdowns, optional selections
- **Benefit**: Provides more flexibility without modifying the API

## Common Patterns

### Create/Edit Modal Pattern
```tsx
function WorkScheduleModal({ mode, workScheduleId }) {
  const isCreate = mode === "CREATE";
  const [selectedScheduleType, setSelectedScheduleType] = useState("");

  useEffect(() => {
    if (!isCreate && workScheduleId) {
      // Fetch existing data in edit mode
      fetchWorkScheduleById(workScheduleId).then((data) => {
        setSelectedScheduleType(data.scheduleTypeEnum);
      });
    }
  }, [isCreate, workScheduleId]);

  return (
    <ComboboxSelectScheduleType
      value={selectedScheduleType}
      onValueChange={(value) => {
        setSelectedScheduleType(value);
        setValue("scheduleTypeEnum", value, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }}
      fetchOnMount={!isCreate}  // Only fetch on mount in edit mode
      label="Schedule Type"
      required
      error={errors.scheduleTypeEnum?.message}
    />
  );
}
```

### Filter Dropdown Pattern
```tsx
const ALL_OPTION = { id: "all", enumName: "All Schedule Types" };

function WorkScheduleFilter() {
  const [filterType, setFilterType] = useState("all");

  return (
    <ComboboxSelectScheduleType
      value={filterType}
      onValueChange={(value) => {
        setFilterType(value);
        if (value === "all") {
          // Clear filter
          filterWorkSchedules(null);
        } else {
          // Apply filter
          filterWorkSchedules(value);
        }
      }}
      customOptions={[ALL_OPTION]}
      showCustomOptions={true}
      fetchOnMount={true}  // Fetch immediately so users can filter right away
      label="Filter by Type"
      placeholder="All Types"
    />
  );
}
```

## Fix Summary

### Before (Issue)
In edit mode, when the component mounted with a pre-selected value:
1. The `value` prop was set (e.g., `"FULL_TIME"`)
2. But `scheduleTypes` array was empty (not fetched yet)
3. Component couldn't find the matching schedule type object
4. Displayed placeholder instead of the actual value

### After (Fixed)
1. Component now displays the raw `value` if the schedule type object isn't found yet
2. Added `fetchOnMount` option to fetch data immediately in edit mode
3. Once data loads, it displays the proper `enumName` label
4. Supports custom options for more flexibility

## Migration Guide

### No Breaking Changes
The component is backward compatible. Existing usage will continue to work without modifications.

### Optional Enhancements
To take advantage of new features in edit mode:

**Before:**
```tsx
<ComboboxSelectScheduleType
  value={selectedScheduleType}
  onValueChange={setSelectedScheduleType}
/>
```

**After (Recommended for Edit Mode):**
```tsx
<ComboboxSelectScheduleType
  value={selectedScheduleType}
  onValueChange={setSelectedScheduleType}
  fetchOnMount={true}  // Add this for better UX in edit mode
/>
```
