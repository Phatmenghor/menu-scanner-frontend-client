# Admin Modal System - Complete Guide

## Overview

This modal system provides reusable, flexible components for admin CRUD operations with:
- **Dynamic sizing** - 8 size options from sm to full
- **Responsive layouts** - 1-column and 2-column grids
- **Easy customization** - Template files for quick copy-paste
- **Consistent UX** - Standardized patterns across all admin pages

---

## Quick Start

### 1. For Create/Edit Modals

Copy `CRUD_MODAL_TEMPLATE.tsx` and customize:

```tsx
// src/redux/features/your-feature/components/your-entity-modal.tsx
import { DynamicModal, ModalSizePresets } from "@/components/shared/modal/dynamic-modal";
import { FormGrid, FormSection } from "@/components/shared/form-field/form-grid";

// Use the template as starting point, then customize fields
```

### 2. For Detail/View Modals

Copy `DETAIL_MODAL_TEMPLATE.tsx` and customize:

```tsx
// src/redux/features/your-feature/components/your-entity-detail-modal.tsx
import { EnhancedDetailModal, DetailGrid } from "@/components/shared/modal/enhanced-detail-modal";

// Use the template as starting point, then customize detail rows
```

---

## Component Reference

### DynamicModal

Main modal wrapper with size control.

```tsx
<DynamicModal
  isOpen={true}
  onClose={handleClose}
  size="lg"  // sm | md | lg | xl | 2xl | 3xl | 4xl | full
>
  <YourContent />
</DynamicModal>
```

**Size Guide:**
| Size | Max Width | Use Case |
|------|-----------|----------|
| `sm` | 448px | Simple forms (2-3 fields) |
| `md` | 512px | Medium forms |
| `lg` | 672px | **Recommended** for 2-column forms |
| `xl` | 768px | Detail views |
| `2xl` | 896px | Complex forms (current default) |
| `3xl` | 1024px | Product forms with images |
| `4xl` | 1152px | Dashboards |
| `full` | 95vw | Almost full screen |

**Size Presets:**
```tsx
import { ModalSizePresets } from "@/components/shared/modal/dynamic-modal";

ModalSizePresets.simpleForm      // "md"
ModalSizePresets.standardForm    // "lg" - Recommended for most forms
ModalSizePresets.complexForm     // "2xl"
ModalSizePresets.detailView      // "xl"
ModalSizePresets.productForm     // "3xl"
```

---

### FormGrid

Responsive grid layout for form fields.

```tsx
// 2-column layout (recommended)
<FormGrid columns={2} gap="md">
  <TextField name="firstName" label="First Name" />
  <TextField name="lastName" label="Last Name" />
</FormGrid>

// 1-column layout
<FormGrid columns={1}>
  <TextField name="fullName" label="Full Name" />
</FormGrid>
```

**Props:**
- `columns`: `1 | 2` - Number of columns (responsive on mobile)
- `gap`: `"sm" | "md" | "lg"` - Space between fields

---

### FormSection

Groups related fields with optional title.

```tsx
<FormSection
  title="Personal Information"
  description="Basic user details"
  divider  // Adds top border
>
  <FormGrid columns={2}>
    <TextField name="name" label="Name" />
    <TextField name="email" label="Email" />
  </FormGrid>
</FormSection>
```

---

### FormRow

Full-width row in 2-column grid (for TextArea, etc).

```tsx
<FormGrid columns={2}>
  <TextField name="firstName" label="First Name" />
  <TextField name="lastName" label="Last Name" />

  {/* This will span both columns */}
  <FormRow>
    <TextareaField name="bio" label="Bio" rows={4} />
  </FormRow>
</FormGrid>
```

---

### EnhancedDetailModal

Modal for read-only detail/view pages.

```tsx
<EnhancedDetailModal
  isOpen={true}
  onClose={handleClose}
  isLoading={loading}
  title="Brand Details"
  description="View brand information"
  avatarUrl="/path/to/image"
  avatarName="Brand Name"
  badges={<Badge>Active</Badge>}
  size="lg"  // Same size options as DynamicModal
>
  <DetailSection title="Basic Info">
    <DetailGrid columns={2}>
      <DetailRow label="Name" value={data.name} />
      <DetailRow label="Status" value={<Badge>Active</Badge>} />
    </DetailGrid>
  </DetailSection>
</EnhancedDetailModal>
```

---

### DetailGrid

