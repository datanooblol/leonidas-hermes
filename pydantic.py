from pydantic import BaseModel, Field
from typing import Literal, Optional, Dict, Any, Union, List
from datetime import datetime

# ===== FRONTEND TO BACKEND MESSAGES =====

# class AudioData(BaseModel):
#     """
#     Binary audio data sent as WAV blob every 2 seconds
#     Note: Sent as binary WebSocket message, not JSON
#     """
#     format: Literal['wav'] = 'wav'
#     sample_rate: int = Field(44100, description="Audio sample rate")
#     duration_seconds: float = Field(2.0, description="Audio chunk duration")
#     channels: int = Field(1, description="Mono audio")

class StageChangeRequest(BaseModel):
    """Stage change command from frontend stage buttons"""
    type: Literal['guide'] = 'guide'
    data: Dict[str, str] = Field(..., description="Contains stage_name")
    
    class Config:
        schema_extra = {
            "example": {
                "type": "guide",
                "data": {"stage_name": "discovery"}
            }
        }

class ManualInformationUpdate(BaseModel):
    """Manual customer information updates from frontend forms"""
    type: Literal['manual_information_update'] = 'manual_information_update'
    data: Dict[str, Any] = Field(..., description="Customer demographic data")
    
    class Config:
        schema_extra = {
            "example": {
                "type": "manual_information_update",
                "data": {
                    "age": 35,
                    "income_per_month": 50000,
                    "marital_status": "Married",
                    "number_of_children": 2
                }
            }
        }

class ManualInterestUpdate(BaseModel):
    """Manual customer interest updates from frontend forms"""
    type: Literal['manual_interest_update'] = 'manual_interest_update'
    data: Dict[str, bool] = Field(..., description="Customer product interests")
    
    class Config:
        schema_extra = {
            "example": {
                "type": "manual_interest_update",
                "data": {
                    "life_insurance": True,
                    "health_insurance": False,
                    "critical_illness": True,
                    "retirement_planning": True,
                    "accident_insurance": False,
                    "tax_benefits": False
                }
            }
        }

class ManualObjectionResolution(BaseModel):
    """Manual objection resolution from frontend"""
    type: Literal['manual_resolve_objection'] = 'manual_resolve_objection'
    data: Dict[str, bool] = Field(..., description="Objection resolution status")
    
    class Config:
        schema_extra = {
            "example": {
                "type": "manual_resolve_objection",
                "data": {"resolved": True}
            }
        }

# ===== BACKEND TO FRONTEND MESSAGES =====

# class TranscriptionMessage(BaseModel):
#     """Real-time transcription results"""
#     type: Literal['transcription'] = 'transcription'
#     timestamp: str = Field(..., description="Unix timestamp")
#     transcription: str = Field(..., description="Transcribed text")
#     status: Literal['success', 'error'] = 'success'

# Backend send back
class CustomerInformation(BaseModel):
    """AI-extracted customer demographic information"""
    age: Optional[int] = None
    income_per_month: Optional[int] = None
    marital_status: Optional[str] = None
    number_of_children: Optional[int] = None

class CustomerInformationMessage(BaseModel):
    """Customer information extracted from conversation"""
    type: Literal['information'] = 'information'
    customer_information: CustomerInformation

class CustomerInterest(BaseModel):
    """AI-detected customer product interests"""
    life_insurance: Optional[bool] = None
    health_insurance: Optional[bool] = None
    critical_illness: Optional[bool] = None
    accident_insurance: Optional[bool] = None
    retirement_planning: Optional[bool] = None
    tax_benefits: Optional[bool] = None

class CustomerInterestMessage(BaseModel):
    """Customer interests detected from conversation"""
    type: Literal['interest'] = 'interest'
    customer_interest: CustomerInterest

class AgentChecklist(BaseModel):
    """Agent task completion tracking"""
    agent_introduced: Optional[bool] = None
    company_mentioned: Optional[bool] = None
    permission_asked: Optional[bool] = None

class AgentChecklistMessage(BaseModel):
    """Agent checklist completion status"""
    type: Literal['checklist'] = 'checklist'
    agent_checklist: AgentChecklist

class StageGuide(BaseModel):
    """AI-generated stage guidance"""
    action: str = Field(..., description="Main action to take")
    explanation: str = Field(..., description="Why this action is recommended")
    lines_to_say: List[str] = Field(..., description="Suggested conversation lines")
    signals: List[str] = Field(default_factory=list, description="Context signals detected")

class StageGuideMessage(BaseModel):
    """Stage-specific AI guidance"""
    type: Literal['guide'] = 'guide'
    stage_name: Optional[Literal['greeting', 'discovery', 'pitch', 'closing']] = None
    guide: StageGuide
    message: Optional[str] = None

class StageChangeMessage(BaseModel):
    """Automatic stage transition notification"""
    type: Literal['stage_change'] = 'stage_change'
    stage: Literal['greeting', 'discovery', 'pitch', 'closing']
    reason: str = Field(..., description="Reason for stage change")

