# models.py - Pydantic data models for memory management

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, Union
from uuid import uuid4
from enum import Enum

class SessionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    PROCESSING = "processing"
    PAUSED = "paused"

class Session(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid4()))
    status: SessionStatus = SessionStatus.ACTIVE
    final_audio_path: Optional[str] = None
    final_transcription: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    
    @field_validator('created_at', 'updated_at', mode='before')
    @classmethod
    def parse_datetime(cls, v: Union[str, datetime, None]) -> Optional[datetime]:
        if v is None:
            return None
        if isinstance(v, datetime):
            return v
        if isinstance(v, str):
            # Handle various datetime formats
            try:
                # Try ISO format first
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                try:
                    # Try standard format
                    return datetime.strptime(v, '%Y-%m-%d %H:%M:%S.%f')
                except ValueError:
                    try:
                        # Try without microseconds
                        return datetime.strptime(v, '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        # If all else fails, return current time
                        return datetime.now()
        return datetime.now()

class Chunk(BaseModel):
    chunk_id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str
    sequence_number: Optional[int] = Field(default=None)
    audio_path: str
    start_time_ms: Optional[int] = None
    end_time_ms: Optional[int] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    
    @field_validator('created_at', 'updated_at', mode='before')
    @classmethod
    def parse_datetime(cls, v: Union[str, datetime, None]) -> Optional[datetime]:
        if v is None:
            return None
        if isinstance(v, datetime):
            return v
        if isinstance(v, str):
            # Handle various datetime formats
            try:
                # Try ISO format first
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                try:
                    # Try standard format
                    return datetime.strptime(v, '%Y-%m-%d %H:%M:%S.%f')
                except ValueError:
                    try:
                        # Try without microseconds
                        return datetime.strptime(v, '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        # If all else fails, return current time
                        return datetime.now()
        return datetime.now()

class Transcription(BaseModel):
    transcription_id: str = Field(default_factory=lambda: str(uuid4()))
    chunk_id: str
    transcribed_text: str
    confidence_score: float = 0.0
    start_offset_ms: Optional[int] = None
    end_offset_ms: Optional[int] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    
    @field_validator('created_at', 'updated_at', mode='before')
    @classmethod
    def parse_datetime(cls, v: Union[str, datetime, None]) -> Optional[datetime]:
        if v is None:
            return None
        if isinstance(v, datetime):
            return v
        if isinstance(v, str):
            # Handle various datetime formats
            try:
                # Try ISO format first
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                try:
                    # Try standard format
                    return datetime.strptime(v, '%Y-%m-%d %H:%M:%S.%f')
                except ValueError:
                    try:
                        # Try without microseconds
                        return datetime.strptime(v, '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        # If all else fails, return current time
                        return datetime.now()
        return datetime.now()

class SessionSummary(BaseModel):
    session_id: str
    status: SessionStatus
    created_at: datetime
    chunk_count: int
    transcription_count: int