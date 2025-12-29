import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const genomeId = formData.get('genomeId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!genomeId) {
      return NextResponse.json({ error: 'No genome ID provided' }, { status: 400 });
    }

    // Create storage directory if it doesn't exist
    const storageDir = path.join(process.cwd(), 'storage', 'genomes');
    if (!existsSync(storageDir)) {
      await mkdir(storageDir, { recursive: true });
    }

    // Generate unique filename with genome ID
    const fileName = `${genomeId}_${file.name}`;
    const filePath = path.join(storageDir, fileName);
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);
    
    // Return the storage path relative to the project root
    const relativePath = path.join('storage', 'genomes', fileName);
    const absolutePath = filePath;
    
    console.log(`File uploaded successfully: ${fileName}`);
    console.log(`Storage path: ${absolutePath}`);
    
    return NextResponse.json({
      success: true,
      fileName,
      storagePath: relativePath,
      absolutePath,
      fileSize: buffer.length
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}