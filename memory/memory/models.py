# models.py - Pydantic data models for memory management

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
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
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Chunk(BaseModel):
    chunk_id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str
    sequence_number: Optional[int] = Field(default=None)
    audio_path: str
    start_time_ms: Optional[int] = None
    end_time_ms: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Transcription(BaseModel):
    transcription_id: str = Field(default_factory=lambda: str(uuid4()))
    chunk_id: str
    transcribed_text: str
    confidence_score: float = 0.0
    start_offset_ms: Optional[int] = None
    end_offset_ms: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class SessionSummary(BaseModel):
    session_id: str
    status: SessionStatus
    created_at: datetime
    chunk_count: int
    transcription_count: int