from pydantic import BaseModel, Field
from uuid import uuid4
from enum import StrEnum
from abc import ABC, abstractmethod

class Role(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"

class ModelResponse(BaseModel):
    model_name: str
    role: Role
    content: str
    reason: str
    input_tokens: int
    output_tokens: int
    response_time_ms: int
    id: str = Field(default_factory=lambda: str(uuid4()))

def BaseMessage(role:str, content:str)->dict:
    return dict(role=role, content=content)

def UserMessage(content:str)->dict:
    return BaseMessage(role="user", content=content)

def AIMessage(content:str)->dict:
    return BaseMessage(role="assistant", content=content)

class BaseLLM(ABC):
    def __init__(self, model_id,):
        self.model_id = model_id
        self.endpoint_url: str = "http://localhost:11434/api/chat"
    
    @abstractmethod
    def OutputMessage(self, response:dict, response_time_ms:int)->ModelResponse:
        """Abstract method to be implemented by child classes"""
        pass

    @abstractmethod
    def run(self, system_prompt:str, messages:list)->ModelResponse:
        """Abstract method to be implemented by child classes"""
        pass