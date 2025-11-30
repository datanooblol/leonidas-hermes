import json
from typing import Callable
from asyncio import Queue
from .utils import call_agent, pack_message
import logging

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