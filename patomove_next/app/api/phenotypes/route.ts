import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { species, method, testDate, confidence, micData } = body

    const phenotypeProfile = await prisma.phenotypeProfile.create({
      data: {
        species,
        method,
        testDate: testDate ? new Date(testDate) : null,
        confidence,
        micData
      }
    })

    return NextResponse.json(phenotypeProfile, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create phenotype profile' },
      { status: 500 }
    )
  }
}