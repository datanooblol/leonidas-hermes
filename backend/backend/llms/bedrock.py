import boto3
import time
from .base import BaseLLM, ModelResponse

def bedrock_driver(messages):
    return [dict(role=m['role'], content=[dict(text=m['content'])]) for m in messages]

class BaseBedrock(BaseLLM):
    def __init__(self, model_id):
        super().__init__(model_id)

    def get_model(self):
        return boto3.client('bedrock-runtime', region_name='us-east-1')

    def bedrock_driver(self, messages):
        return [dict(role=m['role'], content=[dict(text=m['content'])]) for m in messages]
    
    def run(self, system_prompt:str, messages:list)->ModelResponse:
        model = self.get_model()
        start_time = time.time()
        response = model.converse(
            modelId=self.model_id,
            messages=self.bedrock_driver(messages),
            system=[{"text": system_prompt}]
        )
        response_time_ms = int((time.time() - start_time) * 1000)
        return self.OutputMessage(response, response_time_ms)

class BedrockNova(BaseBedrock):
    def __init__(self, model_id):
        super().__init__(model_id)

    def OutputMessage(self, response, response_time_ms)->ModelResponse:
        proxy = response['output']['message']
        usage = response['usage']
        return ModelResponse(
            model_name=self.model_id,
            role=proxy['role'],
            content=proxy['content'][0]['text'],
            reason=proxy['content'][0]['text'],
            input_tokens=usage['inputTokens'],
            output_tokens=usage['outputTokens'],
            response_time_ms=response_time_ms
        )