from pydantic import BaseModel, Field
from typing import Optional
from uuid import uuid4

class ASRRequest(BaseModel):
    chunk_id: int = Field(..., description="Chunk sequence number")
    task_id: str = Field(default_factory=lambda: str(uuid4()), description="Unique task identifier")
    normalize: Optional[bool] = Field(default=False, description="Whether to normalize audio")
    with_timestamps: Optional[bool] = Field(default=False, description="Include timestamps in transcription")
    format: Optional[str] = Field(default="wav", description="Audio format")

class ASRResponse(BaseModel):
    chunk_id: int
    task_id: str
    text: str = Field(..., description="Transcribed text")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")