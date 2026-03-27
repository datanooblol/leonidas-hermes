from pydantic import BaseModel, Field, ValidationError
from typing import List, Dict, Any, Optional, Union, Literal
import time

# ============================================================================
# FRONTEND → BACKEND MESSAGE SCHEMAS
# ============================================================================

class ManualInformationUpdate(BaseModel):
    """Manual customer information update from frontend"""
    type: Literal["manual_information_update"]
    data: Dict[str, Any] = Field(..., description="Customer information fields")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "manual_information_update",
                "data": {"age": 35, "income_per_month": 50000}
            }
        }
    }

class ManualInterestUpdate(BaseModel):
    """Manual customer interest update from frontend"""
    type: Literal["manual_interest_update"]
    data: Dict[str, bool] = Field(..., description="Customer interest flags")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "manual_interest_update",
                "data": {"life_insurance": True, "health_insurance": False}
            }
        }
    }

class ManualStageChange(BaseModel):
    """Manual stage change from frontend"""
    type: Literal["guide"]
    data: Dict[str, str] = Field(..., description="Stage change data")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "guide",
                "data": {"stage_name": "pitch"}
            }
        }
    }

class ManualObjectionResolve(BaseModel):
    """Manual objection resolution from frontend"""
    type: Literal["manual_resolve_objection"]
    data: Dict[str, bool] = Field(..., description="Objection resolution data")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "manual_resolve_objection",
                "data": {"resolved": True}
            }
        }
    }

# Union type for all frontend commands
FrontendMessage = Union[
    ManualInformationUpdate,
    ManualInterestUpdate, 
    ManualStageChange,
    ManualObjectionResolve
]

# ============================================================================
# BACKEND → FRONTEND MESSAGE SCHEMAS
# ============================================================================

class TranscriptionMessage(BaseModel):
    """Real-time transcription result"""
    type: Literal["transcription"]
    timestamp: str = Field(..., description="Timestamp of transcription")
    transcription: str = Field(..., description="Transcribed text")
    status: Literal["success", "error"] = Field(..., description="Processing status")

class CustomerInformation(BaseModel):
    """Customer demographic data"""
    age: Optional[int] = Field(None, ge=0, le=120, description="Customer age")
    income_per_month: Optional[int] = Field(None, ge=0, description="Monthly income in THB")
    marital_status: Optional[Literal["Single", "Married", "Divorced", "Widowed", "Separated", "Unknown"]] = None
    number_of_children: Optional[int] = Field(None, ge=0, description="Number of children")

class InformationMessage(BaseModel):
    """AI-extracted customer information"""
    type: Literal["information"]
    customer_information: CustomerInformation

class CustomerInterest(BaseModel):
    """Customer product interests"""
    life_insurance: Optional[bool] = None
    health_insurance: Optional[bool] = None
    critical_illness: Optional[bool] = None
    accident_insurance: Optional[bool] = None
    retirement_planning: Optional[bool] = None
    tax_benefits: Optional[bool] = None

class InterestMessage(BaseModel):
    """AI-extracted customer interests"""
    type: Literal["interest"]
    customer_interest: CustomerInterest

class AgentChecklist(BaseModel):
    """Agent task completion status"""
    agent_introduced: Optional[bool] = None
    company_mentioned: Optional[bool] = None
    permission_asked: Optional[bool] = None

class ChecklistMessage(BaseModel):
    """AI-extracted agent checklist"""
    type: Literal["checklist"]
    agent_checklist: AgentChecklist

class GuideContent(BaseModel):
    """AI-generated guidance content"""
    action: str = Field(..., description="Primary action to take")
    explanation: str = Field(..., description="Explanation of why this action")
    lines_to_say: List[str] = Field(..., description="Suggested phrases to use")
    signals: List[str] = Field(..., description="Detected conversation signals")

class GuideMessage(BaseModel):
    """Stage-specific AI guidance"""
    type: Literal["guide"]
    stage_name: Literal["greeting", "discovery", "pitch", "closing"]
    guide: GuideContent
    message: Optional[str] = Field(None, description="Optional confirmation message")

class StageChangeMessage(BaseModel):
    """Automatic stage transition"""
    type: Literal["stage_change"]
    stage: Literal["greeting", "discovery", "pitch", "closing"]
    reason: str = Field(..., description="Reason for stage change")

class ObjectionMessage(BaseModel):
    """Objection detection with guidance"""
    type: Literal["objection"]
    guide: GuideContent
    previous_stage: str = Field(..., description="Stage before objection")

class ObjectionResolvedMessage(BaseModel):
    """Objection resolution confirmation"""
    type: Literal["objection_resolved"]

class Product(BaseModel):
    """Individual product recommendation"""
    product_id: str = Field(..., description="Unique product identifier")
    product_name: str = Field(..., description="Product display name")
    objective: str = Field(..., description="Product objective/purpose")
    premium_min_month_thb: int = Field(..., ge=0, description="Minimum monthly premium in THB")
    premium_max_month_thb: int = Field(..., ge=0, description="Maximum monthly premium in THB")
    age_min: int = Field(..., ge=0, le=120, description="Minimum eligible age")
    age_max: int = Field(..., ge=0, le=120, description="Maximum eligible age")
    notes: str = Field(..., description="Additional product notes")

