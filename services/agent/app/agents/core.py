from pydantic import BaseModel, Field
from typing import Any, Dict
from uuid import uuid4

class AgentResponse(BaseModel):
    model_id:str
    agent_name:str
    data:Dict[str, Any]
    input_tokens: int = Field(default=0)
    output_tokens: int = Field(default=0)
    response_time_ms: int = Field(default=0)
    id: str = Field(default_factory=lambda: str(uuid4()))