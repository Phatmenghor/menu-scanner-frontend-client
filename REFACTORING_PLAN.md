# PROJECT REFACTORING PLAN

## Executive Summary
This project has good architecture but suffers from extensive copy-paste programming. This plan will systematically clean, refactor, and standardize the entire codebase.

## Phase 1: Critical Fixes (HIGH PRIORITY) ⚠️

### 1.1 File/Folder Naming Typos
- [ ] Rename `src/components/shared/avator/` → `avatar/`
- [ ] Rename `custom-avator.tsx` → `custom-avatar.tsx`
- [ ] Rename `submid-button.tsx` → `submit-button.tsx`
- [ ] Rename `auth-resposne.ts` → `auth-response.ts`
- [ ] Fix `ProdyuctPage` → `ProductPage` component name

### 1.2 Copy-Paste Bugs in Redux Slices
**Critical**: All master-data slices use variable name `user` instead of entity name
- [ ] Fix brand-slice.ts (lines 104, 147-148, 165)
- [ ] Fix banner-slice.ts (same lines)
- [ ] Fix categories-slice.ts (same lines)
- [ ] Fix delivery-options-slice.ts (same lines)
- [ ] Fix exchange-rate-slice.ts (same lines)

### 1.3 Component Naming Bugs
- [ ] Fix `selecBannerContent` → `selectBannerContent` in banner-selector.ts
- [ ] Fix function names in detail modals (fetchUserData → fetchEntityData)
- [ ] Fix section titles in detail modals (remove "Personal Information" for non-user entities)

### 1.4 Remove Development Code
- [ ] Remove console.log from products page (lines 97-111)
- [ ] Replace console.error with proper error handling in modals

---

## Phase 2: Redux Toolkit Refactoring (MEDIUM PRIORITY) 🔄

### 2.1 Create Generic Slice Factory
```typescript
// src/redux/store/factories/createCRUDSlice.ts
// Eliminates 194 lines x 5 files = ~970 lines of duplicate code
```
- [ ] Create generic CRUD slice factory
- [ ] Refactor brand-slice using factory
- [ ] Refactor banner-slice using factory
- [ ] Refactor categories-slice using factory
- [ ] Refactor delivery-options-slice using factory
- [ ] Refactor exchange-rate-slice using factory

### 2.2 Create Generic Thunk Factory
```typescript
// src/redux/store/factories/createCRUDThunks.ts
// Eliminates ~80 lines x 5 files = ~400 lines of duplicate code
```
- [ ] Create generic CRUD thunk factory
- [ ] Standardize parameter naming (entityId, entityData)
- [ ] Refactor all thunks to use factory

### 2.3 Create Generic Selector Factory
```typescript
// src/redux/store/factories/createCRUDSelectors.ts
// Eliminates ~40 lines x 5 files = ~200 lines of duplicate code
```
- [ ] Create generic selector factory
- [ ] Refactor all selectors to use factory

### 2.4 Create Generic State Hook Factory
```typescript
// src/redux/store/factories/createCRUDStateHook.ts
// Eliminates ~37 lines x 5 files = ~185 lines of duplicate code
```
- [ ] Create generic state hook factory
- [ ] Refactor all state hooks to use factory

---

## Phase 3: Zod Schema Refactoring (MEDIUM PRIORITY) ✅

### 3.1 Consolidate Create/Update Schemas
- [ ] Create schema composition utilities
- [ ] Merge identical create/update schemas
- [ ] Standardize validation patterns
- [ ] Standardize error messages (Title Case)

### 3.2 Create Reusable Schema Pieces
```typescript
// src/utils/validation/commonSchemas.ts
const nameSchema = z.string().min(1, "Name is required");
const descriptionSchema = z.string().optional().or(z.literal(""));
const statusSchema = z.string().min(1, "Status is required");
const imageUrlSchema = z.string().min(1, "Image URL is required");
```

---

## Phase 4: Component Refactoring (MEDIUM PRIORITY) 🎨

### 4.1 Migrate All Modals to New System
- [ ] Replace brand-modal.tsx with brand-modal-refactored.tsx
- [ ] Refactor banner-modal.tsx using DynamicModal
- [ ] Refactor categories-modal.tsx using DynamicModal
- [ ] Refactor delivery-options-modal.tsx using DynamicModal
- [ ] Refactor exchange-rate-modal.tsx using DynamicModal
- [ ] Remove old modal files

