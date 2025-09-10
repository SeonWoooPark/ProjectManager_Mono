#!/usr/bin/env node

/**
 * Validation script for TypeORM to Prisma migration
 * This script checks if the migration was successful
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const checks = [];
let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    const result = fn();
    if (result) {
      console.log(`${GREEN}✅${RESET} ${name}`);
      passed++;
    } else {
      console.log(`${RED}❌${RESET} ${name}`);
      failed++;
    }
    checks.push({ name, passed: result });
    return result;
  } catch (error) {
    console.log(`${RED}❌${RESET} ${name}: ${error.message}`);
    failed++;
    checks.push({ name, passed: false, error: error.message });
    return false;
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function packageInstalled(packageName) {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );
    return (
      (packageJson.dependencies && packageJson.dependencies[packageName]) ||
      (packageJson.devDependencies && packageJson.devDependencies[packageName])
    );
  } catch {
    return false;
  }
}

function packageNotInstalled(packageName) {
  return !packageInstalled(packageName);
}

console.log('\n=== TypeORM to Prisma Migration Validation ===\n');

// Check Prisma installation
console.log(`${YELLOW}Checking Prisma installation...${RESET}`);
check('Prisma CLI installed', () => packageInstalled('prisma'));
check('Prisma Client installed', () => packageInstalled('@prisma/client'));

// Check Prisma files
console.log(`\n${YELLOW}Checking Prisma files...${RESET}`);
check('Prisma schema exists', () => fileExists('prisma/schema.prisma'));
check('Prisma folder exists', () => fileExists('prisma'));
check('.env file exists', () => fileExists('.env'));

// Check DATABASE_URL in .env
check('DATABASE_URL configured', () => {
  if (!fileExists('.env')) return false;
  const env = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
  return env.includes('DATABASE_URL');
});

// Check Prisma implementation files
console.log(`\n${YELLOW}Checking implementation files...${RESET}`);
check('Prisma client singleton exists', () => 
  fileExists('src/lib/prisma.ts') || fileExists('src/lib/prisma.template.ts')
);
check('Prisma repository exists', () => 
  fileExists('src/repositories/user.repository.prisma.ts') || 
  fileExists('src/repositories/user.repository.prisma.template.ts')
);

// Check TypeORM removal (warning only)
console.log(`\n${YELLOW}Checking TypeORM removal...${RESET}`);
const typeormRemoved = check('TypeORM package removed', () => packageNotInstalled('typeorm'));
const pgRemoved = check('pg package removed (if using Prisma)', () => packageNotInstalled('pg'));
const reflectRemoved = check('reflect-metadata removed', () => packageNotInstalled('reflect-metadata'));

if (!typeormRemoved || !pgRemoved || !reflectRemoved) {
  console.log(`${YELLOW}⚠️  TypeORM packages still installed. Run phase 9 to remove them.${RESET}`);
}

// Check for TypeORM files (warning only)
console.log(`\n${YELLOW}Checking for TypeORM artifacts...${RESET}`);
const hasDataSource = fileExists('src/config/data-source.ts');
const hasEntities = fileExists('src/entities');
const hasTypeORMMigrations = fileExists('src/migrations');

if (hasDataSource || hasEntities || hasTypeORMMigrations) {
  console.log(`${YELLOW}⚠️  TypeORM files still exist:${RESET}`);
  if (hasDataSource) console.log(`  - src/config/data-source.ts`);
  if (hasEntities) console.log(`  - src/entities/`);
  if (hasTypeORMMigrations) console.log(`  - src/migrations/`);
  console.log(`${YELLOW}Run phase 9 to remove them.${RESET}`);
}

// Check migrations
console.log(`\n${YELLOW}Checking migrations...${RESET}`);
check('Migrations folder exists', () => fileExists('prisma/migrations'));

// Summary
console.log('\n=== Summary ===\n');
console.log(`Total checks: ${passed + failed}`);
console.log(`${GREEN}Passed: ${passed}${RESET}`);
console.log(`${RED}Failed: ${failed}${RESET}`);

if (failed === 0) {
  console.log(`\n${GREEN}✅ Migration validation successful!${RESET}\n`);
  process.exit(0);
} else {
  console.log(`\n${RED}❌ Migration validation failed. Please review the errors above.${RESET}\n`);
  
  // Provide suggestions
  console.log('Suggestions:');
  if (!packageInstalled('prisma') || !packageInstalled('@prisma/client')) {
    console.log('- Run: npm install -D prisma && npm install @prisma/client');
  }
  if (!fileExists('prisma/schema.prisma')) {
    console.log('- Run: npx prisma init');
  }
  if (!fileExists('.env') || !check('DATABASE_URL configured', () => true)) {
    console.log('- Configure DATABASE_URL in .env file');
  }
  
  process.exit(1);
}