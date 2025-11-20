import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 });
    }

    // Mock transcription - ในอนาคตจะเชื่อมต่อกับ AI model จริง
    const mockTexts = [
      "สวัสดีครับ",
      "วันนี้อากาศดีมาก", 
      "ผมกำลังทดสอบระบบ",
      "การแปลงเสียงเป็นข้อความ",
      "ทำงานได้ดีมาก",
      "Hello world",
      "Testing speech recognition",
      "This is working great"
    ];
    
    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    
    return NextResponse.json({ 
      text: randomText,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}