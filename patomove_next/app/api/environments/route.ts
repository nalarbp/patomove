import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const environments = await prisma.environment.findMany({
      include: {
        organization: true,
        isolates: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(environments)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch environments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { siteName, facilityType, orgId } = body

    const environment = await prisma.environment.create({
      data: {
        siteName,
        facilityType,
        orgId
      }
    })

    return NextResponse.json(environment, { status: 201 })
  } catch (error) {
    console.error('Error creating environment:', error)
    return NextResponse.json(
      { error: 'Failed to create environment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}