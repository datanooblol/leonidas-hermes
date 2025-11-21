from fastapi import FastAPI, UploadFile, File
import uuid
import asyncio
from pathlib import Path
from pydub import AudioSegment
import time
import io
import os
import asyncio
from typing import Dict

# In-memory storage for transcriptions
transcriptions: Dict[str, str] = {}

os.environ['PATH'] += r';C:\ffmpeg\ffmpeg-2025-11-17-git-e94439e49b-full_build\bin'

router = FastAPI(title="Real-time Transcription API")
@router.post("/upload_chunk")
async def upload_chunk(audio: UploadFile = File(...)):
    """Upload audio chunk and return transcription key"""
    # Generate unique key
    transcription_key = str(uuid.uuid4())
    transcription_key = str(int(time.time() * 1000))
    
    # Read file content before starting async task
    content = await audio.read()
    
    # Start async transcription processing with content
    asyncio.create_task(process_transcription(transcription_key, audio.filename, content, audio.content_type))
    
    print(f"Received chunk: {audio.filename}, key: {transcription_key[:8]}...")
    
    return {"transcription_key": transcription_key}

async def process_transcription(key: str, filename: str, content: bytes, content_type: str):
    """Save audio file and process transcription"""
    
    # Save audio file
    out_dir = Path("./out_wav")
    out_dir.mkdir(exist_ok=True, parents=True)
    
    print(f"Processing {len(content)} bytes, content type: {content_type}")
    
    # Convert WebM to WAV for transcription model
    if "webm" in content_type:
        try:
            # Load WebM and convert to WAV
            audio_segment = AudioSegment.from_file(io.BytesIO(content))
            wav_file = out_dir / f"{key[:]}.wav"
            audio_segment.export(wav_file, format="wav")
            print(f"Converted WebM to WAV: {wav_file}")
        except Exception as e:
            print(f"ERROR: Failed to convert WebM: {e}")
            # Save raw WebM as fallback
            webm_file = out_dir / f"{key[:]}.webm"
            with open(webm_file, "wb") as f:
                f.write(content)
            print(f"Saved raw WebM: {webm_file}")
    else:
        # Save WAV as-is
        wav_file = out_dir / f"{key[:]}.wav"
        with open(wav_file, "wb") as f:
            f.write(content)
        print(f"Saved WAV: {wav_file}")
    
    transcriptions[key] = f"Mock transcription for {filename} - Hello world from audio chunk"
    print(f"Transcription ready for key: {key[:8]}...")

@router.get("/get_transcription/{transcription_key}")
async def get_transcription(transcription_key: str):
    """Get transcription result by key"""
    if transcription_key in transcriptions:
        text = transcriptions[transcription_key]
        return {"status": "ready", "text": text}
    else:
        return {"status": "processing"}