from pathlib import Path

from backend.agents.ai_sales_coaching.utils import StageData




class PromptHub:
    @property
    def extract_customer_information(self):
        return Path("backend/prompt_hub/extract_customer_information.md").read_text(encoding='utf-8')

    @property
    def extract_customer_interest(self):
        return Path("backend/prompt_hub/extract_customer_interest.md").read_text(encoding='utf-8')

    @property
    def extract_agent_checklist(self):
        return Path("backend/prompt_hub/extract_agent_checklist.md").read_text(encoding='utf-8')

    @property
    def classify_sales_stage(self):
        system_prompt = Path("backend/prompt_hub/classify_sales_stage.md").read_text(encoding='utf-8')
        stages = [StageData.GREETING, StageData.DISCOVERY, StageData.PITCH, StageData.CLOSING]
        prompt = []

        for stage in stages:
            stage = stage()
            prompt.append(f"**{stage['stage']}**: \n\t- Goals are to {', '.join(stage['goal'])}")

        return system_prompt.format(sales_stages="\n".join(prompt))

    @property
    def sales_coaching(self):
        return Path("backend/prompt_hub/sales_coaching.md").read_text(encoding='utf-8')
    
    
    @property
    def objection_handling_agent(self):
        return Path("backend/prompt_hub/objection_handling_agent.md").read_text(encoding='utf-8')

    @property
    def greeting_agent(self):
        return Path("backend/prompt_hub/greeting_agent.md").read_text(encoding='utf-8')
    
    @property
    def discovery_agent(self):
        return Path("backend/prompt_hub/discovery_agent.md").read_text(encoding='utf-8')
    
    @property
    def pitch_agent(self):
        return Path("backend/prompt_hub/pitch_agent.md").read_text(encoding='utf-8')
    
    @property
    def closing_agent(self):
        return Path("backend/prompt_hub/closing_agent.md").read_text(encoding='utf-8')
    
    @property
    def pitch_agent_ter(self):
        return Path("backend/prompt_hub/pitch_agent_ter.md").read_text(encoding='utf-8')
    
    @property
    def transition_closing(self):
        return Path("backend/prompt_hub/transition_closing.md").read_text(encoding='utf-8')