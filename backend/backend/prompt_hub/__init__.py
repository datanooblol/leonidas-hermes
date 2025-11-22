from pathlib import Path

class PromptHub:
    @property
    def extract_customer_information(self):
        return Path("backend/prompt_hub/extract_customer_information.md").read_text()

    @property
    def extract_customer_interest(self):
        return Path("backend/prompt_hub/extract_customer_interest.md").read_text()

    @property
    def extract_agent_checklist(self):
        return Path("backend/prompt_hub/extract_agent_checklist.md").read_text()