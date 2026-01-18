# Code Cleanup & Refactoring Summary

## Overview
This document tracks the comprehensive cleanup and refactoring of the entire codebase to improve maintainability, reduce duplication, and fix critical bugs.

## Current Status: PLANNING PHASE

### Analysis Complete ✅
- Identified ~970 lines of duplicate Redux slice code
- Identified ~400 lines of duplicate thunk code
- Identified ~200 lines of duplicate selector code
- Identified ~185 lines of duplicate state hook code
- Found multiple file/folder naming typos
- Found copy-paste bugs in all Redux slices
- Found inconsistent patterns across 16+ modals

### Total Code Reduction Target
**Before**: ~5000+ lines of duplicated code
**After**: ~1500 lines (using factories)
**Savings**: ~70% reduction

---

## Phase 1: Critical Fixes (IN PROGRESS)

### 1.1 File & Folder Naming ⏳
**Status**: In Progress

**Renames Needed:**
```
src/components/shared/avator/ → avatar/
├── custom-avator.tsx → custom-avatar.tsx
└── (user-avatar-card.tsx stays same)

src/components/shared/form-field/
└── submid-button.tsx → submit-button.tsx

src/redux/features/auth/store/models/response/
└── auth-resposne.ts → auth-response.ts
```

**Import Updates Required**: 18+ files

**Files Affected**:
- All components importing CustomAvatar
- All modals using SubmitButton
- Auth-related components

---

### 1.2 Copy-Paste Bug Fixes 🐛
**Status**: Pending

**Critical Bug**: All Redux slices use variable name `user` instead of entity name

**Files to Fix**:
1. `src/redux/features/master-data/store/slice/brand-slice.ts` (lines 104, 147, 165)
2. `src/redux/features/master-data/store/slice/banner-slice.ts` (same pattern)
3. `src/redux/features/master-data/store/slice/categories-slice.ts` (same pattern)
4. `src/redux/features/master-data/store/slice/delivery-options-slice.ts` (same pattern)
5. `src/redux/features/master-data/store/slice/exchange-rate-slice.ts` (same pattern)

**Example Fix**:
```typescript
// BEFORE (WRONG - copy-paste bug)
const index = state.data.content.findIndex((user) => user.id === action.payload.id);

// AFTER (CORRECT)
const index = state.data.content.findIndex((brand) => brand.id === action.payload.id);
```

---

### 1.3 Component Naming Bugs 🏷️
**Status**: Pending

**Typos to Fix**:
1. `ProdyuctPage` → `ProductPage` in products/page.tsx (line 35)
2. `selecBannerContent` → `selectBannerContent` in banner-selector.ts (line 11)
3. `fetchUserData` → `fetchBannerData` in banner-detail-modal.tsx (line 37)
4. Error messages: "Error fetching user data" → "Error fetching banner data"
5. Section titles: Remove "Personal Information" from non-user modals

---

### 1.4 Development Code Cleanup 🧹
**Status**: Pending

**Remove console.log**:
- `src/app/(public)/products/page.tsx` (lines 97-111)
  ```typescript
  console.log("✅ Products exist with matching filters...");
  console.log("🔄 Filters changed - clearing and reloading");
  console.log("📦 Loading products for current filters");
  ```

**Replace console.error** with proper error handling:
- All modal fetch functions (20+ files)
- Use toast notifications instead

---

## Phase 2: Factory Pattern Implementation 🏭

### 2.1 Generic CRUD Slice Factory
**Status**: Not Started

**Will Create**: `src/redux/store/factories/createCRUDSlice.ts`

**Benefits**:
- Single source of truth for all CRUD slices
- Type-safe generic implementation
- Reduces ~194 lines × 5 files = 970 lines to ~200 lines total

**Entities to Migrate**:
- [x] Brand
- [ ] Banner
- [ ] Categories
- [ ] Delivery Options
- [ ] Exchange Rate

---

### 2.2 Generic CRUD Thunks Factory
**Status**: Not Started

**Will Create**: `src/redux/store/factories/createCRUDThunks.ts`

**Benefits**:
- Standardized API calls
- Consistent error handling
- Reduces ~80 lines × 5 files = 400 lines to ~100 lines total

---

### 2.3 Generic Selector Factory
**Status**: Not Started

**Will Create**: `src/redux/store/factories/createCRUDSelectors.ts`

**Benefits**:
- Memoized selectors
- Consistent access patterns
- Reduces ~40 lines × 5 files = 200 lines to ~50 lines total

---

### 2.4 Generic State Hook Factory
**Status**: Not Started

**Will Create**: `src/redux/store/factories/createCRUDStateHook.ts`

**Benefits**:
- Consistent hook interface
- Type-safe state access
- Reduces ~37 lines × 5 files = 185 lines to ~40 lines total

---

## Phase 3: Zod Schema Consolidation ✅

### 3.1 Merge Create/Update Schemas
**Status**: Not Started

**Current Issue**: Create and update schemas are 100% identical

**Solution**: Single schema per entity or use composition

