import httpx
import json
from pydantic import BaseModel
from typing import Callable, Optional
from asyncio import Queue
from .utils import hash_value
import logging

class CallAgentTask(BaseModel):
    id:str
    model_id:str
    content:str

async def call_agent(agent_name, id, model_id, content):
    # Convert AudioSegment to bytes
    
    # Async HTTP request with timeout
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            f"http://agent:8002/sales-coach/{agent_name}",
            json={"id":id, "model_id":model_id, "content":content}
        )
        return response.json()
    
# async def call_stage_agent_task(agent_name, data, websocket, stage_name):
#     while True:
#         response = await call_agent(agent_name, data)
#         response_data = response.get("data", {})
#         response_msg = dict(type="guide", stage_name=stage_name, guide=response_data)
#         await websocket.send_text(json.dumps(response_msg))

def pack_message(agent_name, data, stage_name:Optional[str]=None):
    if agent_name=="customer-information-extractor":
        return dict(type="information", customer_information=data)
    if agent_name=="customer-interest-extractor":
        return dict(type="interest", customer_interest=data)
    if agent_name=="agent-checklist-extractor":
        return dict(type="checklist", agent_checklist=data)
    if agent_name in ["greeting-extractor", "discovery-extractor", "pitch-extractor", "closing-extractor", "objection-extractor"]:
        return dict(type="guide", stage_name=stage_name, guide=data)
    return {}

async def call_extractor_agent_task(websocket, agent_name:str, model_id:str, message_queue:Queue, update_func:Callable, get_func:Callable, is_complete:Callable):
    """
    transcription_queue will be controlled from /websocket
    extracted_info will be control by context
    """
    # trigger with chunk start 5 offset 2, if previous==current, pass
    # extracted_info_proxy = None
    # proxy_hash = None
    logger = logging.getLogger(agent_name)
    while True:
        id, content = await message_queue.get()
        if is_complete():
            logger.debug(f"[{agent_name}] Task completed, stopping extraction")
            return
        response = await call_agent(agent_name=agent_name, id=id, model_id=model_id, content=content)
        response_data = response.get("data", {})
        logger.debug(f"[{agent_name}] Response: {response_data}")
        is_update = update_func(response_data)
        if is_update:
            response_data = get_func()
            response_msg = pack_message(agent_name, response_data)
            await websocket.send_text(json.dumps(response_msg))
            # current_hash = hash_value(response_data)
            # if proxy_hash != current_hash:
                # await websocket.send_text(json.dumps(response_msg))
                # proxy_hash = current_hash

async def call_stage_agent_task(websocket, model_id:str, get_stage:Callable, stage_queue):
    # proxy_hash = None
    while True:
        id, content = await stage_queue.get()
        # id, content = await message_queue.get()
        stage_name = get_stage()
        agent_name = f"{stage_name}-extractor"
        response = await call_agent(agent_name=agent_name, id=id, model_id=model_id, content=content)
        response_data = response.get("data", {})
        response_msg = pack_message(agent_name, response_data, stage_name)
        # current_hash = hash_value(response_data)
        # if proxy_hash != current_hash:
            # await websocket.send_text(json.dumps(response_msg))
            # proxy_hash = current_hash
        await websocket.send_text(json.dumps(response_msg))