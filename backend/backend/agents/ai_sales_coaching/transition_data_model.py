from pydantic import BaseModel, Field
from typing import List, Optional
from enum import StrEnum

class InterestDetection(BaseModel):
    interest: Optional[str] = Field(
        default=None,
        description="True if customer shows interest based on trigger words; false otherwise."
    )
