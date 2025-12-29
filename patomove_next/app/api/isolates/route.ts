import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')
    const collectionSource = searchParams.get('collectionSource')
    
    const isolates = await prisma.isolate.findMany({
      where: {
        ...(orgId && { orgId }),
        ...(collectionSource && { collectionSource })
      },
      include: {
        organization: true,
        patient: true,
        environment: true,
        phenotypeProfile: true,
        genomicData: true,
        treatments: true
      },
      orderBy: {
        collectionDate: 'desc'
      }
    })
    
    return NextResponse.json(isolates)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch isolates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      label,
      collectionSource,
      collectionSite,
      collectionDate,
      orgId,
      patientId,
      environmentId,
      phenotypeId,
      priority,
      processingStatus,
      notes
    } = body

    const isolate = await prisma.isolate.create({
      data: {
        label,
        collectionSource,
        collectionSite,
        collectionDate: new Date(collectionDate),
        orgId,
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

    return NextResponse.json(isolate, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create isolate' },
      { status: 500 }
    )
  }
}