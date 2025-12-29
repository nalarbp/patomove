import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      isolateId, 
      checksumMd5, 
      sequencingDate, 
      platform, 
      coverage,
      species,
      mlst,
      detectedProteins 
    } = body

    const genomicData = await prisma.genomicData.create({
      data: {
        isolateId,
        checksumMd5,
        sequencingDate: new Date(sequencingDate),
        platform,
        coverage,
        species,
        mlst,
        detectedProteins
      }
    })

    return NextResponse.json(genomicData, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create genomic data' },
      { status: 500 }
    )
  }
}