Grid layout for detail rows (like FormGrid but for read-only).

```tsx
<DetailGrid columns={2} gap="md">
  <DetailRow label="Field 1" value="Value 1" />
  <DetailRow label="Field 2" value="Value 2" />
</DetailGrid>
```

---

### DetailRow

Individual field in detail view.

```tsx
<DetailRow
  label="Entity Name"
  value="My Entity"
  isLast  // Removes bottom border
/>

// With custom rendering
<DetailRow
  label="Status"
  value={<Badge variant="default">Active</Badge>}
/>

// With null/empty handling
<DetailRow
  label="Description"
  value={data.description || undefined}  // Shows "Not provided" if empty
/>
```

---

### DetailSection

Grouped section with title in detail modal.

```tsx
<DetailSection
  title="Personal Information"
  divider  // Adds top border/divider
>
  <DetailGrid columns={2}>
    <DetailRow label="Name" value={name} />
    <DetailRow label="Email" value={email} />
  </DetailGrid>
</DetailSection>
```

---

### DetailFullRow

Full-width row in 2-column detail grid.

```tsx
<DetailGrid columns={2}>
  <DetailRow label="First Name" value="John" />
  <DetailRow label="Last Name" value="Doe" />

  {/* Spans both columns */}
  <DetailFullRow>
    <DetailRow label="Bio" value={longBioText} />
  </DetailFullRow>
</DetailGrid>
```

---

## Common Patterns

### Pattern 1: Simple Form (2-3 fields)

```tsx
<DynamicModal isOpen={true} onClose={onClose} size="md">
  <FormHeader title="Quick Edit" />
  <form onSubmit={handleSubmit}>
    <FormBody>
      <FormGrid columns={1}>
        <TextField name="name" label="Name" />
        <SelectField name="status" label="Status" options={[...]} />
      </FormGrid>
    </FormBody>
    <FormFooter>
      <CancelButton onClick={onClose} />
      <SubmitButton />
    </FormFooter>
  </form>
</DynamicModal>
```

### Pattern 2: Standard Form (2-column)

```tsx
<DynamicModal isOpen={true} onClose={onClose} size="lg">
  <FormHeader title="Edit Entity" isCreate={false} />
  <form onSubmit={handleSubmit}>
    <FormBody>
      <FormSection>
        <ClickableImageUpload
          label="Image"
          value={image}
          onChange={setImage}
        />
      </FormSection>

      <FormSection title="Basic Info" divider>
        <FormGrid columns={2}>
          <TextField name="name" label="Name" />
          <SelectField name="status" label="Status" options={[...]} />

          <FormRow>
            <TextareaField name="description" label="Description" />
          </FormRow>
        </FormGrid>
      </FormSection>
    </FormBody>
    <FormFooter {...footerProps}>
      <CancelButton onClick={onClose} />
      <SubmitButton {...buttonProps} />
    </FormFooter>
  </form>
</DynamicModal>
```

### Pattern 3: Detail View (2-column)

```tsx
<EnhancedDetailModal
  isOpen={true}
  onClose={onClose}
  title="Entity Details"
  size="lg"
>
  <DetailSection title="Basic Info">
    <DetailGrid columns={2}>
      <DetailRow label="Name" value={data.name} />
      <DetailRow label="Status" value={<Badge>{data.status}</Badge>} />
    </DetailGrid>
  </DetailSection>

  <DetailSection title="System Info" divider>
    <DetailGrid columns={2}>
      <DetailRow label="ID" value={data.id} />
      <DetailRow label="Created" value={formatDate(data.createdAt)} />
    </DetailGrid>
  </DetailSection>
</EnhancedDetailModal>
```

### Pattern 4: Complex Form with Multiple Sections

```tsx
<DynamicModal isOpen={true} onClose={onClose} size="2xl">
  <FormHeader title="Create Product" isCreate />
  <form onSubmit={handleSubmit}>
    <FormBody>
      {/* Section 1: Images */}
      <FormSection>
        <ClickableImageUpload label="Main Image" {...imageProps} />
      </FormSection>

      {/* Section 2: Basic Info */}
      <FormSection title="Product Details" divider>
        <FormGrid columns={2}>
          <TextField name="name" label="Name" />
          <TextField name="sku" label="SKU" />
          <SelectField name="category" label="Category" options={[...]} />
          <SelectField name="brand" label="Brand" options={[...]} />

          <FormRow>
            <TextareaField name="description" label="Description" />
          </FormRow>
        </FormGrid>
      </FormSection>

      {/* Section 3: Pricing */}
      <FormSection title="Pricing" divider>
        <FormGrid columns={2}>
          <NumberField name="price" label="Price" />
          <NumberField name="discount" label="Discount %" />
        </FormGrid>
      </FormSection>
    </FormBody>
    <FormFooter {...footerProps}>
      <CancelButton onClick={onClose} />
      <SubmitButton {...buttonProps} />
    </FormFooter>
  </form>
</DynamicModal>
```

