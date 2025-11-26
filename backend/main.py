from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
from memory import create_memory_backend # type: ignore
from backend.audio_processing.overlatp_to_transcribe import Overlap2Transcribe
from backend.websocket_tasks.base import Context
from backend.websocket_tasks.transcription_task import TranscriptionProcessor
from backend.websocket_tasks.response_task import TranscriptionResponseProcessor, ProductListResponseProcessor
from backend.websocket_tasks.information_extraction_task import ExtractionProcessor
from backend.llms.bedrock import BedrockNova
from backend.prompt_hub import PromptHub
from backend.utils import setup_logger
import logging
from backend.agents.extractor import Extractor
# refer data spec here
from backend.agents.ai_sales_coaching.extract_data_model import CustomerInfo, CustomerInterest, AgentCheckList
import pandas as pd
import json
from backend.websocket_tasks.stage_guide_task import StageGuideProcessor

setup_logger(logging.INFO)
api_logger = logging.getLogger("backend.main")

products_df = pd.read_csv("./mock_dataset/mock_life_insurance_products.csv")

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
    api_logger.info("WebSocket connection established")
    
    context = Context()

    information_agent = Extractor(
        agent_name="customer_information_extractor_agent",
        llm=BedrockNova(model_id="us.amazon.nova-micro-v1:0"),
        system_prompt=PromptHub().extract_customer_information,
        DataModel=CustomerInfo, # data spec
        format="toon"
    )
    interest_agent = Extractor(
        agent_name="customer_interest_extractor_agent",
        llm=BedrockNova(model_id="us.amazon.nova-micro-v1:0"),
        system_prompt=PromptHub().extract_customer_interest,
        DataModel=CustomerInterest, # data spec
        format="toon"
    )
    checklist_agent = Extractor(
        agent_name="checklist_extractor_agent",
        llm=BedrockNova(model_id="us.amazon.nova-micro-v1:0"),
        system_prompt=PromptHub().extract_agent_checklist,
        DataModel=AgentCheckList, # data spec
        format="toon"
    )
    # Start background tasks
    global ws_session_id
    if ws_session_id is None:
        ws_session_id = voice_memory.create_session()
        print(f"Created WebSocket session: {ws_session_id}")
    
    processor = TranscriptionProcessor(voice_memory, ol2t, ws_session_id)
    transcribe_task = asyncio.create_task(processor.run_worker(websocket, context))
    
    transcription_response_processor = TranscriptionResponseProcessor(voice_memory)
    transcription_response_task = asyncio.create_task(transcription_response_processor.run_worker(websocket, context))
    
    information_extraction_processor = ExtractionProcessor(
        extraction_task="customer_information_extraction",
        llm=information_agent,
        updateFunc=context.update_customer_information,
        returnData=dict(type="information", customer_information=context.customer_information),
        length=5,
        offset=2,
        sleep=1
    )
    information_extraction_task = asyncio.create_task(information_extraction_processor.run_worker(websocket, context))
    
    interest_extraction_processor = ExtractionProcessor(
        extraction_task="customer_interest_extraction",
        llm=interest_agent,
        updateFunc=context.update_customer_interest,
        returnData=dict(type="interest", customer_interest=context.customer_interest),
        length=5,
        offset=2,
        sleep=1
    )
    interest_extraction_task = asyncio.create_task(interest_extraction_processor.run_worker(websocket, context))
    
    checklist_extraction_processor = ExtractionProcessor(
        extraction_task="agent_checklist_extraction",
        llm=checklist_agent,
        updateFunc=context.update_agent_checklist,
        returnData=dict(type="checklist", agent_checklist=context.agent_checklist),
        length=5,
        offset=2,
        sleep=1
    )
    checklist_extraction_task = asyncio.create_task(checklist_extraction_processor.run_worker(websocket, context))
    # Add this with other processors
    product_response_processor = ProductListResponseProcessor(products_df)  # your products data
    product_response_task = asyncio.create_task(product_response_processor.run_worker(websocket, context))
    
    # Add after other processors
    stage_guide_processor = StageGuideProcessor(
        extraction_task="stage_guide_extraction",
        llm=BedrockNova(model_id="us.amazon.nova-micro-v1:0"),
        length=5,
        offset=2,
        sleep=1
    )
    stage_guide_task = asyncio.create_task(stage_guide_processor.run_worker(websocket, context))

    # Send initial greeting stage info using Guide model structure
    greeting_guide = {
        "action": "Start with professional greeting and introduction",
        "explanation": "Begin the call by establishing credibility and building rapport with the customer",
        "signals": [
            "Call just started",
            "Customer answered the phone",
            "No prior conversation context"
        ],
        "lines_to_say": [
            "Hello, good morning/afternoon. My name is [Agent Name] from [Company Name].",
            "I hope you're having a great day today.",
            "I'm calling regarding life insurance options that might benefit you.",
            "Do you have a few minutes to discuss this with me?"
        ]
    }
    
    await websocket.send_text(json.dumps({
        "type": "guide",
        "stage_name": "greeting",
        "guide": greeting_guide
    }))
        
    try:
        while True:
            message = await websocket.receive()
            
            if message["type"] == "websocket.receive":
                if "bytes" in message:
                    # This will handle the existing audio blobs
                    data = message["bytes"]
                    await context.audio_queue.put(data)
                elif "text" in message:
                    # Handle stage control messages
                    try:
                        stage_data = json.loads(message["text"])
                        # it can pass here
                        if stage_data.get("type") == "guide":
                            stage_name = stage_data.get("stage_name")
                            context.stage = stage_name
                            api_logger.info(f"Stage changed to: {stage_name}")

                            # Send confirmation back to frontend
                            await websocket.send_text(json.dumps({
                                "type": "guide",
                                "stage_name": stage_name,
                                "message": f"Stage set to {stage_name}"
                            }))
                    except json.JSONDecodeError:
                        api_logger.warning("Invalid JSON in text message")
            
    except WebSocketDisconnect:
        api_logger.info("WebSocket connection closed")
    finally:
        # Cancel background tasks
        transcribe_task.cancel()
        transcription_response_task.cancel()
        information_extraction_task.cancel()
        interest_extraction_task.cancel()
        checklist_extraction_task.cancel()
        product_response_task.cancel()
        stage_guide_task.cancel()
        
        # Wait for tasks to complete cancellation
        try:
            await asyncio.gather(
                transcribe_task, 
                transcription_response_task, 
                information_extraction_task,
                interest_extraction_task,
                checklist_extraction_task,
                product_response_task,
                stage_guide_task,
                return_exceptions=True
                )
        except Exception:
            pass

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Transcription API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)