import requests
from .base import BaseLLM, ModelResponse

def LlamaOutputMessage(response, response_time_ms)->ModelResponse:
    return ModelResponse(
        model_name=response["model"],
        role=response["message"]["role"],
        content=response["message"]["content"],
        reason="No reason",
        input_tokens=0,
        output_tokens=0,
        response_time_ms=response_time_ms
    )

def OpenAIOutputMessage(response, response_time_ms)->ModelResponse:
    return ModelResponse(
        model_name=response["model"],
        role=response["message"]["role"],
        content=response["message"]["content"],
        reason=response["message"]["thinking"],
        input_tokens=0,
        output_tokens=0,
        response_time_ms=response_time_ms
    )

class LocalEmbedding:
    def __init__(self, model_name):
        self.model_name = model_name
        self.base_url = f"http://localhost:11434/api/embed"

    def run(self, texts:list):
        response = requests.post(self.base_url, json={"model": self.model_name, "input": texts})
        return response.json()
    
class OllamaLLM:
    def __init__(self, model_id, OutputMessage):
        self.model_id = model_id
        self.base_url = "http://localhost:11434/api/chat"
        self.OutputMessage = OutputMessage

    def run(self, system_prompt:str, messages:list):
        response = requests.post(self.base_url, json={"model": self.model_id, "messages": [dict(role="system", content=system_prompt)]+messages, "stream":False})
        return self.OutputMessage(response.json(), 0)