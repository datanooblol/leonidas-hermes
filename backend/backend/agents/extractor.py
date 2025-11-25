from typing import Dict, Any, List, Type, Literal
from toon import decode
import json
from backend.llms.utils import parse_blockcode
from pydantic import BaseModel
import logging
from backend.llms.utils import token_calculation, token_price_list

class Extractor:
    def __init__(self, agent_name:str, llm:Any, system_prompt, DataModel:Type[BaseModel], format:Literal["json", "toon"]="toon", max_retries:int=2):
        self.agent_name = agent_name
        self.llm = llm
        self.system_prompt = system_prompt
        self.DataModel = DataModel
        self.format = format
        self.max_retries = max_retries
        self.logger = logging.getLogger(agent_name)
        self.input_tokens = 0
        self.output_tokens = 0
        self.cost = 0

    def validate_format(self, format):
        if format not in ["json", "toon"]:
            raise ValueError(f"Invalid format: {format}. Must be 'json' or 'toon'.")

    # In your Extractor class, add this method:
    def calculate_cost(self):
        """Calculate total cost for this extraction session"""
        pricing = token_price_list(self.llm.model_id)
        return token_calculation(
            self.input_tokens, 
            self.output_tokens, 
            pricing['input_cost'], 
            pricing['output_cost']
        )

    def get_usage_stats(self):
        """Get detailed usage statistics"""
        return {
            'agent_name': self.agent_name,
            'model_id': self.llm.model_id,
            **self.calculate_cost()
        }

    def _run(self, messages):        
        response = self.llm.run(self.system_prompt, messages)
        output = response.content
        self.input_tokens += response.input_tokens
        self.output_tokens += response.output_tokens
        output = parse_blockcode(output, self.format)
        if self.format == "json":
            output = json.loads(output)
        elif self.format == "toon":
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
        self.input_tokens = 0
        self.output_tokens = 0
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
