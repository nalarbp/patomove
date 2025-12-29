import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    console.log('Attempting to fetch organizations...')
    const organizations = await prisma.organization.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    console.log('Organizations fetched successfully:', organizations.length)
    return NextResponse.json(organizations)
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, code, isInternal, contactEmail, contactPhone, address, accessLevel } = body

    const organization = await prisma.organization.create({
      data: {
        name,
        type,
        code,
        isInternal: isInternal ?? false,
        contactEmail,
        contactPhone,
        address,
        accessLevel: accessLevel ?? 'viewer'
      }
    })

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json(
      { error: 'Failed to create organization', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}