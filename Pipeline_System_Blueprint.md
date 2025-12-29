# Patomove Pipeline System Blueprint

## Overview
Assembly-focused genomic analysis pipeline for pathology labs. Processes assembled genomes to generate resistance profiles, MLST typing, and annotations. Designed as containerized microservice with API integration to main Patomove web application.

## Architecture Strategy

### Docker-First Approach
- Develop and test with Docker (easier development/debugging)
- Convert to Singularity for HPC deployment when needed
- Command: `singularity build pipeline.sif docker://patomove-pipeline:latest`

### Container Benefits
- **Docker**: Better development experience, volume mounting, networking
- **Singularity**: HPC-friendly, no root required, security compliant

## Technology Stack

### Core Framework
- **FastAPI** (Python) - lightweight, async, auto-generated docs
- **SQLAlchemy** - database ORM (shared schema with main app)
- **Celery + Redis** - job queue for async processing (or simple threading for MVP)
- **Docker** - primary containerization

### Bioinformatics Tools
- **Prokka** - rapid prokaryotic genome annotation
- **Bakta** - modern annotation alternative to Prokka
- **ABRicate** - resistance gene screening (CARD, ResFinder databases)
- **mlst** - multilocus sequence typing
- **AMRFinderPlus** - NCBI antimicrobial resistance detection
- **Abricate + VFDB** - virulence factor detection (optional)

### File Handling & Utilities
- **Biopython** - FASTA validation and parsing
- **Pathlib** - robust file path operations
- **Shared volumes** - file exchange between containers

## API Design

### Core Endpoints
```
POST /pipeline/submit
Body: {
  "isolateId": "string",
  "assemblyPath": "/path/to/assembly.fasta", 
  "analysisType": ["resistance", "mlst", "annotation"]
}
Response: {"jobId": "uuid", "status": "queued"}

GET /pipeline/status/{jobId}
Response: {
  "status": "running|completed|failed",
  "progress": 75,
  "currentStep": "annotation",
  "errors": []
}

GET /pipeline/results/{jobId}
Response: {
  "isolateId": "string",
  "resistanceGenes": [...],
  "mlstType": "ST131",
  "annotations": {...},
  "files": {
    "gff": "/results/isolate123.gff",
    "resistance_report": "/results/isolate123_amr.tsv"
  }
}

POST /pipeline/webhook
Body: Pipeline posts completed results to main app
```

### Database Integration Options
1. **Direct write**: Pipeline writes to main PostgreSQL database
2. **API callback**: Pipeline posts results via main app's API endpoints

## Container Architecture

### Dockerfile Structure
```dockerfile
FROM continuumio/miniconda3

# Install bioinformatics tools via BioConda
RUN conda install -c bioconda -c conda-forge \
    prokka \
    abricate \
    mlst \
    ncbi-amrfinderplus \
    biopython \
    fastapi \
    uvicorn \
    sqlalchemy \
    celery \
    redis-py

# Copy application code
COPY api/ /app/
WORKDIR /app

# Expose API port
EXPOSE 8000

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Volume Mounts
- `/data/assemblies` - input FASTA files from main application
- `/data/results` - output annotations and reports
- `/app/config` - database connections and configuration

## Workflow Design

### Processing Steps
1. **File Validation**: Check FASTA format, file accessibility
2. **Gene Calling**: Prokka/Bakta annotation
3. **Resistance Detection**: ABRicate + AMRFinderPlus screening
4. **MLST Typing**: Sequence type determination
5. **Result Aggregation**: Combine outputs into standardized format
6. **Database Update**: Store results linked to isolateId

### Error Handling
- File validation failures
- Tool execution errors
- Database connection issues
- Timeout management for long-running jobs

## Build Instructions

### Prerequisites
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose (optional)
sudo apt install docker-compose
```

### Building the Container
```bash
# Clone/create pipeline directory
mkdir patomove-pipeline
cd patomove-pipeline

# Create Dockerfile (see structure above)
# Create api/ directory with FastAPI application

# Build Docker image
docker build -t patomove-pipeline:latest .

# Test container
docker run -p 8000:8000 -v /path/to/assemblies:/data/assemblies patomove-pipeline:latest

# Verify API endpoints
curl http://localhost:8000/docs  # FastAPI auto-docs
```

### Development Setup
```bash
# Create development environment
python -m venv pipeline-env
source pipeline-env/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy celery redis biopython

# Install bioinformatics tools (via conda/mamba)
conda install -c bioconda prokka abricate mlst ncbi-amrfinderplus
```

### HPC Deployment (Singularity)
```bash
# Build Singularity image from Docker
singularity build patomove-pipeline.sif docker://patomove-pipeline:latest

# Run on HPC
singularity run --bind /data:/data patomove-pipeline.sif

# Or with SLURM
sbatch --wrap="singularity run --bind /data:/data patomove-pipeline.sif"
```

## Integration with Main Application

### Sample Submission Flow
1. User enters isolate metadata in web app
2. User specifies assembly file path
3. Web app validates file path accessibility
4. POST request to pipeline API with isolateId + assemblyPath
5. Pipeline processes asynchronously
6. Results posted back to main app database

### File Path Strategy
- Shared filesystem between web app and pipeline containers
- Consistent mount points: `/data/assemblies`
- File validation before pipeline submission

## Security Considerations
- Container runs with non-root user
- File path validation to prevent directory traversal
- Network isolation between pipeline and main app
- Database credentials via environment variables

## Monitoring & Logging
- FastAPI built-in request logging
- Celery job monitoring
- Tool execution logs
- Database connection health checks

## Future Enhancements
- Raw read processing (FASTQ → assembly)
- Phylogenetic analysis integration
- Quality metrics calculation
- Batch processing capabilities
- Web UI for pipeline management