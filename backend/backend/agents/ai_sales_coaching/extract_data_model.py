from pydantic import BaseModel, Field
from typing import List, Optional
from .type import StageType

class ClassifiedStage(BaseModel):
    """
    Output from stage classification with signals and recommended actions.
    """
    stage: StageType = Field(default=StageType.UNKNOWN, description="A classified stage, default Unknown")
    signals: List[str] = Field(default_factory=list, description="Evidence that triggered this stage")

class CustomerInfo(BaseModel):
    """Data model for customer information that we want to extract"""
    age: Optional[int] = Field(default=None, description="Customer's age")
    income_per_month: Optional[int] = Field(default=None, description="Customer's income per month")

class CustomerInterest(BaseModel):
    """Data model for customer interest that we want to extract"""
    
    # Core Goals (Life Insurance)
    family_protection: Optional[bool] = Field(default=None, description="Protect family financially")
    legacy_planning: Optional[bool] = Field(default=None, description="Leave inheritance/legacy to loved ones")
    savings_goal: Optional[bool] = Field(default=None, description="Save money/build wealth")
    tax_benefits: Optional[bool] = Field(default=None, description="Interested in tax advantages/deductions")
    retirement_planning: Optional[bool] = Field(default=None, description="Plan for retirement")
    
    # Coverage Needs
    health_coverage: Optional[bool] = Field(default=None, description="Health/medical coverage interest")
    accident_protection: Optional[bool] = Field(default=None, description="Accident/disability protection interest")
    critical_illness: Optional[bool] = Field(default=None, description="Critical illness coverage interest")
    
    # Budget & Urgency
    budget_conscious: Optional[bool] = Field(default=None, description="Concerned about premium costs")
    immediate_need: Optional[bool] = Field(default=None, description="Has urgent/immediate need")

class AgentCheckList(BaseModel):
    """Data model for Telesales agent checklist."""
    
    # Opening Protocol
    agent_introduced: Optional[bool] = Field(default=None, description="Agent introduced themselves by name")
    company_mentioned: Optional[bool] = Field(default=None, description="Agent mentioned company name")
    permission_asked: Optional[bool] = Field(default=None, description="Agent asked permission to continue call")