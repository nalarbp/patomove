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
- **Genome Management**: Managed file approach replacing text-based assembly paths
- **Protein-centric**: Using UniProt IDs as stable references
- **Outcome tracking**: Captures real-world treatment success/failure
- **Pipeline Integration**: Direct linkage between managed genomes and analysis workflows

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

### ✅ December 2024 Completed
1. Project initialization with secure dependency versions
2. **Enhanced database schema with genome linking architecture**
   - **sampleType field**: `'clinical' | 'environmental'` (lowercase standardization)
   - **priority field**: `'normal' | 'priority'` (lowercase standardization)  
   - **processingStatus field**: Genomics-focused stages - `'to be sequenced' | 'genome sequenced' | 'genomics processing' | 'genomics completed'`
   - **Audit trail fields**: createdBy/updatedBy for user tracking
   - **Foreign key constraints**: orgId required, conditional patientId/environmentId based on sampleType
   - **Schema validation**: Business logic enforces exactly one of patientId OR environmentId
   - **Genome linking fields**: linkedAt, autoLinked, linkingMethod for tracking genome-isolate relationships
   - **Complete database reset script**: Single command `./reset_db.sh` handles everything
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
   - Updated navigation: Dashboard | Browse Isolates | **Sample Management** | **Genome Management** | Analytics
   - Sample Management sub-menu with tabbed interface
   - URL routing: `/path-lab/samples` for CRUD operations, `/path-lab/genomes` for file management
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
8. **Complete Sample Management System with Standardized Schema**
   - **Two-Panel Interface**: CSV upload (left) + Individual form (right) in unified workflow
   - **CSV Import with Manual Curation**: Upload CSV → Click samples to prefill form → Review and submit individually
   - **Searchable Dropdowns**: Organization/Patient/Environment selectors with "Create New" functionality
   - **Foreign Key Dependency Management**: Create missing dependencies via modal forms to solve chicken-egg problems
   - **Schema-Compliant Validation**: Real-time error checking with sampleType-based conditional requirements
   - **Navigation Warnings**: Alerts when leaving page with uploaded CSV data (browser refresh/close + internal navigation)
   - **Status Tracking**: Visual indicators for pending/selected/completed samples with form communication
   - **Template Download**: CSV template generation with lowercase standardized values
   - **Lowercase Schema Standardization**: All enum values converted to lowercase for consistency
   - **Genomics-Focused Workflow**: Processing stages aligned with sequencing pipeline instead of traditional culture workflow
9. **Fixed hardcoded data issues and cache problems**
   - **Browse Isolates**: Updated from 499 mock isolates to real API data with `cache: 'no-store'`
   - **API Integration**: All components now use real database instead of hardcoded values
   - **Cache Management**: Clear Next.js cache and browser cache resolution strategies
   - **Database Verification**: Tools to verify actual vs displayed data consistency
10. **Complete Genome Management System (NCBI SRA-style)**
   - **Genome Management Page**: Full-featured file upload and management interface at `/path-lab/genomes`
   - **Drag-and-Drop Upload**: Multi-file upload with progress tracking and real-time validation
   - **File Validation System**: Automatic format checking, quality metrics calculation (N50, GC content, contig count)
   - **Genome Library View**: Searchable, filterable library with status tracking and metadata display
   - **Database Schema Evolution**: Replaced text-based assemblyPath with managed GenomicData relationships
   - **Smart Form Integration**: GenomeSelect component shows only validated files for sample linking
   - **Pipeline Integration**: Updated PipelineStatus to work with managed genome objects instead of file paths
   - **API Infrastructure**: Complete CRUD operations for genome files (`/api/genomics`, `/api/genomics/[id]`)
   - **Quality Assurance**: File hash verification, duplicate detection, storage path management
   - **Professional UX**: Status indicators, upload guidelines, file format support, real-time feedback
11. **Enhanced Pipeline Integration**
   - **Managed Genome Workflow**: Pipeline now operates on validated, managed genome files
   - **Metadata Tracking**: Genome IDs, file hashes, and validation status tracked in pipeline jobs
   - **Webhook Enhancement**: Pipeline results update managed genome records with analysis data
   - **Quality Metrics**: Real-time assembly statistics (N50, GC content, contig count) from validation
   - **Status Synchronization**: Pipeline job status synced with genome processing status
12. **Production-Ready File Transfer System**
   - **Two-Step Pipeline Integration**: Upload file to pipeline → Submit job with returned path
   - **Direct File Upload**: Files transferred directly to pipeline server storage via `/pipeline/upload` endpoint
   - **Real File Processing**: Pipeline receives actual files instead of text paths, eliminating file access failures
   - **Proper Analysis Types**: Updated to use pipeline's required analysis types: `['resistance', 'mlst', 'annotation']`
   - **Error Handling**: Separate validation for file upload vs job submission with detailed error reporting
   - **Progress Tracking**: Clear progress indicators through upload → validation → job submission workflow
13. **Performance Optimization**
   - **Fixed Polling Issues**: Resolved excessive API calls caused by useEffect dependency loops
   - **Consistent Intervals**: All components now use 1-minute polling intervals instead of aggressive 5-10 second calls
   - **Reduced Database Load**: Eliminated redundant Prisma queries from concurrent polling loops
   - **Component Synchronization**: AnalysisQueue, GenomeLibrary, and PipelineStatus use unified polling strategy
   - **Debug Logging**: Maintained console logs for monitoring polling behavior during development
