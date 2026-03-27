from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# extraction
class ResponseCustomerInformation(BaseModel):
    type: Literal["information"] = "information"
    customer_information: dict

class ResponseCustomerInterest(BaseModel):
    type: Literal["interest"] = "interest"
    customer_interest: dict

class ResponseAgentChecklist(BaseModel):
    type: Literal["checklist"] = "checklist"
    agent_checklist: dict

# guide
class ResponseStageGuide(BaseModel):
    type: Literal["guide"] = "guide"
    stage_name:Literal["greeting", "discovery", "pitch", "closing"] = "greeting"
    guide: dict

# product
class ResponseProducts(BaseModel):
    type: Literal["products"] = "products"
    products: List[dict]