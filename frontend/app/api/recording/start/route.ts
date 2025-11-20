import { NextResponse } from 'next/server';
import { mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST() {
  try {
    const sessionId = `session_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}`;
    const sessionPath = join('D:', 'mick_work', 'leonidas-hermes', 'test', sessionId);
    
    await mkdir(sessionPath, { recursive: true });
    
    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}