14. **Modern Sidebar Navigation System**
   - **Collapsible Sidebar**: Toggle between expanded (256px) and collapsed (64px) states with smooth animations
   - **Persistent State**: User preference saved to localStorage and maintained across sessions
   - **Fixed Position**: Sidebar stays in viewport while main content scrolls independently
   - **Mobile Responsive**: Auto-collapses on tablet/mobile with appropriate breakpoints
   - **Unified Navigation**: Combined main nav (Path Lab/IPC), feature nav, user controls in single sidebar
   - **Bottom-Sticky Controls**: User avatar, settings, and role switching always visible at bottom
15. **Enhanced Genome Management Architecture**
   - **Smart Linking System**: Database-generated UUIDs as primary keys, filenames as metadata
   - **Auto-Suggestion API**: `/api/isolates/[id]/genome-suggestions` for intelligent genome-isolate matching
   - **Confidence Scoring**: Fuzzy filename matching with percentage confidence ratings
   - **Dynamic Filter Population**: Browse Isolates filters now populate from actual database values
   - **Linking Workflow**: Upload-direct, auto-match, or manual linking options
   - **Audit Trail**: Track how genomes were linked (auto vs manual) with timestamps
16. **Sample Detail Page Enhancements**
   - **Separated Layout Architecture**: Main sample report section cleanly separated from Quick Actions panel
   - **Quick Actions Panel**: Compact sidebar with Export to PDF, Edit Sample, and Delete Sample buttons  
   - **PDF-Ready Structure**: Sample report section (`#sample-report`) designed for clean export without UI controls
   - **Professional Styling**: Smaller, focused action buttons with proper icons and hover states
17. **PDF Export Implementation (Image-Based)**
   - **PDF Generation Libraries**: Installed `jspdf`, `html2canvas`, `react-to-print` for export functionality
   - **Export Utility (`lib/pdfExport.ts`)**: Professional PDF generation with margins, multi-page support, and branding
   - **ExportButton Component**: Reusable component with loading states and error handling
   - **Tailwind v4 Compatibility**: Comprehensive oklch-to-hex color conversion for html2canvas compatibility
   - **Professional PDF Output**: Clean PDFs with platform branding, timestamps, and proper filename generation
   - **Known Limitation**: Current implementation generates raster images (not selectable text) - marked for improvement
18. Auth-agnostic architecture with audit trail ready  
19. Professional UI with no emojis, flexbox layouts, scientific standards

## Current Feature Set

### 🏥 Laboratory Operations
- **Modern Sidebar Navigation**: Collapsible left sidebar with unified navigation controls
- **Dashboard**: Real-time metrics, recent samples, processing overview
- **Browse Isolates**: Advanced filtering with dynamic population from database values
- **Sample Management**: Dual-panel CSV import + manual entry with validation
- **Genome Management**: NCBI SRA-style file upload with smart linking system
- **Analytics**: Genomic insights and resistance patterns (placeholder)

### 🧬 Genome Management Features
- **Multi-file Upload**: Drag-and-drop interface with progress tracking
- **Format Validation**: Automatic FASTA/FASTQ format verification
- **Quality Metrics**: Real-time N50, GC content, contig count calculation
- **Status Tracking**: Upload → Validation → Analysis → Completion workflow
- **Smart Linking System**: Database-generated IDs with filename-based auto-suggestions
- **Genome Suggestions**: Intelligent matching between uploaded genomes and isolates
- **Pipeline Integration**: Direct submission to analysis pipeline from genome library
- **Search & Filter**: Find genomes by filename, status, upload date, file size
- **Metadata Management**: File hash verification, original filename preservation
- **Linking Audit Trail**: Track how genomes were linked (auto vs manual) with timestamps

### 🔄 Sample Workflow
- **CSV Bulk Import**: Upload sample lists with manual curation and validation
- **Individual Entry**: Complete form-based sample creation with dropdown selectors
- **Foreign Key Management**: Create missing organizations/patients/environments on-the-fly
- **Genome Association**: Link validated genome files to samples for analysis
- **Status Tracking**: Processing stages aligned with genomic workflow
- **Data Validation**: Real-time error checking with schema compliance

### 🔌 API & Integration
- **RESTful APIs**: Complete CRUD operations for all entities
- **Pipeline Integration**: Webhook support for analysis result updates
- **Database Relationships**: Proper foreign key constraints and data integrity
- **Error Handling**: Comprehensive validation and user feedback
- **Schema Evolution**: Support for database migrations and updates

### 📋 Next Steps (Priority Order)
1. **PDF Export Enhancement** - Replace image-based PDF with native vector PDF generation using jsPDF with proper text rendering, selectable content, and vector graphics
2. **Edit Sample Functionality** - Implement edit sample form and validation for the Quick Actions panel
3. **Delete Sample Functionality** - Add confirmation dialog and safe deletion with cascade handling
4. **Genome Linking UI Implementation** - Complete the genome suggestions UI and linking workflow
5. **Genome Library Filtering** - Add filters for unlinked genomes and linking status
6. **Batch Genome Processing** - Support for bulk genome upload and pipeline submission
7. **Advanced Quality Control** - Assembly quality thresholds, contamination detection, species verification  
8. **Analytics dashboard** - genomic insights, resistance patterns, QC metrics visualizations
9. **IPC staff dashboard** - outbreak detection, cluster analysis, epidemiological tools
10. **Sample workflow actions** - update processing status, assign technicians, workflow automation
11. **Alerts system** - overdue samples, QC failures, phenotype-genotype mismatches
12. **Batch operations** - bulk status updates, technician assignment, export functionality
13. **Enhanced validation** - advanced CSV field validation, duplicate detection
14. **User authentication** - implement user login with organization-based access control
15. **AWS deployment** - EC2 t3.micro with production PostgreSQL database

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
- **Genome Management Ready**: Schema supports managed genome file relationships
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
