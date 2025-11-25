from pydantic import BaseModel, Field
from typing import List, Optional
from enum import StrEnum

class PitchingRecommend(BaseModel):
    """Real-time sales pitching stage coaching recommendations"""
    reference: str = Field(description="Reference context for the recommendation")
    action: str = Field(description="Recommended action for the agent to take")
    reason:str = Field(description="Reason for the recommended action")
    suggested_lines: List[str] = Field(description="Thai phrases the agent can use to answer the customer's concerns")
    # reason: str = Field(description="Explanation for the recommendation")

