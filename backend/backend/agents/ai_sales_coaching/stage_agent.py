from backend.agents.extractor import Extractor
from backend.llms.base import BaseLLM
from backend.prompt_hub import PromptHub
from backend.agents.ai_sales_coaching.extract_data_model import Guide

class StageAgentFactory:
    @staticmethod
    def create_stage_agent(stage:str, llm:BaseLLM):
        # if stage=="greeting":
        #     system_prompt = PromptHub().greeting_agent
        if stage=="discovery":
            system_prompt = PromptHub().discovery_agent
        elif stage=="pitch":
            system_prompt = PromptHub().pitch_agent
        elif stage=="closing":
            system_prompt = PromptHub().closing_agent
        else:
            raise ValueError(f"Invalid stage: {stage}")
        return Extractor(
            agent_name=f"{stage}_stage_agent",
            llm=llm,
            system_prompt=system_prompt,
            DataModel=Guide,
            format="json"
        )