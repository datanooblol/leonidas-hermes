from pathlib import Path

class PromptHub:
    def __init__(self):
        self.base_path = Path(__file__).parent
    
    @property
    def extract_customer_information(self):
        return (self.base_path / "extract_customer_information.md").read_text(encoding='utf-8')

    @property
    def extract_customer_interest(self):
        return (self.base_path / "extract_customer_interest.md").read_text(encoding='utf-8')

    @property
    def extract_agent_checklist(self):
        return (self.base_path / "extract_agent_checklist.md").read_text(encoding='utf-8')

    @property
    def objection_handling_agent(self):
        return (self.base_path / "objection_handling_agent.md").read_text(encoding='utf-8')

    @property
    def greeting_agent(self):
        return (self.base_path / "greeting_agent.md").read_text(encoding='utf-8')
    
    @property
    def discovery_agent(self):
        return (self.base_path / "discovery_agent.md").read_text(encoding='utf-8')
    
    @property
    def pitch_agent(self):
        return (self.base_path / "pitch_agent.md").read_text(encoding='utf-8')
    
    @property
    def closing_agent(self):
        return (self.base_path / "closing_agent.md").read_text(encoding='utf-8')
