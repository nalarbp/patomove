# Patomove Pipeline - Development Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB of RAM available for the container
- FASTA assembly files to process

### Build and Run

```bash
# Build the Docker image
docker-compose build

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Check health
curl http://localhost:3456/health
```

The API will be available at `http://localhost:3456` with automatic documentation at `http://localhost:3456/docs`.

## Project Structure

```
patomove_pipeline/
├── api/
│   ├── __init__.py          # Package initialization
│   ├── main.py              # FastAPI application and endpoints
│   ├── config.py            # Configuration management
│   ├── schemas.py           # Pydantic models for requests/responses
│   ├── pipeline.py          # Core pipeline logic
│   └── jobs.py              # Job management and threading
├── data/
│   ├── assemblies/          # Input FASTA files
│   └── results/             # Output results and annotations
├── Dockerfile               # Container definition
├── docker-compose.yml       # Development orchestration
├── requirements.txt         # Python dependencies
└── README.md               # Project overview
```

## API Usage

### 1. Submit a Pipeline Job

```bash
curl -X POST http://localhost:3456/pipeline/submit \
  -H "Content-Type: application/json" \
  -d '{
    "isolate_id": "EC001",
    "assembly_path": "/data/assemblies/EC001.fasta",
    "analysis_types": ["resistance", "mlst", "annotation"]
  }'
```

Response:
```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "queued",
  "message": "Job submitted successfully"
}
```

### 2. Check Job Status

```bash
curl http://localhost:3456/pipeline/status/123e4567-e89b-12d3-a456-426614174000
```

Response:
```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "isolate_id": "EC001",
  "status": "running",
  "progress": 45,
  "current_step": "annotation",
  "errors": [],
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:31:30",
  "completed_at": null
}
```

### 3. Get Results

```bash
curl http://localhost:3456/pipeline/results/123e4567-e89b-12d3-a456-426614174000
```

Response:
```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "isolate_id": "EC001",
  "status": "completed",
  "resistance_genes": [
    {
      "gene": "blaCTX-M-15",
      "class": "BETA-LACTAM",
      "method": "AMRFinderPlus",
      "coverage": 100.0,
      "identity": 99.8
    }
  ],
  "mlst_result": {
    "scheme": "ecoli",
    "sequence_type": "ST131",
    "alleles": {}
  },
  "annotation_stats": {
    "total_genes": 4523,
    "cds": 4450,
    "rrna": 22,
    "trna": 86,
    "genome_size": 5200000,
    "contigs": 52
  },
  "files": {
    "gff": "/data/results/123e4567.../prokka/EC001.gff",
    "faa": "/data/results/123e4567.../prokka/EC001.faa",
    "resistance_report": "/data/results/123e4567.../EC001_amr.tsv"
  },
  "errors": []
}
```

### 4. List All Jobs

```bash
curl http://localhost:3456/pipeline/jobs
```

## Webhook Integration (For Web App Developers)

### Overview

The pipeline supports **webhook callbacks** for real-time result delivery. When your web application submits a job with a `callback_url`, the pipeline will automatically POST the complete results to that URL when the job finishes.

**Benefits:**
- Real-time notifications when jobs complete
- No need to poll for results
- Automatic retry on failure (3 attempts with 5-second delays)
- Fallback to polling if webhook fails

### How It Works

```
1. Web App submits job with callback_url
   ↓
2. Pipeline processes the job
   ↓
3. Pipeline POSTs results to callback_url
   ↓
4. Web App receives webhook and saves to database
```

### Submitting Jobs with Webhooks

Include `callback_url` and optional `metadata` in your job submission:

```bash
curl -X POST http://localhost:3456/pipeline/submit \
  -H "Content-Type: application/json" \
  -d '{
    "isolate_id": "EC001",
    "assembly_path": "/data/assemblies/EC001.fasta",
    "analysis_types": ["resistance", "mlst", "annotation"],
    "callback_url": "http://your-app.com/api/pipeline-webhook",
    "metadata": {
      "sample_id": "12345",
      "run_id": "batch_001",
      "user_id": "user_123"
    }
  }'
```

**Parameters:**
- `callback_url` (optional): URL to receive webhook POST when job completes
- `metadata` (optional): Key-value pairs that will be echoed back in the webhook

### Webhook Payload Format

When your job completes, the pipeline will POST this JSON payload to your `callback_url`:

```json
{
  "event": "job.completed",
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "isolate_id": "EC001",
  "status": "completed",
  "timestamp": "2024-01-15T10:35:00",
  "metadata": {
    "sample_id": "12345",
    "run_id": "batch_001",
    "user_id": "user_123"
  },
  "results": {
    "job_id": "123e4567-e89b-12d3-a456-426614174000",
    "isolate_id": "EC001",
    "status": "completed",
    "resistance_genes": [
      {
        "gene": "blaCTX-M-15",
        "class": "BETA-LACTAM",
        "method": "AMRFinderPlus",
        "coverage": 100.0,
        "identity": 99.8
      }
    ],
    "mlst_result": {
      "scheme": "ecoli",
      "sequence_type": "ST131",
      "alleles": {}
    },
    "annotation_stats": {
      "total_genes": 4523,
      "cds": 4450,
      "rrna": 22,
      "trna": 86,
      "genome_size": 5200000,
      "contigs": 52
    },
    "files": {
      "gff": "/data/results/123e4567.../prokka/EC001.gff",
      "faa": "/data/results/123e4567.../prokka/EC001.faa",
      "resistance_report": "/data/results/123e4567.../EC001_amr.tsv"
    },
    "errors": []
  }
}
```

**On Failure:**
```json
{
  "event": "job.completed",
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "isolate_id": "EC001",
  "status": "failed",
  "timestamp": "2024-01-15T10:35:00",
  "metadata": {...},
  "results": {
    "job_id": "123e4567-e89b-12d3-a456-426614174000",
    "isolate_id": "EC001",
    "status": "failed",
    "errors": [
      "FASTA validation failed: Invalid format"
    ]
  }
}
```

### Implementing the Webhook Endpoint in Your Web App

Your web application needs to implement an endpoint to receive these webhook POSTs.

#### Example: FastAPI (Python)

```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Optional

app = FastAPI()

class WebhookPayload(BaseModel):
    event: str
    job_id: str
    isolate_id: str
    status: str
    timestamp: str
    metadata: Optional[Dict[str, str]] = {}
    results: Dict

def save_to_database(payload: WebhookPayload):
    """Save pipeline results to your database"""
    # Extract metadata to link back to your records
    sample_id = payload.metadata.get("sample_id")

    # Save resistance genes
    for gene in payload.results.get("resistance_genes", []):
        # db.save_resistance_gene(sample_id, gene)
        pass

    # Save MLST result
    mlst = payload.results.get("mlst_result", {})
    # db.save_mlst(sample_id, mlst)

    # Update sample status
    # db.update_sample_status(sample_id, "pipeline_complete")

@app.post("/api/pipeline-webhook")
async def receive_pipeline_webhook(
    payload: WebhookPayload,
    background_tasks: BackgroundTasks
):
    """Receive webhook from Patomove Pipeline"""

    # Queue database operations in background
    background_tasks.add_task(save_to_database, payload)

    # Return 200 immediately so pipeline knows we received it
    return {"status": "received", "job_id": payload.job_id}
```

#### Example: Express.js (Node.js)

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/pipeline-webhook', async (req, res) => {
  const payload = req.body;

  // Return 200 immediately
  res.json({ status: 'received', job_id: payload.job_id });

  // Process in background
  try {
    const sampleId = payload.metadata.sample_id;

    // Save resistance genes
    for (const gene of payload.results.resistance_genes || []) {
      await db.saveResistanceGene(sampleId, gene);
    }

    // Save MLST result
    await db.saveMlst(sampleId, payload.results.mlst_result);

    // Update sample status
    await db.updateSampleStatus(sampleId, 'pipeline_complete');
  } catch (error) {
    console.error('Error processing webhook:', error);
  }
});

app.listen(3000);
```

#### Example: Django (Python)

```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

@csrf_exempt
@require_http_methods(["POST"])
def pipeline_webhook(request):
    """Receive webhook from Patomove Pipeline"""
    payload = json.loads(request.body)

    # Return 200 immediately
    response = JsonResponse({
        'status': 'received',
        'job_id': payload['job_id']
    })

    # Process asynchronously (use Celery in production)
    from .tasks import process_pipeline_results
    process_pipeline_results.delay(payload)

    return response
```

### Webhook Configuration

The pipeline's webhook behavior can be configured via environment variables in `docker-compose.yml`:

```yaml
environment:
  - WEBHOOK_TIMEOUT_SECONDS=30      # Timeout for each webhook attempt
  - WEBHOOK_MAX_RETRIES=3           # Number of retry attempts
  - WEBHOOK_RETRY_DELAY_SECONDS=5   # Delay between retries
```

### Security Considerations

**For Production:**

1. **Use HTTPS** for callback URLs
   ```json
   "callback_url": "https://your-app.com/api/pipeline-webhook"
   ```

2. **Validate webhook signatures** (implement HMAC verification)

3. **Restrict webhook endpoint** to pipeline IP address

4. **Use API keys** in callback URL query params
   ```json
   "callback_url": "https://your-app.com/api/webhook?key=your-secret-key"
   ```

### Testing Webhooks Locally

Use the provided `webhook_receiver.py` test tool to verify webhook delivery:

```bash
# Terminal 1: Start webhook receiver
python webhook_receiver.py 9000

# Terminal 2: Submit job with callback
curl -X POST http://localhost:3456/pipeline/submit \
  -H "Content-Type: application/json" \
  -d '{
    "isolate_id": "test",
    "assembly_path": "/data/assemblies/test.fasta",
    "analysis_types": ["resistance"],
    "callback_url": "http://192.168.8.138:9000/webhook",
    "metadata": {"test": "true"}
  }'