class ProductsMessage(BaseModel):
    """Filtered product recommendations"""
    type: Literal["products"]
    products: List[Product] = Field(..., description="List of recommended products")

# Union type for all backend responses
BackendMessage = Union[
    TranscriptionMessage,
    InformationMessage,
    InterestMessage,
    ChecklistMessage,
    GuideMessage,
    StageChangeMessage,
    ObjectionMessage,
    ObjectionResolvedMessage,
    ProductsMessage
]

# ============================================================================
# INTERNAL QUEUE MESSAGE SCHEMAS
# ============================================================================

class AudioQueueItem(BaseModel):
    """Audio data in processing queue"""
    session_id: str = Field(..., description="Session identifier")
    audio_bytes: bytes = Field(..., description="Raw audio data")

class MessageQueueItem(BaseModel):
    """Transcription text in processing queue"""
    id: str = Field(..., description="Message identifier")
    content: str = Field(..., description="Transcribed content")

class StageQueueItem(BaseModel):
    """Stage processing queue item"""
    id: str = Field(..., description="Stage processing identifier")
    content: str = Field(..., description="Content for stage processing")

class CommandQueueItem(BaseModel):
    """Frontend command in processing queue"""
    type: str = Field(..., description="Command type")
    data: Dict[str, Any] = Field(..., description="Command data")

# ============================================================================
# WEBSOCKET CONNECTION SCHEMAS
# ============================================================================

class WebSocketConnectionInfo(BaseModel):
    """WebSocket connection metadata"""
    session_id: str = Field(..., description="Session identifier")
    connected_at: float = Field(..., description="Connection timestamp")
    last_activity: float = Field(..., description="Last activity timestamp")
    message_count: int = Field(0, ge=0, description="Total messages processed")
    error_count: int = Field(0, ge=0, description="Total errors encountered")

class WebSocketStats(BaseModel):
    """WebSocket performance statistics"""
    total_connections: int = Field(..., ge=0, description="Total connections made")
    active_connections: int = Field(..., ge=0, description="Currently active connections")
    messages_processed: int = Field(..., ge=0, description="Total messages processed")
    errors_encountered: int = Field(..., ge=0, description="Total errors encountered")
    average_response_time: float = Field(..., ge=0, description="Average response time in seconds")

# ============================================================================
# ERROR HANDLING SCHEMAS
# ============================================================================

class ErrorResponse(BaseModel):
    """Standardized error response"""
    type: Literal["error"]
    message: str = Field(..., description="Error message")
    details: Optional[List[Dict[str, Any]]] = Field(None, description="Validation error details")
    timestamp: str = Field(..., description="Error timestamp")

# ============================================================================
# HELPER FUNCTIONS FOR SCHEMA VALIDATION
# ============================================================================

def validate_frontend_message(data: Dict[str, Any]) -> Union[FrontendMessage, None]:
    """Validate and parse incoming frontend message"""
    try:
        message_type = data.get("type")
        
        if message_type == "manual_information_update":
            return ManualInformationUpdate.model_validate(data)
        elif message_type == "manual_interest_update":
            return ManualInterestUpdate.model_validate(data)
        elif message_type == "guide":
            return ManualStageChange.model_validate(data)
        elif message_type == "manual_resolve_objection":
            return ManualObjectionResolve.model_validate(data)
        else:
            return None
            
    except ValidationError:
        return None

def create_error_response(error_message: str, validation_errors: Optional[List[Dict[str, Any]]] = None) -> ErrorResponse:
    """Create standardized error response"""
    return ErrorResponse(
        type="error",
        message=error_message,
        details=validation_errors,
        timestamp=str(int(time.time() * 1000))
    )

def create_validation_error_response(validation_error: ValidationError) -> ErrorResponse:
    """Create error response from Pydantic validation error"""
    return ErrorResponse(
        type="error",
        message="Validation failed",
        details=validation_error.errors(),
        timestamp=str(int(time.time() * 1000))
    )

# ============================================================================
# EXAMPLE USAGE AND TYPE HINTS
# ============================================================================

# Example frontend message creation:
# manual_info = ManualInformationUpdate(
#     type="manual_information_update",
#     data={"age": 35, "income_per_month": 50000}
# )

# Example backend message creation:
# transcription = TranscriptionMessage(
#     type="transcription",
#     timestamp="1703123456789",
#     transcription="Hello, I'm interested in life insurance",
#     status="success"
# )

# Example guide message:
# guide = GuideMessage(
#     type="guide",
#     stage_name="discovery",
#     guide=GuideContent(
#         action="Ask about family protection needs",
#         explanation="Customer has children, focus on family security",
#         lines_to_say=[
#             "Tell me about your family's financial security needs",
#             "What would happen to your family if something happened to you?"
#         ],
#         signals=["has_children", "married", "income_stable"]
#     ),
#     message="Stage set to discovery"
# )