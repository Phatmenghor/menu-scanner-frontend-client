#!/bin/bash

##############################################################################
# PHASE 1: CRITICAL FIXES - File Renames and Import Updates
##############################################################################

set -e  # Exit on error

echo "🚀 Starting Phase 1: Critical Fixes..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

##############################################################################
# 1.1 Rename Folders and Files
##############################################################################

echo "${YELLOW}Step 1: Renaming folders and files...${NC}"

# Rename avator -> avatar folder
if [ -d "src/components/shared/avator" ]; then
  echo "  📁 Renaming avator -> avatar folder..."
  git mv src/components/shared/avator src/components/shared/avatar
  echo "${GREEN}  ✓ Folder renamed${NC}"
else
  echo "  ⚠️  avator folder not found or already renamed"
fi

# Rename custom-avator.tsx -> custom-avatar.tsx
if [ -f "src/components/shared/avatar/custom-avator.tsx" ]; then
  echo "  📄 Renaming custom-avator.tsx -> custom-avatar.tsx..."
  git mv src/components/shared/avatar/custom-avator.tsx src/components/shared/avatar/custom-avatar.tsx
  echo "${GREEN}  ✓ File renamed${NC}"
fi

# Rename submid-button.tsx -> submit-button.tsx
if [ -f "src/components/shared/form-field/submid-button.tsx" ]; then
  echo "  📄 Renaming submid-button.tsx -> submit-button.tsx..."
  git mv src/components/shared/form-field/submid-button.tsx src/components/shared/form-field/submit-button.tsx
  echo "${GREEN}  ✓ File renamed${NC}"
fi

# Rename auth-resposne.ts -> auth-response.ts
if [ -f "src/redux/features/auth/store/models/response/auth-resposne.ts" ]; then
  echo "  📄 Renaming auth-resposne.ts -> auth-response.ts..."
  git mv src/redux/features/auth/store/models/response/auth-resposne.ts src/redux/features/auth/store/models/response/auth-response.ts
  echo "${GREEN}  ✓ File renamed${NC}"
fi

echo ""

##############################################################################
# 1.2 Update Imports
##############################################################################

echo "${YELLOW}Step 2: Updating import statements...${NC}"

# Update avator -> avatar imports
echo "  🔄 Updating avator -> avatar imports..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" -exec \
  sed -i 's|@/components/shared/avator/|@/components/shared/avatar/|g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" -exec \
  sed -i 's|custom-avator|custom-avatar|g' {} +

# Update submid-button -> submit-button imports
echo "  🔄 Updating submid-button -> submit-button imports..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" -exec \
  sed -i 's|submid-button|submit-button|g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" -exec \
  sed -i 's|SubmidButton|SubmitButton|g' {} +

# Update auth-resposne -> auth-response imports
echo "  🔄 Updating auth-resposne -> auth-response imports..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" -exec \
  sed -i 's|auth-resposne|auth-response|g' {} +

echo "${GREEN}  ✓ Imports updated${NC}"
echo ""

##############################################################################
# Summary
##############################################################################

echo "${GREEN}✅ Phase 1.1 Complete: File Renames${NC}"
echo ""
echo "Files renamed:"
echo "  - avator/ -> avatar/"
echo "  - custom-avator.tsx -> custom-avatar.tsx"
echo "  - submid-button.tsx -> submit-button.tsx"
echo "  - auth-resposne.ts -> auth-response.ts"
echo ""
echo "All imports have been updated automatically."
echo ""
echo "Next: Run 'npm run build' to verify changes"
