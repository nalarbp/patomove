# Patomove: Genomic Intelligence Platform for Pathology Labs

## Overview

Patomove is a genomic surveillance platform designed specifically for pathology laboratories. It provides a robust, scalable solution for heteroresistance detection and genomic analysis that integrates seamlessly with existing Laboratory Information Management Systems (LIMS).

## Core Problem

**Heteroresistance**: When 99% of bacteria are susceptible but 1% are resistant, standard culture tests miss the resistant subpopulation, leading to treatment failure. Current methods take 72+ hours and still miss these critical cases.

## Solution

Targeted amplicon sequencing that:
- Detects minority resistant populations (1-5%) that culture misses
- Provides results in 6-8 hours
- Integrates with existing lab workflows
- Scales globally with any LIMS

## Architecture Philosophy

### 1. LIMS-Agnostic Design
- Works with ANY pathology lab system (AusLab, Kestral, Epic, etc.)
- Labs adapt to our standard, not vice versa
- API-first architecture for maximum compatibility

### 2. Amino Acid-Centric Approach
- Deduplicate on protein sequence (synonymous SNPs collapse)
- SHA256 hash for internal keys
- UniProt IDs for external alignment
- Solves the "biological truth" versioning problem

### 3. Isolate as Atomic Entity
Each sample is modeled once with links to:
- Assemblies
- Metadata
- Analytics outputs

## Database Schema (MVP)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `isolate` | Master record per clinical sample | `isolate_id` (UUID), `label`, `collection_date`, `source_lab` |
| `protein_ref` | Canonical UniProt entries | `uniprot_id` (PK), `name`, `function`, `sequence_hash` (SHA256) |
| `isolate_protein` | Presence/absence evidence | `isolate_id`, `uniprot_id`, `evidence`, `pipeline_version` |

## LIMS Integration Best Practices

### 1. Data Exchange Standards
- HL7 FHIR for clinical data
- LOINC codes for test ordering
- SNOMED CT for organism identification
- JSON API for real-time updates

### 2. Authentication & Security
- OAuth 2.0 for API authentication
- End-to-end encryption for PHI
- Audit logging for compliance
- Role-based access control

### 3. Workflow Integration Points
- **Pre-analytical**: Specimen registration
- **Analytical**: Sequencing initiation
- **Post-analytical**: Result delivery
- **Quality Control**: Automated QC checks

### 4. Error Handling
- Graceful fallbacks for LIMS downtime
- Queue-based processing for reliability
- Comprehensive error logging
- Automated retry mechanisms

## Data Architecture

### 1. Input Layer
- Raw sequencing data (FASTQ)
- LIMS metadata (specimen, patient, location)
- Reference databases (UniProt, AMRFinderPlus)

### 2. Processing Layer
- Assembly pipeline (Prodigal/PGAP)
- Protein annotation
- Resistance gene detection
- Heteroresistance quantification

### 3. Storage Layer
- PostgreSQL for relational data
- S3-compatible object storage for sequences
- Redis for caching and queues
- Time-series DB for surveillance metrics

### 4. Output Layer
- RESTful API for LIMS integration
- Real-time WebSocket updates
- Standardized report generation
- FHIR-compliant data export

## Development Roadmap

### Phase 1: Core Platform (Current)
- [ ] Database schema implementation
- [ ] LIMS integration framework
- [ ] Basic sequencing pipeline
- [ ] API development

### Phase 2: Heteroresistance Module
- [ ] Targeted amplicon design
- [ ] Minority population detection
- [ ] Clinical correlation engine
- [ ] Validation with retrospective data

### Phase 3: Scale & Deploy
- [ ] Multi-site pilot (2 hospitals)
- [ ] Performance optimization
- [ ] Compliance certification
- [ ] Production deployment

## Technical Stack

- **Backend**: Python (FastAPI)
- **Database**: PostgreSQL + TimescaleDB
- **Queue**: Redis + Celery
- **Pipeline**: Nextflow
- **Containers**: Docker/Kubernetes
- **Monitoring**: Prometheus + Grafana

## Contributing

This is an internal project. For questions or contributions, please contact the Patomove team.

## License

Proprietary - All rights reserved