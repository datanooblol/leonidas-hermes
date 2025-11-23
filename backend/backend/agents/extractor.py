from backend.llms.base import BaseLLM
from typing import Dict, Any, List, Type
from toon import decode
from backend.llms.utils import parse_blockcode
from pydantic import BaseModel
import logging

class Extractor:
    def __init__(self, agent_name:str, llm:Any, system_prompt, DataModel:Type[BaseModel], max_retries:int=2):
        self.agent_name = agent_name
        self.llm = llm
        self.system_prompt = system_prompt
        self.DataModel = DataModel
        self.max_retries = max_retries
        self.logger = logging.getLogger(agent_name)
        self.input_tokens = 0
        self.output_tokens = 0

    def _run(self, messages):        
        response = self.llm.run(self.system_prompt, messages)
        output = response.content
        self.input_tokens += response.input_tokens
        self.output_tokens += response.output_tokens
        output = parse_blockcode(output, "toon")
        output = decode(output)
        # Convert to dict with string keys if needed
        if isinstance(output, dict):
            output = {str(k): v for k, v in output.items()}
        else:
            output = {}
        output = self.DataModel(**output)
        return output
    
    def run(self, messages:List[Dict[str, Any]]):
        self.logger.info(f"start extracting...")
        original_messages = messages.copy()
        for attempt in range(self.max_retries):
            try:
                result = self._run(original_messages)
                self.logger.info(f"extraction successful on attempt {attempt + 1}")
                return result
            except Exception as e:
                self.logger.warning(f"attempt {attempt + 1} failed: {e}")
                
                if attempt < self.max_retries - 1:  # Not the last attempt
                    # Add error feedback for next attempt
                    retries_left = self.max_retries - attempt - 1
                    retry_text = "retry" if retries_left == 1 else "retries"
                    error_message = [
                        {"role": "assistant", "content": f"Extraction attempt failed with error: {str(e)}."},
                        {"role": "user", "content": f"Please try again. You have {retries_left} {retry_text} left."}
                    ]
                    original_messages.extend(error_message)
                else:
                    # Last attempt failed
                    self.logger.error(f"all {self.max_retries} attempts failed")
                    return self.DataModel()

            finally:
                self.logger.info(f"end extracting with input_tokens={self.input_tokens} and output_tokens={self.output_tokens}")
