import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: isolateId } = await params;

    //get the isolate to extract potential matching terms
    const isolate = await prisma.isolate.findUnique({
      where: { id: isolateId }
    });

    if (!isolate) {
      return NextResponse.json({ error: 'Isolate not found' }, { status: 404 });
    }

    //extract potential matching terms from isolate label
    const searchTerms = [
      isolate.label.trim(),
      isolate.label.replace(/[-_\s]/g, ''), //remove separators
      isolate.label.toLowerCase(),
      isolate.label.toUpperCase()
    ].filter(Boolean);

    //find unlinked genomes that might match this isolate
    const suggestions = await prisma.genomicData.findMany({
      where: {
        //only unlinked genomes
        primaryIsolate: {
          none: {}
        },
        //filename contains any of the search terms
        OR: searchTerms.flatMap(term => [
          {
            originalFilename: {
              contains: term,
              mode: 'insensitive'
            }
          },
          {
            filename: {
              contains: term,
              mode: 'insensitive'
            }
          }
        ]),
        //only valid genomes
        validationStatus: 'valid'
      },
      orderBy: [
        { uploadDate: 'desc' },
        { originalFilename: 'asc' }
      ],
      take: 10 //limit suggestions
    });

    //calculate confidence scores for each suggestion
    const scoredSuggestions = suggestions.map(genome => {
      let confidence = 0;
      const filenameBase = genome.originalFilename
        .replace(/\.(fasta|fa|fna|fastq|fq)$/i, '')
        .trim();

      //exact match (high confidence)
      if (filenameBase.toLowerCase() === isolate.label.toLowerCase()) {
        confidence = 0.95;
      }
      //close match after removing separators
      else if (filenameBase.replace(/[-_\s]/g, '').toLowerCase() === 
               isolate.label.replace(/[-_\s]/g, '').toLowerCase()) {
        confidence = 0.85;
      }
      //contains isolate label
      else if (filenameBase.toLowerCase().includes(isolate.label.toLowerCase())) {
        confidence = 0.70;
      }
      //isolate label contains filename base
      else if (isolate.label.toLowerCase().includes(filenameBase.toLowerCase())) {
        confidence = 0.60;
      }
      //partial match
      else {
        confidence = 0.40;
      }

      return {
        ...genome,
        confidence,
        matchReason: getMatchReason(filenameBase, isolate.label, confidence)
      };
    });

    //sort by confidence score
    scoredSuggestions.sort((a, b) => b.confidence - a.confidence);

    return NextResponse.json({
      isolate: {
        id: isolate.id,
        label: isolate.label
      },
      suggestions: scoredSuggestions,
      totalUnlinkedGenomes: await prisma.genomicData.count({
        where: {
          primaryIsolate: { none: {} },
          validationStatus: 'valid'
        }
      })
    });

  } catch (error) {
    console.error('Failed to fetch genome suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch genome suggestions' },
      { status: 500 }
    );
  }
}

//link a genome to this isolate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: isolateId } = await params;
    const { genomeId, linkingMethod = 'manual_search' } = await request.json();

    //verify isolate exists
    const isolate = await prisma.isolate.findUnique({
      where: { id: isolateId }
    });

    if (!isolate) {
      return NextResponse.json({ error: 'Isolate not found' }, { status: 404 });
    }

    //verify genome exists and is unlinked
    const genome = await prisma.genomicData.findUnique({
      where: { id: genomeId },
      include: { primaryIsolate: true }
    });

    if (!genome) {
      return NextResponse.json({ error: 'Genome not found' }, { status: 404 });
    }

    if (genome.primaryIsolate.length > 0) {
      return NextResponse.json(
        { error: 'Genome is already linked to another isolate' },
        { status: 400 }
      );
    }

    //link genome to isolate
    const [updatedIsolate, updatedGenome] = await Promise.all([
      prisma.isolate.update({
        where: { id: isolateId },
        data: { genomeId: genomeId }
      }),
      prisma.genomicData.update({
        where: { id: genomeId },
        data: {
          linkedAt: new Date(),
          autoLinked: linkingMethod.startsWith('auto_'),
          linkingMethod
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      isolate: updatedIsolate,
      genome: updatedGenome
    });

  } catch (error) {
    console.error('Failed to link genome to isolate:', error);
    return NextResponse.json(
      { error: 'Failed to link genome to isolate' },
      { status: 500 }
    );
  }
}

function getMatchReason(filenameBase: string, isolateLabel: string, confidence: number): string {
  if (confidence >= 0.90) return 'Exact match';
  if (confidence >= 0.80) return 'Very close match (ignoring separators)';
  if (confidence >= 0.65) return 'Filename contains isolate label';
  if (confidence >= 0.55) return 'Isolate label contains filename';
  return 'Partial match';
}