```

The webhook receiver will display the POST data when the job completes.

### Fallback: Polling (If Webhook Fails)

If webhook delivery fails after all retries, your app can fall back to polling:

```python
import time

def poll_for_results(job_id, max_attempts=60):
    """Poll for results if webhook wasn't received"""
    for i in range(max_attempts):
        response = requests.get(f"http://pipeline:3456/pipeline/status/{job_id}")
        status = response.json()

        if status["status"] in ["completed", "failed"]:
            # Get full results
            results = requests.get(f"http://pipeline:3456/pipeline/results/{job_id}")
            return results.json()

        time.sleep(10)  # Wait 10 seconds before next check

    raise TimeoutError("Job did not complete in time")
```

## Development Workflow

### Local Development (without Docker)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Install bioinformatics tools (requires conda/mamba)
conda install -c bioconda prokka mlst ncbi-amrfinderplus

# Update AMRFinderPlus database
amrfinder --update

# Create directories
mkdir -p data/assemblies data/results

# Copy environment file
cp .env.example .env

# Run the API
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### Testing the Pipeline

1. **Place a test FASTA file** in `data/assemblies/`:

```bash
# Download a sample E. coli assembly
wget -O data/assemblies/test.fasta \
  "https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/005/845/GCF_000005845.2_ASM584v2/GCF_000005845.2_ASM584v2_genomic.fna.gz"
gunzip data/assemblies/test.fasta.gz
```

2. **Submit a job**:

```bash
curl -X POST http://localhost:3456/pipeline/submit \
  -H "Content-Type: application/json" \
  -d '{
    "isolate_id": "test_ecoli",
    "assembly_path": "/data/assemblies/test.fasta",
    "analysis_types": ["resistance", "mlst", "annotation"]
  }'
```

3. **Monitor progress**:

```bash
# Get the job_id from previous response
JOB_ID="your-job-id-here"

# Check status
watch -n 5 "curl -s http://localhost:3456/pipeline/status/$JOB_ID | jq"
```

4. **View results**:

```bash
curl http://localhost:3456/pipeline/results/$JOB_ID | jq
```

## Configuration

Configuration is managed through environment variables (see `.env.example`):

- `ASSEMBLIES_DIR`: Input directory for assembly files (default: `/data/assemblies`)
- `RESULTS_DIR`: Output directory for results (default: `/data/results`)
- `MAX_CONCURRENT_JOBS`: Number of jobs to run in parallel (default: 4)
- `JOB_TIMEOUT_SECONDS`: Maximum time for a job (default: 3600)

## Bioinformatics Tools

### Prokka (Annotation)
- **Purpose**: Rapid prokaryotic genome annotation
- **Input**: FASTA assembly
- **Output**: GFF, GenBank, protein sequences
- **Runtime**: 5-15 minutes for typical bacterial genome

### mlst (MLST Typing)
- **Purpose**: Multi-locus sequence typing
- **Input**: FASTA assembly
- **Output**: Sequence type and allele profile
- **Runtime**: < 1 minute

### AMRFinderPlus (Resistance Detection)
- **Purpose**: Antimicrobial resistance gene detection
- **Input**: Protein sequences (from Prokka) or nucleotide assembly
- **Output**: Resistance genes with identity and coverage
- **Runtime**: 1-3 minutes

## Pipeline Workflow

```
1. File Validation (10%)
   └─> Check FASTA format and accessibility

2. Annotation (10-40%)
   └─> Prokka: Gene calling and annotation
       └─> Outputs: GFF, proteins, genes

3. MLST Typing (40-60%)
   └─> mlst: Determine sequence type
       └─> Outputs: Scheme, ST, alleles

4. Resistance Detection (60-90%)
   └─> AMRFinderPlus: Screen for AMR genes
       └─> Outputs: Resistance gene report

5. Result Aggregation (90-100%)
   └─> Combine all results
   └─> Update job status
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### AMRFinderPlus database errors
```bash
# Enter container
docker-compose exec pipeline bash

# Update database manually
conda run -n pipeline amrfinder --update
```

### Job stuck in "running" status
- Check container logs: `docker-compose logs -f`
- Check job timeout settings in `.env`
- Verify input file is valid FASTA

### Out of memory errors
- Increase Docker memory allocation (Docker Desktop settings)
- Reduce `MAX_CONCURRENT_JOBS` in `.env`
- Increase `job_timeout_seconds` for large genomes

## Next Steps

- [ ] Add database integration (PostgreSQL)
- [ ] Implement webhook callbacks to main app
- [ ] Add batch processing endpoint
- [ ] Implement result persistence across restarts
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add Singularity container support for HPC
- [ ] Implement job prioritization
- [ ] Add support for raw read processing (FASTQ)

## API Documentation

Full interactive API documentation is available at:
- Swagger UI: `http://localhost:3456/docs`
- ReDoc: `http://localhost:3456/redoc`