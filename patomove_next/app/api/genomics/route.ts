import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET all genomes
export async function GET() {
  try {
    const genomes = await prisma.genomicData.findMany({
      include: {
        primaryIsolate: {
          select: { id: true, label: true }
        },
        analysisIsolates: {
          select: { id: true, label: true }
        }
      },
      orderBy: {
        uploadDate: 'desc'
      }
    })
    
    return NextResponse.json(genomes)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch genomes' },
      { status: 500 }
    )
  }
}

// Create new genome entry (for file upload)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      filename,
      originalFilename,
      storagePath,
      fileSize,
      fileHash,
      uploadedBy,
      validationStatus = 'pending',
      processingStatus = 'uploaded'
    } = body

    const genomicData = await prisma.genomicData.create({
      data: {
        filename,
        originalFilename,
        storagePath,
        fileSize,
        fileHash,
        uploadedBy,
        validationStatus,
        processingStatus,
        createdBy: uploadedBy,
        updatedBy: uploadedBy
      }
    })

    return NextResponse.json(genomicData, { status: 201 })
  } catch (error) {
    console.error('Failed to create genomic data:', error)
    return NextResponse.json(
      { error: 'Failed to create genomic data' },
      { status: 500 }
    )
  }
}