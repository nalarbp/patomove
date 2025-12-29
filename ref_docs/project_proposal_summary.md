# Project Proposal Summary: Hospital Genomic Surveillance System

## Core Problem Identified
- Hospital genomic surveillance exists but has limited IPC team adoption
- Current systems are observational/retrospective with minimal behavioral impact
- "We're always behind" - outbreaks detected 2-3 weeks after first case
- Hand hygiene more effective than fancy clustering visualizations

## Key Challenges to Address

### National Relevance
- Need to articulate why this matters beyond one hospital
- Must address gap in existing surveillance (AusTrakka already exists)
- Focus on clinical decisions changed, not tech features

### Sustainability Crisis
- Who maintains system after deployment?
- Pathology labs as potential adopters (have infrastructure but need value proposition)
- State-level public pathology services = better target than individual hospitals
- Avoid creating orphaned systems

### User vs. Builder Perspective
- Building from your interests (genomics, algorithms) instead of user pain points
- Need to validate actual workflow problems before coding
- Talk to IPC teams about tedious, manual, error-prone tasks they hate

## Proposed 3-Aim Structure

### Aim 1: Deployment & Implementation
- Deploy MVP at 2 hospitals (do this BEFORE applying for funding)
- Evaluate adoption, usability, sustainability pathways
- Interrupted time series or stepped wedge design
- Outcomes: time to outbreak detection, IPC response time
- Include handover/sustainability model (pathology lab integration)

### Aim 2: Comparative Effectiveness
- Statistical power from cases, not hospitals (n=cases over time, not n=2)
- Primary outcome: time from culture to IPC action
- Implementation barriers analysis - why some adopt, others don't

### Aim 3: Genomics Science
- Predicting high-transmission vs. dead-end strains from genomic features
- Mobile genetic elements, biofilm genes, fitness markers
- Train on retrospective data where transmission outcomes known
- Validate prospectively

**Critical question:** Does genomics add predictive power beyond context (ward type, patient mobility, IPC practices)?

## Grant Strategy

### Target: MRFF (not NHMRC)
- Project grant first, fellowship later
- Your work is too applied for NHMRC
- MRFF explicitly funds translation/implementation research
- Check for AMR-specific funding calls

### Timeline
- **Now-6 months:** 2-hospital pilot, collect preliminary data
- **2025-2026:** Apply for MRFF project grant
- **2026-2027:** Apply for fellowship with stronger track record

### Track Record Reality Check
- 5 first-author papers post-PhD (decent, not strong)
- h-index 7 (respectable for 3 years post-PhD)
- Good alignment with proposed area (HAIviz, GraphSNP, surveillance papers)
- Competitive for project grants now, fellowship is stretch

**Frame Queensland Health role positively:** "Deployed genomic systems across Queensland Health" = translational impact, not research gap

## Critical Feedback Points

### What NOT to do:
- Data standardization research (produces paper no one implements)
- Agent-based modeling (cool but likely unused by IPC)
- "Predictive" tech without solving speed problem first
- Fellowship application before preliminary data exists
- Build apps based on your interests rather than user needs

### What TO do:
- Shadow IPC teams, watch their actual workflows
- Get 2 hospitals committed to pilot NOW
- Focus on measurable clinical outcomes
- Build MVP, iterate based on usage data
- Talk to pathology lab management about sustainability
- Prepare for "what's broken that needs fixing?" questions

## Core Philosophy Shift
Stop asking: "What can I build with my skills?"
Start asking: "What problem makes someone's job hell?"

Your genomics skills can solve many problems. Find ones where people are desperate for solutions.

## Action Items
1. Identify 2 hospitals willing to pilot (next 6 months)
2. Talk to IPC colleagues about actual workflow pain points
3. Validate pathology lab interest in maintaining system
4. Define primary outcome metric (time to detection? secondary cases prevented?)
5. Check MRFF funding rounds and eligibility criteria
6. Build preliminary data showing system works and gets used

## Key Metrics for Success
- IPC teams actually USE the system (not just observe)
- Measurable reduction in outbreak response time
- Clear adoption pathway for other hospitals
- Publications in implementation/clinical journals (not just genomics methods)

## Updated Strategic Positioning (December 26, 2025)

### Context: Avoiding overlap with Dr. Jessica Schults' funded work
- Schults has $1.6M for IPC workflow optimization, data standardization, report generation
- Her work: making IPC teams more efficient at documenting infections
- Gap: standardized data doesn't reveal if transmission links are biologically real

### Refined 3-Aim Structure for Grant Proposal

#### Aim 1: Transmission Dynamics Discovery
- **Beyond basic linkage:** Identify genomic features that predict super-spreading events
- **Track correlations:**
  - Biofilm gene presence vs transmission cluster size
  - Mobile genetic elements vs outbreak extent
  - Virulence factors vs patient mortality/severity
