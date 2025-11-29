from fastapi import FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from program.memory import create_memory_backend
from program.websocket_tasks.base import Context
import logging
import pandas as pd
import json
from program.websocket_tasks.task_manager import TaskManager
from program.websocket_tasks.calling_agent_task import call_extractor_agent_task, call_agent, call_stage_agent_task
from program.websocket_tasks.transcription_task import create_transcription_task
from program.websocket_tasks.response_task import recommend_product_task
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
    context = Context()
    global ws_session_id
    if ws_session_id is None:
        ws_session_id = memory.create_session()
        print(f"Created WebSocket session: {ws_session_id}")
    manager = TaskManager()
    manager.create(create_transcription_task(websocket, ws_session_id, memory, manager.audio_queue, manager.message_queue, manager.stage_queue))
    manager.create(call_extractor_agent_task(websocket, "customer-information-extractor", "us.amazon.nova-micro-v1:0", manager.message_queue, context.update_customer_information, context.get_customer_information, context.is_information_complete))
    manager.create(call_extractor_agent_task(websocket, "customer-interest-extractor", "us.amazon.nova-micro-v1:0", manager.message_queue, context.update_customer_interest, context.get_customer_interest, context.is_interest_complete))
    manager.create(call_extractor_agent_task(websocket, "agent-checklist-extractor", "us.amazon.nova-micro-v1:0", manager.message_queue, context.update_agent_checklist, context.get_agent_checklist, context.is_checklist_complete))
    manager.create(call_stage_agent_task(websocket, "us.amazon.nova-micro-v1:0", context.get_stage, manager.stage_queue))
    manager.create(recommend_product_task(websocket, products_df, manager.product_queue))

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
                    await manager.audio_queue.put(data)
                elif "text" in message:
                    try:
                        stage_data = json.loads(message["text"])
                        if stage_data.get("type")=="guide":
                            stage_name = stage_data.get("stage_name")
                            context.stage = stage_name

                            await websocket.send_text(json.dumps({
                                "type": "guide",
                                "stage_name": stage_name,
                                "message": f"Stage set to {stage_name}"
                            }))
                        elif stage_data.get("type")=="manual_information_update":
                            update_data = stage_data.get("data", {})
                            context.customer_information.update(update_data)
                            await websocket.send_text(json.dumps({
                                "type": "information",
                                "customer_information": context.customer_information
                            }))
                            await manager.product_queue.put(context.customer_information)
                        elif stage_data.get("type")=="manual_interest_update":
                            update_data = stage_data.get("data", {})
                            context.customer_interest.update(update_data)
                            await websocket.send_text(json.dumps({
                                "type": "interest",
                                "customer_interest": context.customer_interest
                            }))
                    except:
                        pass
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    finally:
        await manager.cancel_all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)