import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const isolate = await prisma.isolate.findUnique({
      where: { id },
      include: {
        organization: true,
        patient: {
          include: {
            adtRecords: true
          }
        },
        environment: true,
        phenotypeProfile: true,
        genome: true,
        genomicData: true,
        treatments: true
      }
    })

    if (!isolate) {
      return NextResponse.json(
        { error: 'Isolate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(isolate)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch isolate' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json()
    const {
      label,
      collectionSource,
      collectionSite,
      collectionDate,
      patientId,
      environmentId,
      phenotypeId,
      priority,
      processingStatus,
      notes
    } = body

    const isolate = await prisma.isolate.update({
      where: { id },
      data: {
        label,
        collectionSource,
        collectionSite,
        collectionDate: collectionDate ? new Date(collectionDate) : undefined,
        patientId,
        environmentId,
        phenotypeId,
        priority,
        processingStatus,
        notes
      },
      include: {
        organization: true,
        patient: true,
        environment: true
      }
    })

    return NextResponse.json(isolate)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update isolate' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Delete related genomic data first (due to foreign key constraints)
    await prisma.genomicData.deleteMany({
      where: {
        OR: [
          { primaryIsolate: { some: { id } } },
          { analysisIsolates: { some: { id } } }
        ]
      }
    });

    // Delete treatment outcomes
    await prisma.isolateTreatmentOutcome.deleteMany({
      where: { isolateId: id }
    });

    // Delete the isolate
    const deletedIsolate = await prisma.isolate.delete({
      where: { id }
    });

    return NextResponse.json({ 
      message: 'Isolate deleted successfully',
      deletedId: deletedIsolate.id 
    });

  } catch (error) {
    console.error('Delete isolate error:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Isolate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete isolate' },
      { status: 500 }
    );
  }
}