from pathlib import Path

class PromptHub:
    @property
    def extract_customer_information(self):
        return Path("backend/prompt_hub/extract_customer_information.md").read_text()