class ObjectionMessage(BaseModel):
    """Objection detection with guidance"""
    type: Literal['objection'] = 'objection'
    guide: StageGuide
    previous_stage: Optional[str] = None

class ObjectionResolvedMessage(BaseModel):
    """Objection resolution confirmation"""
    type: Literal['objection_resolved'] = 'objection_resolved'

class BackendProduct(BaseModel):
    """Product recommendation from backend"""
    product_id: str
    product_name: str
    objective: str
    premium_min_month_thb: int
    premium_max_month_thb: int
    age_min: int
    age_max: int
    notes: Optional[str] = None

class ProductsMessage(BaseModel):
    """Filtered product recommendations"""
    type: Literal['products'] = 'products'
    products: List[BackendProduct]

# ===== FRONTEND DATA STRUCTURES =====
# discard

class FrontendCustomerInfo(BaseModel):
    """Customer info as stored in frontend"""
    name: str = ""
    age: str = ""
    income: str = ""
    status: str = ""
    children: str = ""

class FrontendProduct(BaseModel):
    """Product as displayed in frontend"""
    id: str
    name: str
    category: str
    price: str
    ageRange: str
    description: str
    fullDetail: str

class TranscriptMessage(BaseModel):
    """Individual transcript message"""
    role: Literal['Agent', 'Customer']
    text: str
    timestamp: str

class StageContentData(BaseModel):
    """Stage guidance content"""
    action: str
    tags: List[str]
    lines: List[str]
    explanation: str

class WarningData(BaseModel):
    """Objection warning data"""
    title: str
    concern: str
    action: str
    lines: List[str]
    explanation: str

# ===== FRONTEND INTEREST MAPPING =====

class FrontendInterests(BaseModel):
    """Interest toggles as displayed in frontend"""
    life_insurance: bool = Field(False, alias="Life Insurance")
    health_insurance: bool = Field(False, alias="Health Insurance")
    critical_illness: bool = Field(False, alias="Critical Illness")
    retirement_planning: bool = Field(False, alias="Retirement Planning")
    accident_insurance: bool = Field(False, alias="Accident Insurance")
    tax_benefits: bool = Field(False, alias="Tax Benefits")
    education_fund: bool = Field(False, alias="Education Fund")
    investment: bool = Field(False, alias="Investment")

# ===== WEBSOCKET MESSAGE UNION TYPES =====

FrontendToBackendMessage = Union[
    StageChangeRequest,
    ManualInformationUpdate,
    ManualInterestUpdate,
    ManualObjectionResolution
]

BackendToFrontendMessage = Union[
    TranscriptionMessage,
    CustomerInformationMessage,
    CustomerInterestMessage,
    AgentChecklistMessage,
    StageGuideMessage,
    StageChangeMessage,
    ObjectionMessage,
    ObjectionResolvedMessage,
    ProductsMessage
]

# ===== COMPLETE WEBSOCKET MESSAGE =====

class WebSocketMessage(BaseModel):
    """Complete WebSocket message structure"""
    message_type: Literal['json', 'binary']
    
    # For JSON messages
    json_data: Optional[Union[FrontendToBackendMessage, BackendToFrontendMessage]] = None
    
    # For binary audio data
    audio_data: Optional[AudioData] = None
    
    class Config:
        schema_extra = {
            "examples": [
                {
                    "message_type": "json",
                    "json_data": {
                        "type": "guide",
                        "data": {"stage_name": "discovery"}
                    }
                },
                {
                    "message_type": "binary",
                    "audio_data": {
                        "format": "wav",
                        "sample_rate": 44100,
                        "duration_seconds": 2.0,
                        "channels": 1
                    }
                }
            ]
        }

# ===== STAGE AND THEME ENUMS =====

class Stage(BaseModel):
    """Frontend stage enum"""
    value: Literal['Greet', 'Discover', 'Pitch', 'Closing']

class Theme(BaseModel):
    """UI theme enum"""
    value: Literal['dark', 'light']

# ===== AUDIO STATE =====

class AudioState(BaseModel):
    """Audio recording/playback state"""
    is_recording: bool = False
    is_playing_file: bool = False
    audio_progress: float = 0.0
    audio_duration: float = 0.0
    is_connected: bool = False

# ===== COMPLETE APP STATE =====

class AppState(BaseModel):
    """Complete application state"""
    # UI State
    current_stage: Literal['Greet', 'Discover', 'Pitch', 'Closing'] = 'Greet'
    show_warning: bool = False
    sidebar_open: bool = True
    product_sidebar_open: bool = True
    
    # Data State
    customer_info: FrontendCustomerInfo = FrontendCustomerInfo()
    interests: FrontendInterests = FrontendInterests()
    products: List[FrontendProduct] = []
    transcription: str = ""
    guide: Optional[StageGuide] = None
    
    # Audio State
    audio_state: AudioState = AudioState()
    
    # WebSocket Connection
    is_connected: bool = False

class ConversationRequest(BaseModel):
    """
    Use this to get conversation from frontend
    Later content will be passed to extraction and suggestion
    """
    stage_name: Literal['greeting', 'discovery', 'pitching', 'closing', 'objection'] = 'greeting'
    content: str
