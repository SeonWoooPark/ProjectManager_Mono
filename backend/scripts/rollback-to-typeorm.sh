#!/bin/bash

# Rollback script from Prisma to TypeORM
# Use this if the migration fails and you need to revert

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}    TypeORM Rollback Script${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
echo ""

# Confirmation
read -p "⚠️  This will rollback to TypeORM. Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Rollback cancelled.${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting rollback...${NC}"

# Step 1: Remove Prisma packages
echo -e "${YELLOW}Removing Prisma packages...${NC}"
npm uninstall prisma @prisma/client 2>/dev/null || true

# Step 2: Reinstall TypeORM packages
echo -e "${YELLOW}Installing TypeORM packages...${NC}"
npm install typeorm@^0.3.26 pg@^8.16.3 reflect-metadata@^0.2.2 @types/pg@^8.15.5

# Step 3: Remove Prisma files
echo -e "${YELLOW}Removing Prisma files...${NC}"
rm -rf prisma/
rm -f src/lib/prisma.ts src/lib/prisma.template.ts
rm -f src/repositories/*.prisma.ts src/repositories/*.prisma.template.ts

# Step 4: Restore TypeORM files from git
echo -e "${YELLOW}Attempting to restore TypeORM files from git...${NC}"
git checkout HEAD -- src/config/data-source.ts 2>/dev/null || echo "  - data-source.ts not in git"
git checkout HEAD -- src/entities/ 2>/dev/null || echo "  - entities/ not in git"
git checkout HEAD -- src/repositories/user.repository.ts 2>/dev/null || echo "  - user.repository.ts not in git"
git checkout HEAD -- src/server.ts 2>/dev/null || echo "  - server.ts not in git"

# Step 5: Restore tsconfig.json
echo -e "${YELLOW}Restoring TypeScript configuration...${NC}"
# Re-add strictPropertyInitialization: false for TypeORM
if grep -q "strictPropertyInitialization" tsconfig.json; then
    echo "  - strictPropertyInitialization already configured"
else
    # Add the configuration
    sed -i '' '/"strict": true,/a\
    "strictPropertyInitialization": false,' tsconfig.json 2>/dev/null || \
    sed -i '/"strict": true,/a\    "strictPropertyInitialization": false,' tsconfig.json
fi

# Step 6: Clean node_modules and reinstall
read -p "Clean install node_modules? (recommended) (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cleaning and reinstalling dependencies...${NC}"
    rm -rf node_modules package-lock.json
    npm install
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Rollback completed!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Verify TypeORM files are restored correctly"
echo "2. Check database connection in src/config/data-source.ts"
echo "3. Run: npm run dev"
echo "4. Test your application"
echo ""
echo -e "${YELLOW}Note: Some files may need manual restoration if they weren't in git.${NC}"