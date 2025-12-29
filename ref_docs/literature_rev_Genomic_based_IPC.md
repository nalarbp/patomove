# Genomic infection control shows promise but lacks rigorous evaluation frameworks

Whole-genome sequencing for hospital infection control has demonstrated substantial clinical and economic value in real-world deployments, yet the evidence base remains constrained by methodological limitations. **Only one true interrupted time series study** exists evaluating WGS-based interventions, and remarkably few implementations apply established implementation science frameworks like RE-AIM, CFIR, or NPT. Programs achieving sustained routine use share common elements: turnaround times under five days, integration of genomic with epidemiological data, and close collaboration between laboratories and infection prevention teams. The most rigorous prospective evaluation—the UPMC EDS-HAT program—documented **62 infections and 4.8 deaths averted** over two years with a **3.2-fold return on investment**, providing the strongest evidence for clinical and economic viability.

## Implementation science frameworks remain underutilized in genomic infection control

A striking gap exists in the application of established implementation science frameworks to genomic infection control. Extensive searching revealed **no studies explicitly applying RE-AIM or NPT** to evaluate WGS implementation for hospital infection prevention. The closest approximations include Ferdinand et al.'s purpose-built **PG-PHASE framework** (Pathogen Genomics in Public Health Surveillance Evaluation), which offers a three-phase evaluation covering laboratory processes, reporting/communication, and public health utility. This framework has been applied successfully in Australian SARS-CoV-2 surveillance but was developed specifically for pathogen genomics rather than adapting established implementation science theory.

CFIR has been applied to broader genomic medicine implementation, with the IGNITE Network study identifying five critical barriers: EHR integration limitations, physician reluctance due to limited evidence, inadequate reimbursement, communication gaps, and lack of leadership engagement. A 2024 qualitative study of England's NHS Genomic Laboratory Hubs identified **17 CFIR constructs** as barriers or enablers, with "inner setting" and "process" domains proving most critical. However, neither study focused specifically on infection control applications.

The Australian multi-site "Controlling Superbugs" study (Sherry et al., 2022) represents the most methodologically rigorous implementation evaluation, sequencing **2,275 isolates across eight hospitals** over 15 months. While this pragmatic implementation study identified key barriers—turnaround time pressures, complex inter-hospital patient movements, and data integration challenges—it did not employ a formal implementation science framework. The study's finding that 30.8% of patients with multidrug-resistant organisms acquired their infection in hospital, with 86% of VRE cases being hospital-acquired, demonstrated WGS's capacity to reveal transmission patterns invisible to traditional surveillance.

## Barriers span technical, organizational, financial, and workforce domains

The evidence consistently identifies **bioinformatics expertise shortage** and **high costs** as the most significant adoption barriers, appearing across virtually all implementation studies. Technical barriers include inadequate bioinformatics infrastructure, turnaround time pressures (median 33 days in early Australian implementations), data management challenges, and lack of standardized methods. The absence of consensus on SNP thresholds for defining transmission—varying from 15 SNPs for MRSA to 25 SNPs for other organisms—complicates cross-institutional comparisons.

Organizational barriers center on workflow integration and multi-site coordination. The 2023 WHO workshop synthesis (Jauneikaite et al.) highlighted unclear use cases for different settings and the need for validated protocols. Financial barriers include unreliable reimbursement models, absence of billing codes in the United States, and difficulty demonstrating return on investment to hospital administrators. A systematic review of economic evaluations (Price et al., 2023) found only nine studies examining WGS economics, with high heterogeneity precluding meta-analysis—though all supported WGS on economic grounds.

Human factors present perhaps the most persistent challenge. The Global Health Research Unit network's experience implementing WGS across India, Colombia, Nigeria, and Philippines demonstrated that "bioinformatics can be a barrier to starting on the journey; may become overwhelming." Training gaps exist between data generation and interpretation skills. The CDC's Advanced Molecular Detection program addressed this by increasing bioinformaticians from fewer than 12 pre-2013 to approximately 60 within three years through dedicated fellowship programs.

