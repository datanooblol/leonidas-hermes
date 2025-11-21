from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uuid
import asyncio
from typing import Dict
from pathlib import Path
from pydub import AudioSegment
import time
import io
import json
import os
from memory import MemoryFactory, create_memory_backend
from backend.audio_processing.overlatp_to_transcribe import Overlap2Transcribe
from backend.audio_processing.preprocessing import deduplicate_exact_match

ol2t = Overlap2Transcribe()
voice_memory = create_memory_backend("duckdb", db_path="duckdb_session_audio.db")
ws_session_id = None

os.environ['PATH'] += r';C:\ffmpeg\ffmpeg-2025-11-17-git-e94439e49b-full_build\bin'

app = FastAPI(title="Real-time Transcription API")

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

@app.get("/get_transcription/{transcription_key}")
async def get_transcription(transcription_key: str):
    """Get transcription result by key"""
    if transcription_key in transcriptions:
        text = transcriptions[transcription_key]
        return {"status": "ready", "text": text}
    else:
        return {"status": "processing"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time audio streaming"""
    await websocket.accept()
    print("WebSocket connection established")
    
    try:
        while True:
            # Receive audio data
            data = await websocket.receive_bytes()
            
            # Process audio in real-time
            timestamp = str(int(time.time() * 1000))
            
            # Save and process audio
            out_dir = Path("./out_ws")
            out_dir.mkdir(exist_ok=True, parents=True)
            
            try:
                # Convert audio to WAV
                audio_segment = AudioSegment.from_file(io.BytesIO(data))
                wav_file = out_dir / f"{timestamp}.wav"
                audio_segment.export(wav_file, format="wav")
                global ws_session_id
                if ws_session_id is None:
                    ws_session_id = voice_memory.create_session()
                    print(f"Created WebSocket session: {ws_session_id}")
                # Mock transcription
                # transcription = f"Real-time transcription at {timestamp}"
                chunk_id = voice_memory.create_chunk(ws_session_id, str(wav_file), 0)
                records = voice_memory.get_last_n_chunks(ws_session_id, 2)
                transcription = ol2t.run(records)
                transcription_id = voice_memory.create_transcription(chunk_id, transcription)
                # get by session or chunks better?
                last_transcriptions = voice_memory.get_transcriptions_by_chunks([rec.chunk_id for rec in records])
                latest, previous = last_transcriptions[0].transcribed_text, last_transcriptions[1].transcribed_text
                deduplicated_transcription = deduplicate_exact_match(latest, previous)
                # Send result back
                await websocket.send_text(json.dumps({
                    "timestamp": timestamp,
                    "transcription": deduplicated_transcription,
                    "status": "success"
                }))
                
                print(f"Processed WebSocket audio: {len(data)} bytes")
                
            except Exception as e:
                await websocket.send_text(json.dumps({
                    "error": str(e),
                    "status": "error"
                }))
                
    except WebSocketDisconnect:
        print("WebSocket connection closed")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Transcription API is running"}

@app.get("/memory")
async def memory_check():
    """Health check endpoint"""
    return {"status": "ok", "message": MemoryFactory.list_available_backends()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)