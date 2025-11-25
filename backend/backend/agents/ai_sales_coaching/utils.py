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

def calculate_call_cost(call_duration_seconds:int, time_window_seconds:int, rolling_interval_seconds:int, cost_per_extraction:float):
    """
    Calculate total cost for a call with rolling window extractions
    
    Args:
        call_duration_seconds: Total call time in seconds)
        time_window_seconds: Extraction window size (8 seconds)
        rolling_interval_seconds: How often to extract (4 seconds)
        cost_per_extraction: Cost per single extraction ($0.000504735 from your example)
    
    Returns:
        dict with breakdown
    """
    
    # Number of extractions = (total_time - window_size) / rolling_interval + 1
    # The +1 accounts for the initial extraction at t=0
    num_extractions = max(1, (call_duration_seconds - time_window_seconds) // rolling_interval_seconds + 1)
    
    total_cost = num_extractions * cost_per_extraction
    
    return {
        'call_duration_seconds': call_duration_seconds,
        'time_window_seconds': time_window_seconds,
        'rolling_interval_seconds': rolling_interval_seconds,
        'num_extractions': num_extractions,
        'cost_per_extraction': cost_per_extraction,
        'total_cost': total_cost
    }