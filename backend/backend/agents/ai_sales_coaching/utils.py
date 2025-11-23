import yaml
from pathlib import Path

class StageData:
    __base_dir__ = "backend/agents/ai_sales_coaching/stages"

    @classmethod
    def _load_yaml(cls, filename):
        with open(Path(cls.__base_dir__, filename), 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)

    @classmethod
    def GREETING(cls):
        return cls._load_yaml("greeting.yml")

    @classmethod
    def DISCOVERY(cls):
        return cls._load_yaml("discovery.yml")

    @classmethod
    def PITCH(cls):
        return cls._load_yaml("pitch.yml")

    @classmethod
    def CLOSING(cls):
        return cls._load_yaml("closing.yml")

    @classmethod
    def FOLLOW_UP(cls):
        return cls._load_yaml("follow_up.yml")

    @classmethod
    def OBJECTION(cls):
        return cls._load_yaml("objection.yml")