```typescript
// BEFORE
export const createBrandSchema = z.object({...});
export const updateBrandSchema = z.object({...}); // IDENTICAL!

// AFTER (Option 1 - Single schema)
export const brandSchema = z.object({...});

// AFTER (Option 2 - Composition)
const baseBrandSchema = z.object({...});
export const createBrandSchema = baseBrandSchema;
export const updateBrandSchema = baseBrandSchema.partial(); // if needed
```

---

### 3.2 Create Common Schema Helpers
**Status**: Not Started

**Will Create**: `src/utils/validation/commonSchemas.ts`

```typescript
// Reusable schema pieces
export const nameSchema = z.string().min(1, "Name is required");
export const descriptionSchema = z.string().optional().or(z.literal(""));
export const statusSchema = z.string().min(1, "Status is required");
export const imageUrlSchema = z.string().min(1, "Image URL is required");
export const urlSchema = z.string().url("Invalid URL").optional().or(z.literal(""));
```

**Entities to Refactor**:
- [ ] Brand schema
- [ ] Banner schema
- [ ] Categories schema
- [ ] Delivery Options schema
- [ ] Exchange Rate schema
- [ ] Product schema
- [ ] User schema
- [ ] Work Schedule schema

---

## Phase 4: Modal System Migration 🎨

### 4.1 Replace All CRUD Modals
**Status**: Partially Complete (brand done)

**Pattern**: Use `DynamicModal` with `FormGrid`

**Migrations**:
- [x] Brand (example created)
- [ ] Banner
- [ ] Categories
- [ ] Delivery Options
- [ ] Exchange Rate
- [ ] Product
- [ ] User
- [ ] Work Schedule

---

### 4.2 Replace All Detail Modals
**Status**: Partially Complete (brand done)

**Pattern**: Use `EnhancedDetailModal` with `DetailGrid`

**Migrations**:
- [x] Brand (example created)
- [ ] Banner
- [ ] Categories
- [ ] Delivery Options
- [ ] Exchange Rate
- [ ] Product
- [ ] User
- [ ] Work Schedule

---

## Phase 5: Code Quality ⭐

### 5.1 Add Barrel Exports
**Status**: Not Started

**Folders Needing index.ts**:
- [ ] src/redux/features/*/store/selectors/
- [ ] src/redux/features/*/store/thunks/
- [ ] src/redux/features/*/components/
- [ ] src/components/shared/modal/
- [ ] src/components/shared/card/
- [ ] src/components/shared/skeletons/

---

### 5.2 Standardize Error Handling
**Status**: Not Started

**Create**: `src/utils/error/errorHandler.ts`

**Pattern**: Consistent toast notifications + logging

---

### 5.3 Add JSDoc Documentation
**Status**: Not Started

**Components Needing Docs**: 50+
**Utilities Needing Docs**: 20+
**Hooks Needing Docs**: 10+

---

### 5.4 Create App Configuration
**Status**: Not Started

**Will Create**: `src/config/app.config.ts`

```typescript
export const APP_CONFIG = {
  pagination: {
    defaultPageSize: 15,
    pageSizeOptions: [10, 15, 20, 50]
  },
  debounce: {
    search: 400,
    scroll: 150
  },
  // ... other config
}
```

---

## Execution Timeline

### Immediate (Can Start Now)
- ✅ Phase 1.1: File renames (in progress)
- ⏳ Phase 1.2: Fix copy-paste bugs
- ⏳ Phase 1.3: Fix naming bugs
- ⏳ Phase 1.4: Remove dev code

**Estimated Time**: 2-4 hours
**Risk**: Low (non-breaking changes)

### Short Term (This Week)
- Phase 2: Create and apply factories
- Phase 3: Consolidate Zod schemas

**Estimated Time**: 8-16 hours
**Risk**: Medium (requires testing)

### Medium Term (Next Week)
- Phase 4: Migrate all modals
- Phase 5.1-5.2: Quality improvements

**Estimated Time**: 16-24 hours
**Risk**: Low (incremental changes)

### Long Term (Ongoing)
- Phase 5.3-5.4: Documentation and configuration
- Continuous improvements

**Estimated Time**: 8-12 hours
**Risk**: Very Low

---

## Success Metrics

### Code Metrics
- [ ] Reduce Redux code by ~70% (5000 → 1500 lines)
- [ ] Reduce modal code by ~60% (300 → 120 lines per modal)
- [ ] Achieve 100% TypeScript type safety
- [ ] Zero console.log in production code
- [ ] Zero naming typos

### Quality Metrics
- [ ] All builds pass
- [ ] No TypeScript errors
- [ ] Consistent patterns across all features
- [ ] Comprehensive documentation
- [ ] Easy to add new entities (< 50 lines of config)

---

## Next Actions

1. **Complete Phase 1.1** (file renames)
2. **Run build** to verify no breaking changes
3. **Commit Phase 1.1** with clear message
4. **Continue with Phase 1.2-1.4**
5. **Create factories** (Phase 2)
6. **Migrate one entity end-to-end** as proof of concept
7. **Document the pattern** for team
8. **Apply systematically** to all entities

---

## Notes

- Keep commits small and focused
- Test after each phase
- Document breaking changes
- Update REFACTORING_GUIDE.md as we go
- Celebrate wins! 🎉

---

**Last Updated**: 2026-01-18
**Status**: Phase 1 In Progress
**Next Milestone**: Complete all Phase 1 critical fixes