Key facilitators documented across studies include:
- COVID-19 pandemic infrastructure expansion creating foundational capacity
- Demonstrated cost-effectiveness ($695,706 net savings at UPMC)
- Automated bioinformatics pipelines reducing expertise requirements
- User-friendly visualization tools facilitating clinical interpretation
- Multidisciplinary teams spanning bioinformaticians, microbiologists, and infection prevention professionals

## Rigorous quasi-experimental evidence is sparse but growing

The literature on interrupted time series and quasi-experimental evaluation of genomic interventions remains **sparse but emerging**. True ITS studies using segmented regression are remarkably rare—most evaluations employ prospective cohort designs, before-after comparisons with modeling, or descriptive outbreak investigations.

The most methodologically rigorous ITS study is **Karunakaran et al. (2024)**, which evaluated discontinuation of contact precautions for MRSA carriage at UPMC Presbyterian Hospital using WGS-defined outcomes. Over four years (2019-2022), MRSA healthcare-associated infection rates decreased from 4.22 to 2.98 per 10,000 patient days (incidence rate ratio 0.71, 95% CI 0.56-0.89, P=0.001). WGS-defined transmission events showed no significant increase after discontinuing contact precautions (7 before vs. 11 after, IRR 0.90). This study demonstrates WGS's value in providing more accurate measurement of actual transmission than traditional surveillance metrics.

The **EDS-HAT program** (Sundermann et al., 2025) provides the most comprehensive clinical and economic impact data from prospective implementation. Over two years, weekly sequencing of 3,921 healthcare-associated bacterial isolates identified 476 (12.1%) clustering into 172 outbreaks. **95.6% of infection prevention interventions successfully halted transmission** on identified routes. The program estimated 62 infections and 4.8 deaths averted, with gross cost savings of $1,011,146 and net savings of $695,706—representing a 3.2-fold ROI that proved cost-saving in 98% of probabilistic sensitivity analysis simulations.

No stepped-wedge cluster randomized trials specifically evaluating genomic surveillance as the primary intervention have been published. The COG-UK HOCI study, despite massive investment across 14 NHS hospitals, **did not demonstrate statistically significant reduction in hospital-acquired COVID-19 infections**—though it showed that when reports returned within five days, infection prevention actions changed in 20.7% of cases compared to 7.4-7.8% overall. Only 4.6% of rapid-phase samples met the 48-hour target, highlighting that infrastructure alone cannot overcome systems capacity limitations.

| Study | Design | Setting | Key Effect Size |
|-------|--------|---------|-----------------|
| Karunakaran 2024 | ITS | Single US hospital | MRSA HAI IRR 0.71 (0.56-0.89) |
| Sundermann 2025 | Prospective cohort | Single US hospital | 62 infections, 4.8 deaths averted |
| Forde 2023 | Implementation | 3 Australian hospitals | 33% isolates clustered; policy change enabled |
| COG-UK HOCI | Multi-site intervention | 14 UK hospitals | No significant HAI reduction; 20.7% IPC actions changed when <5 days |

## Sustainability frameworks emphasize adaptive capacity and workforce investment

The **Dynamic Sustainability Framework** (Chambers et al., 2013) offers particular relevance for rapidly evolving technologies like WGS, proposing a paradigm shift from viewing sustainability as an endpoint to an ongoing adaptive process. This framework emphasizes continued learning, ongoing adaptation with focus on intervention-context fit, and expectations for ongoing improvement rather than diminishing outcomes.

The **Program Sustainability Assessment Tool (PSAT)** and its clinical adaptation (CSAT) provide validated instruments across eight domains: environmental support, funding stability, partnerships, organizational capacity, program evaluation, program adaptation, communications, and strategic planning. These tools offer practical assessment mechanisms for genomic programs, though they have not been widely applied to infection control implementations.

Successful sustainability models share common structural elements. The **NHS Genomic Medicine Service** operates through seven Genomic Laboratory Hubs serving 55 million people, with centralized commissioning, standardized test directories, and partnerships between research and clinical service. The **GEIS NGS/Bioinformatics Consortium** employs a three-tiered framework—basic, intermediate, and high-performance capabilities—with dedicated program offices providing sustained funding for routine surveillance rather than just outbreak response. The **Global Health Research Unit model** prioritizes laboratory self-sufficiency through train-the-trainer methodology, standardized bioinformatics pipelines using containerization, and versioned standard operating procedures.