---

## Migration Guide

### Updating Existing Modals

**Before:**
```tsx
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="w-[90%] max-w-4xl ...">
    {/* Your content */}
  </DialogContent>
</Dialog>
```

**After:**
```tsx
<DynamicModal isOpen={isOpen} onClose={onClose} size="2xl">
  {/* Your content - same as before */}
</DynamicModal>
```

**Form Layout - Before:**
```tsx
<div className="grid grid-cols-2 gap-4">
  <TextField name="firstName" />
  <TextField name="lastName" />
</div>
```

**Form Layout - After:**
```tsx
<FormGrid columns={2} gap="md">
  <TextField name="firstName" />
  <TextField name="lastName" />
</FormGrid>
```

---

## Best Practices

### 1. Choose the Right Size

- **"md"** - Use for modals with 2-3 simple fields (quick edits)
- **"lg"** - **Recommended default** - Good for 2-column layouts with 4-8 fields
- **"2xl"** - For complex forms with multiple sections and image uploads
- **"3xl"** - Only for products or entities with extensive image galleries

### 2. Use 2-Column Layout When

- You have 4+ simple fields (name, email, phone, status)
- Fields are roughly the same width
- You want to maximize space efficiency

### 3. Use 1-Column Layout When

- You have only 1-2 fields
- Fields need full width (long URLs, detailed text)
- Form is primarily TextArea inputs

### 4. Organize with Sections

```tsx
<FormSection title="Basic Info">
  {/* Primary fields */}
</FormSection>

<FormSection title="Advanced Settings" divider>
  {/* Secondary fields */}
</FormSection>
```

### 5. Match Edit and View Modal Sizes

```tsx
// Edit modal
<DynamicModal size="lg">...</DynamicModal>

// Detail modal - use same size!
<EnhancedDetailModal size="lg">...</EnhancedDetailModal>
```

---

## Examples in Codebase

### Simple Entity (Brand)
- Edit: `size="lg"` with 2-column grid
- View: `size="lg"` with 2-column detail grid
- Fields: Logo, Name, Description, Status

### Complex Entity (Product)
- Edit: `size="3xl"` with multiple sections
- View: `size="2xl"` with detailed sections
- Fields: Images, Name, Category, Brand, Pricing, Sizes, etc.

---

## File Locations

```
src/components/shared/
├── modal/
│   ├── dynamic-modal.tsx              # Main modal wrapper
│   ├── enhanced-detail-modal.tsx      # Detail/view modal
│   ├── CRUD_MODAL_TEMPLATE.tsx        # Copy this for new edit modals
│   ├── DETAIL_MODAL_TEMPLATE.tsx      # Copy this for new view modals
│   └── README_MODAL_SYSTEM.md         # This file
│
└── form-field/
    ├── form-grid.tsx                  # FormGrid, FormSection, FormRow
    ├── form-header.tsx                # Modal header
    ├── form-body.tsx                  # Scrollable body
    └── form-footer.tsx                # Footer with buttons
```

---

## Troubleshooting

**Q: Modal is too wide/narrow**
- Adjust `size` prop: `<DynamicModal size="lg">` instead of `size="2xl"`

**Q: Fields not in 2 columns**
- Check: `<FormGrid columns={2}>` is set correctly
- Mobile: Grid automatically becomes 1-column on small screens

**Q: TextArea taking only half width**
- Wrap in `<FormRow>` to span full width in 2-column grid

**Q: Detail modal different size than edit modal**
- Use same `size` prop for both: `size="lg"`

**Q: Need custom width**
- Use `customMaxWidth`: `<DynamicModal customMaxWidth="900px">`

---

## Next Steps

1. **Copy template files** to your feature folder
2. **Customize fields** based on your schema
3. **Choose appropriate size** (start with "lg")
4. **Test responsive behavior** on mobile/desktop
5. **Ensure edit and view modals match** in size

Happy coding! 🚀
