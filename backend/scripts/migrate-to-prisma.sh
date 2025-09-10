#!/bin/bash

# TypeORM to Prisma Migration Script
# Usage: ./scripts/migrate-to-prisma.sh [phase]

set -e

PHASE=${1:-"all"}
PROJECT_ROOT=$(pwd)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function print_header() {
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}================================================${NC}"
}

function print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

function print_error() {
    echo -e "${RED}❌ $1${NC}"
}

function print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Phase 1: Backup
function phase1_backup() {
    print_header "Phase 1: Backup and Branch Creation"
    
    # Check if on main/master branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "master" ]]; then
        print_warning "Creating new branch for migration..."
        git checkout -b migration/typeorm-to-prisma
        print_success "Branch created: migration/typeorm-to-prisma"
    else
        print_warning "Already on branch: $CURRENT_BRANCH"
    fi
    
    # Backup database schema
    if command -v pg_dump &> /dev/null; then
        print_warning "Backing up database schema..."
        pg_dump -h localhost -U dbuser -d pm_database -s > backup_schema_$(date +%Y%m%d_%H%M%S).sql 2>/dev/null || {
            print_warning "Could not backup database. Make sure PostgreSQL is running and credentials are correct."
        }
    else
        print_warning "pg_dump not found. Skipping database backup."
    fi
    
    print_success "Phase 1 completed"
}

# Phase 2: Install Prisma
function phase2_install() {
    print_header "Phase 2: Installing Prisma"
    
    print_warning "Installing Prisma CLI..."
    npm install -D prisma
    
    print_warning "Installing Prisma Client..."
    npm install @prisma/client
    
    print_success "Phase 2 completed"
}

# Phase 3: Initialize Prisma
function phase3_init() {
    print_header "Phase 3: Initializing Prisma"
    
    print_warning "Initializing Prisma..."
    npx prisma init --datasource-provider postgresql
    
    # Update .env if DATABASE_URL doesn't exist
    if ! grep -q "DATABASE_URL" .env 2>/dev/null; then
        echo "" >> .env
        echo "# Prisma Database URL" >> .env
        echo "DATABASE_URL=\"postgresql://dbuser:dbpassword123@localhost:5432/pm_database?schema=public\"" >> .env
        print_success "Added DATABASE_URL to .env"
    else
        print_warning "DATABASE_URL already exists in .env"
    fi
    
    print_success "Phase 3 completed"
}

# Phase 4: Pull existing schema
function phase4_pull() {
    print_header "Phase 4: Pulling Existing Schema"
    
    print_warning "Introspecting database..."
    npx prisma db pull
    
    print_success "Schema pulled from database"
    print_success "Phase 4 completed"
}

# Phase 5: Create baseline migration
function phase5_baseline() {
    print_header "Phase 5: Creating Baseline Migration"
    
    print_warning "Creating migration directory..."
    mkdir -p prisma/migrations/0_init
    
    print_warning "Generating baseline SQL..."
    npx prisma migrate diff \
        --from-empty \
        --to-schema-datamodel prisma/schema.prisma \
        --script > prisma/migrations/0_init/migration.sql
    
    print_warning "Marking baseline as applied..."
    npx prisma migrate resolve --applied "0_init"
    
    print_success "Phase 5 completed"
}

# Phase 6: Generate Prisma Client
function phase6_generate() {
    print_header "Phase 6: Generating Prisma Client"
    
    print_warning "Generating Prisma Client..."
    npx prisma generate
    
    print_success "Phase 6 completed"
}

# Phase 7: Create new repository files
function phase7_repository() {
    print_header "Phase 7: Creating Prisma Repository Files"
    
    print_warning "Repository files should be created manually"
    print_warning "See MIGRATION_PLAN_TO_PRISMA.md for implementation details"
    
    print_success "Phase 7 requires manual implementation"
}

# Phase 8: Test
function phase8_test() {
    print_header "Phase 8: Running Tests"
    
    if [ -f "src/lib/prisma.ts" ] && [ -f "src/repositories/user.repository.prisma.ts" ]; then
        print_warning "Running tests..."
        npm test || {
            print_error "Tests failed. Please fix issues before continuing."
            exit 1
        }
        print_success "All tests passed"
    else
        print_warning "Prisma implementation files not found. Skipping tests."
    fi
    
    print_success "Phase 8 completed"
}

# Phase 9: Remove TypeORM
function phase9_cleanup() {
    print_header "Phase 9: Removing TypeORM"
    
    read -p "⚠️  This will remove TypeORM completely. Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Removing TypeORM packages..."
        npm uninstall typeorm pg reflect-metadata @types/pg
        
        print_warning "Removing TypeORM files..."
        rm -f src/config/data-source.ts
        rm -rf src/entities
        rm -rf src/migrations
        rm -rf src/subscribers
        
        print_success "TypeORM removed"
    else
        print_warning "Skipped TypeORM removal"
    fi
    
    print_success "Phase 9 completed"
}

# Main execution
case $PHASE in
    1|backup)
        phase1_backup
        ;;
    2|install)
        phase2_install
        ;;
    3|init)
        phase3_init
        ;;
    4|pull)
        phase4_pull
        ;;
    5|baseline)
        phase5_baseline
        ;;
    6|generate)
        phase6_generate
        ;;
    7|repository)
        phase7_repository
        ;;
    8|test)
        phase8_test
        ;;
    9|cleanup)
        phase9_cleanup
        ;;
    all)
        phase1_backup
        phase2_install
        phase3_init
        phase4_pull
        phase5_baseline
        phase6_generate
        phase7_repository
        phase8_test
        print_header "Migration Process Completed"
        print_warning "Please review the changes and test thoroughly"
        print_warning "Run './scripts/migrate-to-prisma.sh 9' to remove TypeORM when ready"
        ;;
    *)
        echo "Usage: $0 [phase]"
        echo "Phases:"
        echo "  1|backup    - Backup and create branch"
        echo "  2|install   - Install Prisma packages"
        echo "  3|init      - Initialize Prisma"
        echo "  4|pull      - Pull existing schema"
        echo "  5|baseline  - Create baseline migration"
        echo "  6|generate  - Generate Prisma Client"
        echo "  7|repository- Create repository files (manual)"
        echo "  8|test      - Run tests"
        echo "  9|cleanup   - Remove TypeORM"
        echo "  all         - Run all phases (except cleanup)"
        exit 1
        ;;
esac