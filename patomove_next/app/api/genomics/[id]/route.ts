import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Get specific genome
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const genome = await prisma.genomicData.findUnique({
      where: { id },
      include: {
        primaryIsolate: {
          select: { id: true, label: true }
        },
        analysisIsolates: {
          select: { id: true, label: true }
        }
      }
    });

    if (!genome) {
      return NextResponse.json(
        { error: 'Genome not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(genome);
  } catch (error) {
    console.error('Error fetching genome:', error);
    return NextResponse.json(
      { error: 'Failed to fetch genome' },
      { status: 500 }
    );
  }
}

// Update genome (for validation results)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const {
      validationStatus,
      processingStatus,
      contigCount,
      totalLength,
      n50,
      gcContent,
      qualityMetrics,
      validationErrors
    } = body;

    const genome = await prisma.genomicData.update({
      where: { id },
      data: {
        ...(validationStatus && { validationStatus }),
        ...(processingStatus && { processingStatus }),
        ...(contigCount && { contigCount }),
        ...(totalLength && { totalLength }),
        ...(n50 && { n50 }),
        ...(gcContent && { gcContent }),
        ...(qualityMetrics && { qualityMetrics }),
        ...(validationErrors && { validationErrors }),
        updatedBy: 'system'
      }
    });

    return NextResponse.json(genome);
  } catch (error) {
    console.error('Error updating genome:', error);
    return NextResponse.json(
      { error: 'Failed to update genome' },
      { status: 500 }
    );
  }
}

// Delete genome
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check if genome is linked to any isolates
    const linkedIsolates = await prisma.isolate.findMany({
      where: {
        OR: [
          { genomeId: id },
          { genomicData: { some: { id } } }
        ]
      },
      select: { id: true, label: true }
    });

    if (linkedIsolates.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete genome file - it is linked to sample records',
          linkedIsolates: linkedIsolates.map(i => i.label)
        },
        { status: 400 }
      );
    }

    // Delete the genome record
    await prisma.genomicData.delete({
      where: { id }
    });

    // TODO: Also delete the actual file from storage

    return NextResponse.json({
      message: 'Genome deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting genome:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Genome not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete genome' },
      { status: 500 }
    );
  }
}