from pydantic import BaseModel, Field
from typing import Literal

class ConversationRequest:
    """
    Use this to get conversation from frontend
    Later content will be passed to extraction and suggestion
    """
    stage_name: Literal['greeting', 'discovery', 'pitching', 'closing', 'objection'] = 'greeting'
    content: str

class StrategyResponse:
    pass

class InformationResponse:
    pass

class InterestResponse:
    pass

schema = {
    "type": "guide",
    "text": {
        "stage_name": "greeting",
        "content": "content"
    }
}

schema = {
    "type": "manual_information_update",
    "text": {

    }
}