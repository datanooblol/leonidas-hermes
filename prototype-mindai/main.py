"""
Front:
- send message
- update something

Back:
- receive message
- process
- respond
"""
import json
from fastapi import FastAPI, WebSocket
import uvicorn
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from package.program.extraction import (
    extract_information, extract_interest, extract_agent_checklist,
    suggest_discovery, suggest_pitching, suggest_closing, suggest_objection,
    extract_customer_data, generate_strategy, handle_objection, extract_agent_checklist_flow
)
from package.program.memory import conversation_memory
import asyncio

app = FastAPI(title="Prototype for MindAI")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ws_session_id = None
products_df = pd.read_csv("./dataset/mock_life_insurance_products.csv")

greeting_guide = {
    "action": "เริ่มการสนทนาด้วยการทักทายอย่างมืออาชีพและแนะนำตัว",
    "explanation": "เริ่มการโทรโดยการสร้างความน่าเชื่อถือและสร้างความสัมพันธ์กับลูกค้า",
    "signals": [
        "เพิ่มเริ่มต้นการโทร",
        "ลูกค้ารับสายแล้ว",
        "ไม่มีบริบทการสนทนาก่อนหน้า"
    ],
    "lines_to_say": [
        "แนะนำตัวเองและบริษัท",
        "อยากทราบว่าลูกค้ามีเวลาสักครู่ไหม",
        "อธิบายวัตถุประสงค์การโทรเกี่ยวกับข้อเสนอพิเศษของบริษัท"
    ]
}

async def guide_stage(websocket, data):
    stage_name = data.get("stage_name")
    content = data.get("content", "")
    model_id="us.amazon.nova-micro-v1:0"
    
    # Flow 1: Extract customer data from conversation (with product filtering)
    asyncio.create_task(extract_customer_data(websocket, model_id, content, products_df))
    
    # Flow 2: Generate stage-based strategy
    asyncio.create_task(generate_strategy(websocket, model_id, stage_name, content))
    
    # Flow 3: Handle objection detection
    asyncio.create_task(handle_objection(websocket, model_id, content))
    
    # Flow 4: Agent checklist (only for greeting stage)
    asyncio.create_task(extract_agent_checklist_flow(websocket, model_id, content, stage_name))
    
    # Immediate confirmation
    await websocket.send_text(json.dumps({
        "type": "guide",
        "stage_name": stage_name,
        "message": f"Processing conversation for {stage_name} stage",
        "status": "processing"
    }))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    From the frontend, message type will be:
        - dialog_input as string, this will go to the extraction and strategy tasks
        - command as dict, this will go to the command task
        
    """
    await websocket.accept()
    await websocket.send_text(json.dumps({
        "type": "guide",
        "stage_name": "greeting",
        "guide": greeting_guide
    }))
    try:
        while True:
            message = await websocket.receive()
            if message['type'] == 'websocket.disconnect':
                break
            # there must be 'text' in the field

            if message["type"] == "websocket.receive":
                if "text" in message:
                    # Parse JSON command
                    # {"type": command/guide, "data": data}
                    command = json.loads(message["text"])
                    command_type = command.get("type")
                    data = command.get("data", {})
                    
                    # if command_type == "stage":
                        
                    #     print()

                    if command_type == "manual_information_update":
                        # Handle customer info update using memory
                        is_updated = conversation_memory.update_customer_information(data)
                        if is_updated:
                            await websocket.send_text(json.dumps({
                                "type": "information",
                                "customer_information": conversation_memory.customer_information,
                                "status": "updated"
                            }))
                        else:
                            await websocket.send_text(json.dumps({
                                "type": "information",
                                "message": "No changes detected",
                                "status": "no_change"
                            }))
                        
                    elif command_type == "manual_interest_update": 
                        # Handle interest update using memory
                        is_updated = conversation_memory.update_customer_interest(data)
                        if is_updated:
                            await websocket.send_text(json.dumps({
                                "type": "interest", 
                                "customer_interest": conversation_memory.customer_interest,
                                "status": "updated"
                            }))
                        else:
                            await websocket.send_text(json.dumps({
                                "type": "interest",
                                "message": "No changes detected",
                                "status": "no_change"
                            }))
                        
                    elif command_type == "manual_resolve_objection":
                        # Handle objection resolution
                        # TODO: Clear objection state
                        await websocket.send_text(json.dumps({
                            "type": "objection_resolved",
                            "status": "resolved"
                        }))
  
                    elif command_type == "guide":
                        await guide_stage(websocket, data)

    except Exception as e:
        print(f"WebSocket error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
