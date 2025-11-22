from pydantic import BaseModel, Field
from typing import Optional

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
    
    # Discovery Phase
    # needs_assessment: Optional[bool] = Field(default=None, description="Agent conducted needs assessment")
    # customer_info_collected: Optional[bool] = Field(default=None, description="Agent collected customer information")
    # current_coverage_asked: Optional[bool] = Field(default=None, description="Agent asked about existing coverage")
    
    # Presentation Phase
    # product_explained: Optional[bool] = Field(default=None, description="Agent explained product features")
    # benefits_highlighted: Optional[bool] = Field(default=None, description="Agent highlighted key benefits")
    # pricing_discussed: Optional[bool] = Field(default=None, description="Agent discussed pricing/premiums")
    
    # Compliance & Legal
    # terms_explained: Optional[bool] = Field(default=None, description="Agent explained terms and conditions")
    # cooling_period_mentioned: Optional[bool] = Field(default=None, description="Agent mentioned cooling-off period")
    # documentation_offered: Optional[bool] = Field(default=None, description="Agent offered to send documentation")
    
    # Closing Protocol
    # objections_addressed: Optional[bool] = Field(default=None, description="Agent addressed customer objections")
    # next_steps_explained: Optional[bool] = Field(default=None, description="Agent explained next steps")
    # contact_info_provided: Optional[bool] = Field(default=None, description="Agent provided contact information")
