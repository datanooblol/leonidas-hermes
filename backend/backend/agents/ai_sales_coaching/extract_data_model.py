from pydantic import BaseModel, Field
from typing import List, Optional, Literal
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
    marital_status: Optional[Literal["Single", "Married", "Divorced", "Widowed", "Separated"]] = Field(default=None, description="Customer's marital status based on one of these options (Single, Married, Divorced, Widowed, Separated, Unknown)")
    number_of_children: Optional[int] = Field(default=None, description="Number of children the customer has")

class CustomerInterest(BaseModel):
    """Data model for customer interest that we want to extract"""
    life_insurance:Optional[bool] = Field(default=None, description="Customer's interest in life insurance")
    health_insurance:Optional[bool] = Field(default=None, description="Customer's interest in health insurance")
    critical_illness:Optional[bool] = Field(default=None, description="Customer's interest in critical illness coverage")
    accident_insurance:Optional[bool] = Field(default=None, description="Customer's interest in accident insurance")
    retirement_planning:Optional[bool] = Field(default=None, description="Customer's interest in retirement planning")
    tax_benefits:Optional[bool] = Field(default=None, description="Customer's interest in tax benefits, tax planning and tax deductions")
    
    # # Core Goals (Life Insurance)
    # family_protection: Optional[bool] = Field(default=None, description="Protect family financially")
    # legacy_planning: Optional[bool] = Field(default=None, description="Leave inheritance/legacy to loved ones")
    # savings_goal: Optional[bool] = Field(default=None, description="Save money/build wealth")
    # tax_benefits: Optional[bool] = Field(default=None, description="Interested in tax advantages/deductions")
    # retirement_planning: Optional[bool] = Field(default=None, description="Plan for retirement")
    
    # # Coverage Needs
    # health_coverage: Optional[bool] = Field(default=None, description="Health/medical coverage interest")
    # accident_protection: Optional[bool] = Field(default=None, description="Accident/disability protection interest")
    # critical_illness: Optional[bool] = Field(default=None, description="Critical illness coverage interest")
    
    # # Budget & Urgency
    # budget_conscious: Optional[bool] = Field(default=None, description="Concerned about premium costs")
    # immediate_need: Optional[bool] = Field(default=None, description="Has urgent/immediate need")

class AgentCheckList(BaseModel):
    """Data model for Telesales agent checklist."""
    
    # Opening Protocol
    agent_introduced: Optional[bool] = Field(default=None, description="Agent introduced themselves by name")
    company_mentioned: Optional[bool] = Field(default=None, description="Agent mentioned company name")
    permission_asked: Optional[bool] = Field(default=None, description="Agent asked permission to continue call")
    def is_complete(self) -> bool:
        """Check if all checklist items are completed (True)"""
        return all([
            self.agent_introduced is True,
            self.company_mentioned is True,
            self.permission_asked is True
        ])


class Guide(BaseModel):
    action:Optional[str] = Field(default=None, description="Recommended action for the agent to take")
    explanation:Optional[str] = Field(default=None, description="Explanation for the recommended action")
    signals:List[str] = Field(default_factory=list, description="Signals that led to this recommendation")
    lines_to_say:List[str] = Field(default_factory=list, description="Suggested lines for the agent to say")