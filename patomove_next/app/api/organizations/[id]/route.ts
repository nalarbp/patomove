import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        users: true,
        patients: true,
        environments: true,
        isolates: true
      }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(organization)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, type, code, isInternal, contactEmail, contactPhone, address, accessLevel, isActive } = body

    const organization = await prisma.organization.update({
      where: { id: params.id },
      data: {
        name,
        type,
        code,
        isInternal,
        contactEmail,
        contactPhone,
        address,
        accessLevel,
        isActive
      }
    })

    return NextResponse.json(organization)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.organization.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Organization deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    )
  }
}