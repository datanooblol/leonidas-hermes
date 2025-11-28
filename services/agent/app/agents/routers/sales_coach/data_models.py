from pydantic import BaseModel, Field
from typing import List, Optional, Literal

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

class AgentCheckList(BaseModel):
    """Data model for Telesales agent checklist."""
    
    # Opening Protocol
    agent_introduced: Optional[bool] = Field(default=None, description="Agent introduced themselves by name")
    company_mentioned: Optional[bool] = Field(default=None, description="Agent mentioned company name")
    permission_asked: Optional[bool] = Field(default=None, description="Agent asked permission to continue call")

class Guide(BaseModel):
    action:Optional[str] = Field(default=None, description="Recommended action for the agent to take")
    explanation:Optional[str] = Field(default=None, description="Explanation for the recommended action")
    signals:List[str] = Field(default_factory=list, description="Signals that led to this recommendation")
    lines_to_say:List[str] = Field(default_factory=list, description="Suggested lines for the agent to say")