from pydantic import BaseModel, Field
from enum import StrEnum
from typing import List, Optional

class StageType(StrEnum):
    """
    Sales conversation stages with linear main flow and objection interrupt pattern.
    
    Main Flow (Linear Progression):
        GREETING → DISCOVERY → PITCH → CLOSING → FOLLOW_UP
    
    Interrupt Pattern:
        OBJECTION can trigger from any main stage, then resume or advance
    """
    
    # Main flow stages (linear progression)
    GREETING = "Greeting"
    DISCOVERY = "Discovery" 
    PITCH = "Pitch"
    CLOSING = "Closing"
    FOLLOW_UP = "Follow Up"

    # Fallback mechanism
    UNKNOWN = "Unknown"
    
    # Interrupt stage
    OBJECTION = "Objection"

class ObjectionResolution(StrEnum):
    """
    Possible outcomes after handling an objection.
    Determines whether to resume previous stage or advance to next.
    """
    RESUME = "resume"      # Go back to interrupted stage
    ADVANCE = "advance"    # Move to next stage in main flow
    STAY = "stay"          # Continue objection handling

class ConversationState(BaseModel):
    """
    Tracks the current state of the sales conversation.
    Handles both main flow progression and objection interrupts.
    """
    current_stage: StageType = Field(default=StageType.GREETING)
    previous_stage: Optional[StageType] = Field(default=None, description="Stage before objection interrupt")
    is_in_objection: bool = Field(default=False, description="Currently handling objection")
    objection_count: int = Field(default=0, description="Number of objections encountered")

class Action(BaseModel):
    """
    Represents a recommended sales action for the agent to perform.
    """
    action: str = Field(default="")
    suggested_lines: List[str] = Field(default_factory=list)

class Stage(BaseModel):
    """
    Configuration for each sales stage with goals, behaviors, and data collection requirements.
    """
    stage: StageType = Field(default=StageType.UNKNOWN, description="Name of the stage")
    goal: List[str] = Field(description="Key outcomes to accomplish in this stage")
    do: List[str] = Field(description="Best practices to follow")
    avoid: List[str] = Field(description="Behaviors to prevent")
    collects: List[str] = Field(description="Information to gather before advancing")
    objection_patterns: List[str] = Field(default_factory=list, description="Thai objection phrases that trigger objection handling")

class ObjectionPattern(BaseModel):
    """
    Thai language objection patterns with regex and context.
    """
    pattern: str = Field(description="Thai regex pattern for objection detection")
    objection_type: str = Field(description="Category of objection (price, timing, understanding, etc.)")
    confidence_threshold: float = Field(default=0.8, description="Minimum confidence to trigger objection handling")
    suggested_response: List[str] = Field(default_factory=list, description="Recommended Thai responses")

class StageTransition(BaseModel):
    """
    Rules for transitioning between stages in the main flow.
    """
    from_stage: StageType
    to_stage: StageType
    required_signals: List[str] = Field(description="Signals needed to trigger transition")
    required_collections: List[str] = Field(default_factory=list, description="Data that must be collected before transition")