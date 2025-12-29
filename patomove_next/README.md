# Patomove Next.js Web Application

## Overview
Patomove is a genomic intelligence platform designed for pathology laboratories to bridge the gap between phenotypic culture results and genomic insights.

## Key Design Decisions

### 1. Path Lab Workflow Understanding
- Mapped standard pathology workflow: sample → culture → ID → susceptibility testing
- Identified key pain points: 
  - Culture says "susceptible" but treatment fails
  - Cannot detect heteroresistance (minority resistant populations)
  - Missing genomic context for outbreak detection
  - Manual interpretation of phenotype-genotype mismatches

### 2. User-Centric Design
- **Primary users**: Path lab staff (technicians, scientists, directors)
- **Secondary users**: External IPC teams, clinicians from client hospitals
- **Key questions the app answers**:
  - "Are these isolates from different patients actually related?"
  - "What resistance genes are present beyond phenotypic testing?"
  - "Why did therapy fail despite 'susceptible' result?"
  - "Is this an outbreak requiring urgent intervention?"

### 3. Technology Stack (Security-First)
- **Next.js 15.5.9** with **React 19.2.3** (patched versions avoiding CVE-2025-55182)
- **TypeScript** for type safety
- **Jotai** for state management
- **Tailwind CSS** for styling
- **Prisma** ORM with PostgreSQL
- **Auth provider agnostic** design (not locked to Auth0)

### 4. Database Architecture

#### Phenotype-First Approach
Instead of starting with genomics, we prioritize clinical phenotypes (MIC values) and link them to:
1. Treatment outcomes (did therapy work?)
2. Genomic features (which genes predict failure?)
3. Future ML predictions

#### Key Schema Decisions
- **Organization model**: Path lab is the system, external orgs are clients
- **User model**: Auth-agnostic with flexible provider support
- **Isolate model**: Core entity linking all data
- **Protein-centric**: Using UniProt IDs as stable references
- **Outcome tracking**: Captures real-world treatment success/failure

### 5. ComponentFeedback System
- **Real-time UI feedback**: Every component includes `<ComponentFeedback componentName="ComponentName" />` for MVP testing
- **Purpose**: Capture user feedback on specific UI components during early adoption
- **Storage**: Currently localStorage, will migrate to database later
- **Features**: Star rating (1-5) + optional comment, non-intrusive vertical dots (⋮)
- **Visibility**: Development mode by default, can enable in production with `showInProduction={true}`

### 6. UI Guidelines
- **NO EMOJIS**: Never use emojis anywhere in the application - use proper icons (SVG/icon components) instead
- **Professional appearance**: Maintain scientific/medical application standards
- **Icon libraries**: Use Heroicons, Lucide, or custom SVG icons for visual elements
- **FLEXBOX PREFERRED**: Always use flexbox layout instead of CSS Grid for layout consistency and familiarity

### 7. MVP Simplifications
- No Docker/complex infrastructure (direct EC2 deployment)
- PostgreSQL only (no TimescaleDB yet)
- Local file storage (no S3 initially)
- Synchronous processing (no job queues)
- Focus on core genomic insights over fancy features

## Progress Made

### ✅ Completed
1. Project initialization with secure dependency versions
2. **Enhanced database schema with schema constraints**
   - **sampleType field**: Enforces Clinical/Environmental classification at schema level
   - **Audit trail fields**: createdBy/updatedBy for user tracking
   - **Foreign key constraints**: orgId required, conditional patientId/environmentId based on sampleType
   - **Schema validation**: Business logic enforces exactly one of patientId OR environmentId
   - **Fresh database reset mechanism**: Enhanced reset_db.sh with auto-seeding (50 samples)
3. **Database and API layer complete**
   - Prisma 6.1.0 (stable version) with SQLite for development
   - All models updated with new schema constraints
   - **API routes implemented and tested**:
     - `GET/POST /api/organizations` - Lab management
     - `GET/POST /api/isolates` - Sample tracking with new sampleType field
     - `GET/POST /api/patients` - Patient data
     - `POST /api/environments` - Environmental sampling sites
     - `POST /api/phenotypes` - Antimicrobial susceptibility profiles
     - `POST /api/genomics` - Whole genome sequencing data
     - Full CRUD operations with proper error handling
4. **Professional navigation system with Sample Management**
   - Updated navigation: Dashboard | Browse Isolates | **Sample Management** | Analytics
   - Sample Management sub-menu with tabbed interface
   - URL routing: `/path-lab/samples` for CRUD operations
   - Flexbox-preferred layouts throughout (per UI guidelines)
