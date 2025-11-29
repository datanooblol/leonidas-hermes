from fastapi import FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from program.memory import create_memory_backend
# from program.audio_processing.overlatp_to_transcribe import Overlap2Transcribe
from program.websocket_tasks.base import Context
# from program.websocket_tasks.transcription_task import TranscriptionProcessor
# from program.websocket_tasks.response_task import TranscriptionResponseProcessor, ProductListResponseProcessor
# from program.websocket_tasks.information_extraction_task import ExtractionProcessor
# from program.utils import setup_logger
import logging
# refer data spec here
import pandas as pd
import json
# from backend.websocket_tasks.stage_guide_task import StageGuideProcessor
from program.websocket_tasks.task_manager import TaskManager
from program.websocket_tasks.calling_agent_task import call_extractor_agent_task
from program.websocket_tasks.transcription_task import create_transcription_task

app = FastAPI(title="Orchestration Service")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory = create_memory_backend("duckdb", db_path="duckdb_session_audio.db")
ws_session_id = None

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Orchestration API is running"}

@app.websocket("/ws")
async def ws(websocket: WebSocket):
    await websocket.accept()
    context = Context()
    global ws_session_id
    if ws_session_id is None:
        ws_session_id = memory.create_session()
        print(f"Created WebSocket session: {ws_session_id}")
    manager = TaskManager()
    manager.create(create_transcription_task(websocket, ws_session_id, memory, manager.audio_queue, manager.message_queue))
    manager.create(call_extractor_agent_task(websocket, "customer-information-extractor", "us.amazon.nova-micro-v1:0", manager.message_queue, context.update_customer_information, context.is_information_complete))
    try:
        while True:
            message = await websocket.receive()
            
            if message["type"] == "websocket.receive":
                if "bytes" in message:
                    # This will handle the existing audio blobs
                    data = message["bytes"]
                    await manager.audio_queue.put(data)
    except WebSocketDisconnect:
        pass
    finally:
        await manager.cancel_all()
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)