- **Outcome:** New biological knowledge about hospital pathogen behavior

#### Aim 2: Decision Threshold Calibration
- **Problem:** Current SNP thresholds (15 for MRSA, 25 for others) are arbitrary
- **MVP captures ground truth:**
  - When IPC declares outbreak → what was actual SNP distance?
  - When they miss transmission → what genomic signal was ignored?
  - Are thresholds organism-specific or can we develop universal rules?
- **Outcome:** Evidence-based transmission thresholds replacing arbitrary cutoffs

#### Aim 3: Predictive Genomics for IPC
- **Shift from retrospective to prospective:** Not "were they linked?" but "will this spread?"
- **Predictive features:**
  - Which strains persist longer on surfaces?
  - Which acquire resistance faster in hospital environment?
  - Which transmit despite standard precautions?
- **Outcome:** Risk stratification tool for newly detected pathogens

### Core Philosophy: The Transmission Truth Layer
- **Complementary positioning:** "Dr Schults' infrastructure creates standardized, high-quality IPC data. My genomics adds the missing biological truth layer."
- **Key differentiator:** Her tools make wrong decisions faster and more consistently. Genomics reveals which decisions were wrong in the first place.
- **Not just another dashboard:** This is genomics science using IPC as a living laboratory

### MVP Experiment Design Insights
- **Component-level randomization** with 5 hospitals max
- **Track specific IPC decision points:**
  - Morning lab review: "Is this the same strain?"
  - Isolation decisions: "Same room or separate?"
  - Outbreak declaration: "Cluster or coincidence?"
- **Measure decision changes:** For each decision, did genomics change the action?

## Pivot to Heteroresistance Detection (December 26, 2025)

### The Problem: Hidden Treatment Failure
- **Heteroresistance**: 99% susceptible bacteria + 1% resistant subpopulation
- Standard culture tests report "susceptible" based on majority
- Patient treated with standard antibiotic → 1% survives → treatment fails

### Evidence from Literature Review (61 papers)
- **Clinical Impact**: 
  - 2.5x higher mortality (vancomycin, Korea 2025)
  - 2.72x treatment failure (TB, 2025)
  - 11.5% of UTI patients affected
- **Prevalence**: 27-93% depending on organism/antibiotic
- **Detection Gap**: Only 4/61 papers used molecular methods

### Proposed Solution: Targeted Amplicon Sequencing
- **Not whole genome**: Multiplex PCR of 50-100 resistance genes
- **Detects minority populations**: 1-5% that culture misses
- **Rapid turnaround**: 6-8 hours vs 72+ for current methods
- **Path lab integration**: Adds to existing workflow without disruption

### Research Questions
1. What's minimum detection threshold predicting failure? (1%? 5%?)
2. Which gene combinations matter most clinically?
3. Can serial isolates reveal evolution from susceptible → resistant?

### Strategic Positioning
- **Complements Dr. Schults' work**: She standardizes data; we add biological truth
- **Path lab service extension**: Premium add-on to routine culture
- **First-to-market**: No current molecular heteroresistance detection exists

### Grant Strategy
- **Retrospective validation**: Test stored isolates from treatment failures
- **Show hidden resistance**: "Look, 27% had resistant subpopulations all along"
- **Clinical utility**: Prevent 47% "very major errors" in antibiotic selection

## MVP Platform Architecture (December 26, 2025)

### Vision: Genomic Intelligence Platform
- **Layer 1**: Data architecture that works with ANY path lab system (AusLab, Kestral, Epic, etc.)
- **Layer 2**: Genomic analysis modules (heteroresistance, outbreak detection, etc.)
- **Global scalability**: Labs adapt to our standard, not vice versa

### Core Database Schema Design

#### Isolate as Central Entity
**Biological Attributes** (what IS it):
- Species/strain identification
- Genomic sequence data
- Resistance genes present
- Virulence factors
- MLST/cgMLST typing
- SNP variants
- Plasmids detected

**Epidemiological Attributes** (WHERE/WHEN/WHO):
- Collection date/time
- Patient ID (anonymized)
- Sample source
- Ward/unit location
- Clinical context (minimal, privacy-preserving)

### Critical Standardization Challenges

**The Biological Properties Problem:**
1. **Species taxonomy**: NCBI vs GTDB? Which authority?
2. **Strain typing**: MLST not available for all species - use PopPUNK instead?
3. **Resistance genes**: AMRFinderPlus database updates - re-run all analyses?
4. **Virulence factors**: Which database? VFDB? Updates?
5. **Versioning nightmare**: Same isolate, different results over time

**Key Insight**: Before building the schema, must solve the "biological truth" problem - which standards and databases define our ground truth?

---
*Discussion date: December 19, 2025*
*Strategic update: December 26, 2025*
