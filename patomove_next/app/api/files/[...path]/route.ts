import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params;
    
    if (!filePath || filePath.length === 0) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 });
    }

    // Construct the full file path
    const fullPath = path.join(process.cwd(), 'storage', ...filePath);
    
    // Security check: ensure the path is within the storage directory
    const storagePath = path.join(process.cwd(), 'storage');
    if (!fullPath.startsWith(storagePath)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    try {
      // Read and serve the file
      const fileBuffer = await readFile(fullPath);
      const fileName = path.basename(fullPath);
      
      // Determine content type based on file extension
      const ext = path.extname(fileName).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.fasta' || ext === '.fa' || ext === '.fas') {
        contentType = 'text/plain';
      } else if (ext === '.fastq' || ext === '.fq') {
        contentType = 'text/plain';
      } else if (ext === '.gz') {
        contentType = 'application/gzip';
      }

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
      
    } catch (readError) {
      console.error('Error reading file:', readError);
      return NextResponse.json({ error: 'Error reading file' }, { status: 500 });
    }

  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}