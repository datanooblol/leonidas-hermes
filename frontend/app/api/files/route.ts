import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const testPath = join('D:', 'mick_work', 'leonidas-hermes', 'test');
    
    const sessions = await readdir(testPath).catch(() => []);
    const files = [];

    for (const session of sessions) {
      const sessionPath = join(testPath, session);
      const sessionStat = await stat(sessionPath);
      
      if (sessionStat.isDirectory()) {
        const sessionFiles = await readdir(sessionPath).catch(() => []);
        
        for (const file of sessionFiles) {
          if (file.endsWith('.wav')) {
            files.push({
              session,
              fileName: file,
              filePath: `/api/files/${session}/${file}`
            });
          }
        }
      }
    }

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error loading files:', error);
    return NextResponse.json({ files: [] });
  }
}