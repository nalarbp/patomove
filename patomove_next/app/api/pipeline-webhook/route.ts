import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

interface WebhookPayload {
  event: string;
  job_id: string;
  isolate_id: string;
  status: 'completed' | 'failed';
  timestamp: string;
  metadata?: Record<string, string>;
  results: {
    job_id: string;
    isolate_id: string;
    status: string;
    resistance_genes?: Array<{
      gene: string;
      class: string;
      method: string;
      coverage: number;
      identity: number;
    }>;
    mlst_result?: {
      scheme: string;
      sequence_type: string;
      alleles: Record<string, string>;
    };
    annotation_stats?: {
      total_genes: number;
      cds: number;
      rrna: number;
      trna: number;
      genome_size: number;
      contigs: number;
      n50?: number;
      gc_content?: number;
    };
    files?: {
      gff?: string;
      faa?: string;
      resistance_report?: string;
    };
    errors?: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json();
    
    console.log('Received pipeline webhook:', {
      event: payload.event,
      job_id: payload.job_id,
      isolate_id: payload.isolate_id,
      status: payload.status
    });

    // Handle both isolate analysis and genome validation
    let isolate = null;
    let genome = null;
    
    // Check if this is a genome validation job
    if (payload.isolate_id.startsWith('genome_')) {
      const genomeId = payload.isolate_id.replace('genome_', '');
      genome = await prisma.genomicData.findUnique({
        where: { id: genomeId }
      });
      
      if (!genome) {
        console.error('Genome not found:', genomeId);
        return NextResponse.json(
          { error: 'Genome not found', genome_id: genomeId },
          { status: 404 }
        );
      }
    } else {
      // Regular isolate analysis
      isolate = await prisma.isolate.findFirst({
        where: {
          label: payload.isolate_id
        }
      });
      
      if (!isolate) {
        console.error('Isolate not found:', payload.isolate_id);
        return NextResponse.json(
          { error: 'Isolate not found', isolate_id: payload.isolate_id },
          { status: 404 }
        );
      }
    }

    if (payload.status === 'completed' && payload.results) {
      const results = payload.results;

      if (genome) {
        // This is a genome validation job - update the genome record
        await prisma.genomicData.update({
          where: { id: genome.id },
          data: {
            validationStatus: 'valid',
            processingStatus: 'completed',
            sequencingPlatform: 'illumina',
            
            // Assembly statistics from pipeline
            contigCount: results.annotation_stats?.contigs || null,
            totalLength: results.annotation_stats?.genome_size || null,
            n50: results.annotation_stats?.n50 || null,
            gcContent: results.annotation_stats?.gc_content || null,
            
            // Analysis results
            assemblyStats: results.annotation_stats ? JSON.stringify(results.annotation_stats) : null,
            mlstScheme: results.mlst_result?.scheme || null,
            mlstType: results.mlst_result?.sequence_type || null,
            mlstAlleles: results.mlst_result?.alleles ? JSON.stringify(results.mlst_result.alleles) : null,
            resistanceGenes: results.resistance_genes ? JSON.stringify(results.resistance_genes) : null,
            
            // File paths
            assemblyPath: results.files?.gff || null,
            annotationPath: results.files?.faa || null,
            
            // Completion tracking
            analysisCompleted: true,
            pipelineJobId: payload.job_id,
            updatedBy: 'pipeline-system'
          }
        });
        
        console.log('Updated genome validation results:', genome.id);
        
      } else if (isolate) {
        // Regular isolate analysis - update linked genome or create new genomic data
        let genomicDataId: string;
        
        if (isolate.genomeId) {
          // Update the existing genome with analysis results
          await prisma.genomicData.update({
            where: { id: isolate.genomeId },
            data: {
              sequencingPlatform: 'illumina',
              assemblyStats: results.annotation_stats ? JSON.stringify(results.annotation_stats) : null,
              mlstScheme: results.mlst_result?.scheme || null,
              mlstType: results.mlst_result?.sequence_type || null,
              mlstAlleles: results.mlst_result?.alleles ? JSON.stringify(results.mlst_result.alleles) : null,
              resistanceGenes: results.resistance_genes ? JSON.stringify(results.resistance_genes) : null,
              assemblyPath: results.files?.gff || null,
              annotationPath: results.files?.faa || null,
              analysisCompleted: true,
              processingStatus: 'completed',
              pipelineJobId: payload.job_id,
              updatedBy: 'pipeline-system'
            }
          });
          genomicDataId = isolate.genomeId;
        } else {
          // Create new genomic data entry (legacy path)
          const genomicData = await prisma.genomicData.create({
            data: {
              filename: `${isolate.label}_results`,
              originalFilename: `${isolate.label}_results.gff`,
              storagePath: results.files?.gff || '',
              fileSize: 0, // Unknown from pipeline
              fileHash: `pipeline_${payload.job_id}`,
              validationStatus: 'valid',
              processingStatus: 'completed',
              sequencingPlatform: 'illumina',
              assemblyStats: results.annotation_stats ? JSON.stringify(results.annotation_stats) : null,
              mlstScheme: results.mlst_result?.scheme || null,
              mlstType: results.mlst_result?.sequence_type || null,
              mlstAlleles: results.mlst_result?.alleles ? JSON.stringify(results.mlst_result.alleles) : null,
              resistanceGenes: results.resistance_genes ? JSON.stringify(results.resistance_genes) : null,
              assemblyPath: results.files?.gff || null,
              annotationPath: results.files?.faa || null,
              analysisCompleted: true,
              pipelineJobId: payload.job_id,
              uploadedBy: 'pipeline-system',
              createdBy: 'pipeline-system',
              updatedBy: 'pipeline-system'
            }
          });
          genomicDataId = genomicData.id;
        }
        
        // Update isolate processing status
        await prisma.isolate.update({
          where: { id: isolate.id },
          data: {
            processingStatus: 'genomics completed',
            updatedBy: 'pipeline-system'
          }
        });
        
        console.log('Updated isolate genomic analysis:', isolate.label);
      }


    } else if (payload.status === 'failed') {
      console.error('Pipeline failed for:', payload.isolate_id, payload.results?.errors);
      
      if (genome) {
        // Update genome with failure status
        await prisma.genomicData.update({
          where: { id: genome.id },
          data: {
            validationStatus: 'invalid',
            processingStatus: 'failed',
            validationErrors: JSON.stringify(payload.results?.errors || ['Pipeline analysis failed']),
            pipelineJobId: payload.job_id,
            updatedBy: 'pipeline-system'
          }
        });
        
        console.log('Updated genome failure status:', genome.id);
        
      } else if (isolate) {
        // Update isolate with error status
        await prisma.isolate.update({
          where: { id: isolate.id },
          data: {
            notes: `Pipeline analysis failed: ${payload.results?.errors?.join(', ') || 'Unknown error'}`,
            updatedBy: 'pipeline-system'
          }
        });
        
        console.log('Updated isolate failure status:', isolate.label);
      }
    }

    return NextResponse.json({
      status: 'received',
      job_id: payload.job_id,
      isolate_id: payload.isolate_id
    });

  } catch (error) {
    console.error('Pipeline webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}