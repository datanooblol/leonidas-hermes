from pydantic import BaseModel, Field
from typing import List, Optional
from enum import StrEnum

class StageTransition(StrEnum):
    STAY = "stay"
    ADVANCE = "advance" 
    RETURN = "return"

class SalesCoaching(BaseModel):
    """Real-time sales coaching recommendations"""
    current_stage: str = Field(description="Current detected stage")
    next_action: str = Field(description="Specific action agent should take")
    suggested_lines: List[str] = Field(description="Thai phrases to use")
    stage_transition: StageTransition = Field(description="Whether to stay, advance, or return to previous stage")
    reason: str = Field(description="Explanation for the recommendation")