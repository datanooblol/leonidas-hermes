from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uuid
import asyncio
from typing import Dict
from pathlib import Path
from pydub import AudioSegment
from pydub.utils import which
import io
import shutil

app = FastAPI(title="Real-time Transcription API")

# Check FFmpeg availability
ffmpeg_path = shutil.which("ffmpeg")
if ffmpeg_path:
    print(f"FFmpeg found at: {ffmpeg_path}")
    AudioSegment.converter = ffmpeg_path
    AudioSegment.ffmpeg = ffmpeg_path
    AudioSegment.ffprobe = shutil.which("ffprobe")
else:
    print("WARNING: FFmpeg not found in PATH")
    print("Please install FFmpeg and add to PATH")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for transcriptions
transcriptions: Dict[str, str] = {}

@app.post("/upload_chunk")
async def upload_chunk(audio: UploadFile = File(...)):
    """Upload audio chunk and return transcription key"""
    # Generate unique key
    transcription_key = str(uuid.uuid4())
    
    # Read file content before starting async task
    content = await audio.read()
    
    # Start async transcription processing with content
    asyncio.create_task(process_transcription(transcription_key, audio.filename, content, audio.content_type))
    
    print(f"Received chunk: {audio.filename}, key: {transcription_key[:8]}...")
    
    return {"transcription_key": transcription_key}

async def process_transcription(key: str, filename: str, content: bytes, content_type: str):
    """Save audio file and process transcription"""
    
    # Save audio file
    out_dir = Path("./out")
    out_dir.mkdir(exist_ok=True, parents=True)
    
    print(f"Processing {len(content)} bytes, content type: {content_type}")
    
    # Convert WebM to MP3 using pydub (simpler, no FFmpeg needed)
    try:
        # Load WebM audio from bytes
        audio_segment = AudioSegment.from_file(io.BytesIO(content))
        
        # Create MP3 filename
        base_name = filename.replace('.wav', '')
        mp3_path = out_dir / f"{key[:8]}_{base_name}.mp3"
        
        # Export as MP3
        audio_segment.export(mp3_path, format="mp3")
        
        print(f"Converted and saved MP3 file: {mp3_path}")
        print(f"Audio duration: {len(audio_segment)}ms")
        
    except Exception as e:
        print(f"ERROR: Failed to convert audio to MP3: {e}")
        print(f"Cannot proceed without MP3 file for transcription model")
        return  # Don't create transcription if conversion fails
    
    # Mock transcription result
    transcriptions[key] = f"Mock transcription for {filename} - Hello world from audio chunk"
    print(f"Transcription ready for key: {key[:8]}...")

@app.get("/get_transcription/{transcription_key}")
async def get_transcription(transcription_key: str):
    """Get transcription result by key"""
    if transcription_key in transcriptions:
        text = transcriptions[transcription_key]
        return {"status": "ready", "text": text}
    else:
        return {"status": "processing"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Transcription API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)