from typing import Optional
import hashlib
import json
import httpx
from pydantic import BaseModel

def hash_value(data):
    return hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()

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
    
def pack_message(agent_name, data, stage_name:Optional[str]=None):
    if agent_name=="customer-information-extractor":
        return dict(type="information", customer_information=data)
    if agent_name=="customer-interest-extractor":
        return dict(type="interest", customer_interest=data)
    if agent_name=="agent-checklist-extractor":
        return dict(type="checklist", agent_checklist=data)
    if agent_name in ["greeting-extractor", "discovery-extractor", "pitch-extractor", "closing-extractor"]:
        return dict(type="guide", stage_name=stage_name, guide=data)
    return {}