### 4.2 Migrate All Detail Modals
- [ ] Replace brand-detail-modal.tsx with brand-detail-modal-refactored.tsx
- [ ] Refactor banner-detail-modal.tsx using EnhancedDetailModal
- [ ] Refactor categories-detail-modal.tsx using EnhancedDetailModal
- [ ] Refactor delivery-options-detail-modal.tsx using EnhancedDetailModal
- [ ] Refactor exchange-rate-detail-modal.tsx using EnhancedDetailModal
- [ ] Remove old detail modal files

### 4.3 Create Generic CRUD Page Wrapper (Optional)
```typescript
// src/components/shared/page/CRUDPage.tsx
// Generic page component for all master-data pages
```
- [ ] Design generic CRUD page component
- [ ] Migrate one page as proof of concept
- [ ] Document pattern for future use

---

## Phase 5: Code Quality Improvements (LOW PRIORITY) 📚

### 5.1 Add Barrel Exports
- [ ] Create index.ts in selectors folder
- [ ] Create index.ts in thunks folder
- [ ] Create index.ts in components folders
- [ ] Create index.ts in modal folder
- [ ] Create index.ts in card folder
- [ ] Create index.ts in skeletons folder

### 5.2 Standardize Error Handling
- [ ] Define error handling pattern
- [ ] Create error handling utilities
- [ ] Apply consistently across all components
- [ ] Remove console.error from production code

### 5.3 Create Central Configuration
```typescript
// src/config/app.config.ts
export const APP_CONFIG = {
  pagination: {
    defaultPageSize: 15,
    pageSizeOptions: [10, 15, 20, 50]
  },
  debounce: {
    search: 400,
    scroll: 150
  }
}
```

### 5.4 Add JSDoc Documentation
- [ ] Add JSDoc to all exported components
- [ ] Add JSDoc to all utility functions
- [ ] Add JSDoc to all hooks
- [ ] Add JSDoc to factories

### 5.5 Complete TODOs
- [ ] Implement cart state integration in navbar

---

## Phase 6: File Organization (LOW PRIORITY) 📁

### 6.1 Move Template Files
- [ ] Create `/docs/templates/` folder
- [ ] Move template files or remove if not needed
- [ ] Update documentation references

### 6.2 Complete Refactorings
- [ ] Replace old files with refactored versions
- [ ] Remove `-refactored` suffix
- [ ] Update all imports

---

## Success Metrics

### Code Reduction
- **Before**: ~5000+ lines of duplicated code
- **After**: ~1500 lines (factory functions + implementations)
- **Savings**: ~70% reduction in Redux/Modal code

### Maintainability
- ✅ Single source of truth for CRUD operations
- ✅ Consistent patterns across all features
- ✅ Easy to add new entities (copy 1 config, not 200 lines)
- ✅ Type-safe with TypeScript
- ✅ Documented and tested

### Quality Gates
- ✅ All builds pass
- ✅ No TypeScript errors
- ✅ No console.log in production code
- ✅ All naming conventions fixed
- ✅ All copy-paste bugs fixed

---

## Execution Strategy

### Week 1: Critical Fixes (can be done now)
- Phase 1: All critical fixes
- Test and commit

### Week 2: Redux Refactoring
- Phase 2.1-2.4: Create and apply factories
- Test and commit

### Week 3: Component Refactoring
- Phase 3: Zod schemas
- Phase 4.1-4.2: Migrate modals
- Test and commit

### Week 4: Polish
- Phase 5: Code quality
- Phase 6: Organization
- Final testing and documentation

---

## Risk Mitigation

1. **Make incremental changes** - Each phase commits separately
2. **Test after each change** - Run build and basic tests
3. **Keep git history clean** - Meaningful commit messages
4. **Document breaking changes** - Update README if APIs change
5. **Backup before major refactors** - Tag releases

---

## Files to Create

### Factories
```
src/redux/store/factories/
├── createCRUDSlice.ts          # Generic slice factory
├── createCRUDThunks.ts         # Generic thunk factory
├── createCRUDSelectors.ts      # Generic selector factory
├── createCRUDStateHook.ts      # Generic state hook factory
└── index.ts                    # Barrel export
```

### Validation
```
src/utils/validation/
├── commonSchemas.ts            # Reusable schema pieces
├── schemaHelpers.ts            # Schema composition utilities
└── index.ts
```

### Config
```
src/config/
├── app.config.ts               # Application configuration
└── constants.ts                # Consolidated constants
```

---

Ready to execute? Start with Phase 1 for immediate wins!