5. **Complete CRUD system for isolate management**
   - **Add New Isolate Form**: Manual entry with smart validation and searchable dropdowns
   - **CSV Import with Manual Curation**: Table-based review with individual sample submission
   - **Searchable dropdown components**: Organization, Patient, Environment selectors with "Create New" functionality
   - **Foreign key dependency handling**: Create missing orgs/patients/environments on-the-fly via modals
   - **Schema-compliant validation**: Real-time error checking, required field enforcement
6. **Path Lab dashboard implementation**
   - **Enhanced Processing Overview**: Total this week/month, process stages, top submitters/collection sites
   - **Recent Samples table**: Shows 10 latest isolates with proper navigation links
   - **Real-time metrics** with proper organization/site aggregation
   - ComponentFeedback integration throughout UI
7. **Browse Isolates functionality**
   - Advanced filtering system with manual trigger (prevents heavy reloads)
   - Filter by: text search, species, collection source/site, date range
   - URL-based filter state management for sharing/bookmarking
   - Card-based layout with proper navigation links to individual isolate pages
   - Pagination system (10 per page)
   - Integration with updated schema fields
8. **Complete Sample Management System**
   - **Two-Panel Interface**: CSV upload (left) + Individual form (right) in unified workflow
   - **CSV Import with Manual Curation**: Upload CSV → Click samples to prefill form → Review and submit individually
   - **Searchable Dropdowns**: Organization/Patient/Environment selectors with "Create New" functionality
   - **Foreign Key Dependency Management**: Create missing dependencies via modal forms to solve chicken-egg problems
   - **Schema-Compliant Validation**: Real-time error checking with sampleType-based conditional requirements
   - **Navigation Warnings**: Alerts when leaving page with uploaded CSV data to prevent accidental loss
   - **Status Tracking**: Visual indicators for pending/selected/completed samples with form communication
   - **Template Download**: CSV template generation for proper data formatting
9. Auth-agnostic architecture with audit trail ready
10. Professional UI with no emojis, flexbox layouts, scientific standards

### 📋 Next Steps
1. **Analytics dashboard** - genomic insights, resistance patterns, QC metrics visualizations
2. **IPC staff dashboard** - outbreak detection, cluster analysis, epidemiological tools
3. **Sample workflow actions** - update processing status, assign technicians, workflow automation
4. **Alerts system** - overdue samples, QC failures, phenotype-genotype mismatches
5. **Individual isolate detail pages** - complete sample history, workflow timeline, genomic results
6. **Batch operations** - bulk status updates, technician assignment, export functionality
7. **Enhanced validation** - advanced CSV field validation, duplicate detection
8. **User authentication** - implement user login with organization-based access control
9. **AWS deployment** - EC2 t3.micro with production PostgreSQL database

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables (SQLite for development)
echo 'DATABASE_URL="file:./dev.db"' > .env

# Initialize database with schema
npx prisma db push --accept-data-loss

# Start development server
npm run dev
```

## Database Reset & Demo Data

Enhanced database reset mechanism with automatic demo data population:

```bash
# One-command fresh start (recommended for development)
cd db_demo
./reset_db.sh

# This script automatically:
# 1. Removes existing SQLite database
# 2. Recreates schema with latest Prisma changes
# 3. Regenerates Prisma client
# 4. Populates with 50 demo isolates
```

**Enhanced reset_db.sh includes:**
- Fresh schema deployment with new sampleType and audit fields
- Auto-population of 50 realistic demo samples
- Proper foreign key relationships with schema constraints
- Clean development environment setup

**Alternative manual generation:**
```bash
# Custom sample count (requires server running at localhost:3000)
python3 generate_db_demo.py --isolates 100 --populate

# Generate JSON only (no database population)
python3 generate_db_demo.py --isolates 100 --output demo_data.json
```

**Demo data includes:**
- 2 Organizations (pathology lab + hospital)
- 50 Patients with realistic demographics  
- 10 Environmental sampling sites
- Multiple Phenotype profiles with MIC data
- 50+ Isolates (75% Clinical, 25% Environmental) with proper sampleType classification
- Realistic date distribution over 6 months
- **Schema-compliant relationships**: All foreign key constraints satisfied

## Environment Setup
Required environment variables:
- `DATABASE_URL`: Database connection string (SQLite: `file:./dev.db`)
- `AUTH0_*`: Auth0 configuration (when ready)

## Key Insights
1. **Genomics augments, not replaces**: Culture remains gold standard, genomics adds the "why"
2. **Speed matters**: Path labs need answers during their workflow, not days later
3. **Trust is critical**: Phenotype-genotype mismatches need clear explanations
4. **Future vision**: Building training data for ML-predicted MICs from genomics

## Test Update
This is a test update to verify git functionality.
