import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const bytesFile = formData.get('bytes') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!audioFile || !sessionId) {
      return NextResponse.json({ error: 'Missing audio file or session ID' }, { status: 400 });
    }

    const sessionPath = join('D:', 'mick_work', 'leonidas-hermes', 'test', sessionId);
    
    // Get existing files count for naming
    const existingFiles = await readdir(sessionPath).catch(() => []);
    const recordingFiles = existingFiles
      .filter(f => f.startsWith('recording_') && f.endsWith('.wav'))
      .map(f => {
        const match = f.match(/recording_(\d+)\.wav/);
        return match ? parseInt(match[1]) : 0;
      })
      .sort((a, b) => a - b);
    
    const recordingCount = recordingFiles.length > 0 ? Math.max(...recordingFiles) + 1 : 1;
    
    const fileName = `recording_${recordingCount.toString().padStart(3, '0')}.wav`;
    const bytesFileName = `recording_${recordingCount.toString().padStart(3, '0')}.bin`;
    const filePath = join(sessionPath, fileName);
    const bytesFilePath = join(sessionPath, bytesFileName);

    // Save WAV file
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Save bytes file if provided
    if (bytesFile) {
      const bytesArrayBuffer = await bytesFile.arrayBuffer();
      const bytesBuffer = Buffer.from(bytesArrayBuffer);
      await writeFile(bytesFilePath, bytesBuffer);
    }

    return NextResponse.json({ 
      success: true, 
      fileName,
      sessionId 
    });
  } catch (error) {
    console.error('Error saving recording:', error);
    return NextResponse.json({ error: 'Failed to save recording' }, { status: 500 });
  }
}