Economic modeling supports sustainability arguments. An England model projected WGS surveillance could prevent **74,408 HAIs and 1,257 deaths** at £61.1 million cost against £478.3 million savings. A US model estimated prevention of 169,260 HAIs and 4,862 deaths with $169.2 million investment yielding approximately $3.2 billion savings—$18.74 return per dollar invested. However, a systematic review noted that economic evidence remains "insufficient and of low quality," with considerable variation in evaluation approaches.

Critical success factors for sustained implementation include:
- Transition from research to operational budgets (not solely grant-dependent)
- Diversified funding sources with cost recovery mechanisms
- Training pipelines as ongoing infrastructure rather than one-time investment
- Career pathways with competitive salaries to address workforce retention
- Governance structures with defined roles across laboratory, infection control, and clinical teams

## Eight major programs demonstrate real-world implementation pathways

The **UK National TB WGS Service** represents the most mature national-scale implementation, processing approximately 1,400 mycobacterial samples monthly since 2016. This program reduced time from TB detection to drug susceptibility results from 6-12 weeks to 2-4 weeks, representing a world-first routine diagnostic application. Success factors included government mandate through the 100,000 Genomes Project, partnership between Public Health England and academic institutions, and clear clinical benefit driving adoption.

Australian programs have achieved sustained routine implementation across multiple sites. The **Melbourne Genomics "Controlling Superbugs" study** across eight hospitals led to VRE becoming a notifiable condition in Victoria after demonstrating 86% of VRE cases were hospital-acquired. The **Queensland Health program** has operated for over four years, generating 379 clinical reports identifying 76 distinct genomic clusters. At **Royal Prince Alfred Hospital** in Sydney, local sequencing has enabled successful identification and termination of a 17-month NDM-1 K. pneumoniae outbreak and detection of nine CPE outbreaks over eight years.

The **Netherlands national MRSA surveillance** demonstrates that genomic characterization can sustain exceptionally low infection rates—the Netherlands maintains one of Europe's lowest MRSA rates through its "search and destroy" policy validated by genomic data. Since 2012, 88% of 353 hospital outbreaks were controlled within Phase 1 before becoming public health threats.

Programs that achieved routine implementation share critical elements: **turnaround time under five days** (programs with longer delays showed reduced actionability), integration of genomic data with bed movement and epidemiological information, sustained institutional or government funding, and direct infection prevention team involvement in result interpretation. The COG-UK experience—where world-leading infrastructure failed to demonstrate significant outcome improvement during pandemic volumes—illustrates that genomic capacity cannot overcome systems limitations when infection prevention teams are overwhelmed.

## Conclusion: Addressing evidence gaps to advance the field

This literature review reveals a field with substantial promise demonstrated through real-world implementations but constrained by **methodological limitations in evaluation design**. The absence of controlled interrupted time series studies, stepped-wedge trials, and systematic application of implementation science frameworks represents the most significant evidence gap. The PG-PHASE framework offers a purpose-built evaluation approach, but broader adoption of established frameworks like CFIR would enable cross-study comparison and accelerate field advancement.

Priorities for future research include conducting multi-center controlled ITS designs with external control sites, standardizing outcome measures across HAI rates, transmission events, mortality, and costs, and explicitly applying implementation science frameworks to enable systematic evaluation. The emerging evidence—particularly the UPMC EDS-HAT program's 3.2-fold ROI and 95.6% intervention success rate—provides compelling justification for investment, but transition from research demonstration to routine healthcare delivery requires addressing workforce capacity, establishing reimbursement mechanisms, and building sustainable infrastructure. Programs that have achieved routine implementation demonstrate this transition is possible, but success demands turnaround times under five days, close integration with infection prevention workflows, and sustained institutional commitment extending beyond pilot funding.

The COVID-19 pandemic created unprecedented genomic sequencing infrastructure globally, presenting an opportunity to leverage this capacity for healthcare-associated infection prevention. Whether this infrastructure can be sustained and redirected toward routine pathogen surveillance will depend on developing the evidence base, workforce, and funding models identified as critical across this literature.