from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
from memory import MemoryFactory, create_memory_backend # type: ignore
from backend.audio_processing.overlatp_to_transcribe import Overlap2Transcribe
from backend.websocket_tasks.base import Context
from backend.websocket_tasks.transcription_task import TranscriptionProcessor
from backend.websocket_tasks.response_task import ResponseProcessor

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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time audio streaming"""
    await websocket.accept()
    print("WebSocket connection established")
    
    context = Context()
    
    # Start background tasks
    global ws_session_id
    if ws_session_id is None:
        ws_session_id = voice_memory.create_session()
        print(f"Created WebSocket session: {ws_session_id}")
    
    processor = TranscriptionProcessor(voice_memory, ol2t, ws_session_id)
    response_processor = ResponseProcessor(voice_memory)
    
    transcribe_task = asyncio.create_task(processor.run_worker(websocket, context))
    return_task = asyncio.create_task(response_processor.run_worker(websocket, context))
    
    try:
        while True:
            # Receive audio data
            data = await websocket.receive_bytes()
            # Put audio data in queue for processing
            await context.audio_queue.put(data)
            
    except WebSocketDisconnect:
        print("WebSocket connection closed")
    finally:
        # Cancel background tasks
        transcribe_task.cancel()
        return_task.cancel()
        
        # Wait for tasks to complete cancellation
        try:
            await asyncio.gather(transcribe_task, return_task, return_exceptions=True)
        except Exception:
            pass

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