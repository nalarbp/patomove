import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')
    
    const patients = await prisma.patient.findMany({
      where: {
        ...(orgId && { orgId })
      },
      include: {
        organization: true,
        isolates: true,
        adtRecords: {
          orderBy: {
            admitDate: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(patients)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dateOfBirth, sex, clinicalNotes, orgId } = body

    const patient = await prisma.patient.create({
      data: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        sex,
        clinicalNotes,
        orgId
      },
      include: {
        organization: true
      }
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { error: 'Failed to create patient', details: error.message },
      { status: 500 }
    )
  }
}