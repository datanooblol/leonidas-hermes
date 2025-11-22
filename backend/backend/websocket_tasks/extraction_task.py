from .base import BaseWebsocketWorker, Context, WebSocket, CancelledError
import json
import asyncio
from backend.llms.ollama import OllamaLLM, OpenAIOutputMessage
from backend.llms.bedrock import BedrockNova
from backend.llms.base import UserMessage
from toon import decode
from backend.llms.utils import parse_blockcode
from pydantic import BaseModel, Field
from typing import Optional

class CustomerInfo(BaseModel):
    age: Optional[int] = Field(default=None, description="Customer's age")
    income_per_month: Optional[int] = Field(default=None, description="Customer's income per month")
    has_life_policy: Optional[bool] = Field(default=None, description="Customer has life insurance policy")
    has_health_policy: Optional[bool] = Field(default=None, description="Customer has health insurance policy")
    has_accident_policy: Optional[bool] = Field(default=None, description="Customer has accident insurance policy")

system_prompt = """\
# PERSONA
You are the best customer information extractor who can carefully extract a customer's information.

# INSTRUCTION
- read TEXT carefully
- extract information including: age, income per month, having life policy|health|accident or not

Return only extracted information in the format below:
```toon
age: "a customer age in positive number, default=null"
income_per_month: "a customer's income in positive number, default=null"
has_life_policy: "a boolean, default=null"
has_health_policy: "a boolean, default=null"
has_accident_policy: "a boolean, default=null"
```
"""
model_id = "us.amazon.nova-micro-v1:0"
class InformationExtractionProcessor(BaseWebsocketWorker):
    def __init__(self, voice_memory):
        self.voice_memory = voice_memory
        # self.llm = OllamaLLM(model_name="gpt-oss:20b", OutputMessage=OpenAIOutputMessage)
        self.llm = BedrockNova(model_id=model_id)

    # def extract_information(self, text):
    #     context = text
    #     response = self.llm.run(system_prompt, [UserMessage(content=context)])
    #     data = parse_blockcode(response.content, "toon")
    #     data = decode(data)
    #     data = CustomerInfo(**data)
    #     return data.model_dump()
    
    # async def run_worker(self, ws: WebSocket, context: Context):
    #     index = 0
    #     length = 5
    #     offset = 3
    #     try:
    #         while True:
    #             if len(context.transcription_texts[index:])>length:
    #                 print("Start extraction")
    #                 text = "".join(context.transcription_texts[index:index+length])
    #                 print(text)
    #                 info = self.extract_information(text)
    #                 context.update_customer_information(info)
    #                 print("End extraction:", context.customer_information)
    #                 index += offset
    #                 await ws.send_text(json.dumps(dict(
    #                     type="information",
    #                     customer_information=context.customer_information
    #                 )))                    
    #             await asyncio.sleep(2.0)  # Check every 1 second
    #     except CancelledError:
    #         print("Extraction stopped.")
    def extract_information(self, text):
        try:
            print(f"Calling LLM with text length: {len(text)}")
            response = self.llm.run(system_prompt, [UserMessage(content=text)])
            print(f"LLM response received: {response.content[:100]}...")
            
            data = parse_blockcode(response.content, "toon")
            data = decode(data)
            data = CustomerInfo(**data)
            print(f"Parsed data: {data.model_dump()}")
            return data.model_dump()
        except Exception as e:
            print(f"Extraction error: {e}")
            return {}

    async def run_worker(self, ws: WebSocket, context: Context):
        index = 0
        length = 3
        offset = 1
        try:
            while True:
                if len(context.transcription_texts[index:]) > length:
                    print("Start extraction")
                    text = "".join(context.transcription_texts[index:index+length])
                    print(f"Text to extract: {text[:]}...")
                    
                    try:
                        # Run extraction in thread to avoid blocking
                        info = await asyncio.get_event_loop().run_in_executor(
                            None, self.extract_information, text
                        )
                        
                        if info:  # Only update if extraction succeeded
                            context.update_customer_information(info)
                            print("End extraction:", context.customer_information)
                            index += offset
                            
                            await ws.send_text(json.dumps({
                                "type": "information",
                                "customer_information": context.customer_information
                            }))
                        else:
                            print("Extraction failed, skipping...")
                            
                    except Exception as e:
                        print(f"Extraction task error: {e}")
                        
                await asyncio.sleep(1.0)
        except CancelledError:
            print("Extraction stopped.")