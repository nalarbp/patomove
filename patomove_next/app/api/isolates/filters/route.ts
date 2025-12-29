import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    //get distinct values for each filter field from actual database data
    const [
      speciesData,
      collectionSources,
      collectionSites
    ] = await Promise.all([
      //get distinct species from phenotype profiles
      prisma.phenotypeProfile.findMany({
        select: { species: true },
        distinct: ['species'],
        orderBy: { species: 'asc' }
      }),
      //get distinct collection sources from isolates
      prisma.isolate.findMany({
        select: { collectionSource: true },
        distinct: ['collectionSource'],
        orderBy: { collectionSource: 'asc' }
      }),
      //get distinct collection sites from isolates
      prisma.isolate.findMany({
        select: { collectionSite: true },
        distinct: ['collectionSite'],
        orderBy: { collectionSite: 'asc' }
      })
    ]);

    //extract just the values and filter out null/undefined
    const filterOptions = {
      species: speciesData
        .map(item => item.species)
        .filter(Boolean)
        .sort(),
      sources: collectionSources
        .map(item => item.collectionSource)
        .filter(Boolean)
        .sort(),
      sites: collectionSites
        .map(item => item.collectionSite)
        .filter(Boolean)
        .sort()
    };

    return NextResponse.json(filterOptions);
  } catch (error) {
    console.error('Failed to fetch filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}