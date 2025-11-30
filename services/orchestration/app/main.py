from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from program.memory import create_memory_backend
from program.websocket_tasks.base import Context
import logging
import pandas as pd
import json
from program.websocket_tasks.task_manager import TaskManager
from program.websocket_tasks.utils import call_agent
from program.websocket_tasks.transcription_task import TranscriptionTask
from program.websocket_tasks.extraction_task import ExtractionTask
from program.websocket_tasks.product_task import ProductTask
from program.websocket_tasks.stage_task import StageTask
from program.websocket_tasks.command_task import CommandTask

from program.utils import setup_logger
import logging

setup_logger(logging.DEBUG)

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
products_df = pd.read_csv("./dataset/mock_life_insurance_products.csv")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Orchestration API is running"}

@app.websocket("/ws")
async def ws(websocket: WebSocket):
    await websocket.accept()
    global ws_session_id
    if ws_session_id is None:
        ws_session_id = memory.create_session()
        print(f"Created WebSocket session: {ws_session_id}")
    context = Context()
    manager = TaskManager()

    transcription_task = TranscriptionTask(websocket, context, manager, memory)
    extraction_task = ExtractionTask(websocket, "us.amazon.nova-micro-v1:0", context, manager)
    stage_task = StageTask(websocket, "us.amazon.nova-micro-v1:0", context, manager)
    product_task = ProductTask(websocket, context, manager)
    command_task = CommandTask(websocket, context, manager)

    manager.create(transcription_task.process_transcription())
    manager.create(extraction_task.process_message())
    manager.create(stage_task.process_transition())
    manager.create(stage_task.process_stage())
    manager.create(stage_task.process_objection())
    manager.create(product_task.process_products(products_df))
    manager.create(command_task.process_command())

    greeting_guide = await call_agent(agent_name="greeting-extractor", id="", model_id="", content="")
    greeting_guide = greeting_guide["data"]
    
    await websocket.send_text(json.dumps({
        "type": "guide",
        "stage_name": "greeting",
        "guide": greeting_guide
    }))
    try:
        while True:
            message = await websocket.receive()
            if message["type"] == "websocket.disconnect":
                break            
            if message["type"] == "websocket.receive":
                if "bytes" in message:
                    # This will handle the existing audio blobs
                    data = message["bytes"]
                    # await manager.audio_queue.put(data)
                    await manager.audio_queue.put((ws_session_id, data))
                elif "text" in message:
                    await manager.command_queue.put(json.loads(message["text"]))
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    finally:
        await manager.cancel_all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)