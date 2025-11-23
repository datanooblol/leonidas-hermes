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
