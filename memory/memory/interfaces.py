# interfaces.py - Abstract interfaces for memory backend implementations

from abc import ABC, abstractmethod
from typing import List, Optional, Any
from .models import Session, Chunk, Transcription

class MemoryBackend(ABC):
    """Abstract base class defining the contract for memory backend implementations"""
    
    # ============================================================================
    # SESSION OPERATIONS
    # ============================================================================
    
    @abstractmethod
    def create_session(self) -> str:
        """Create new session and return session_id"""
        pass
    
    @abstractmethod
    def get_session(self, session_id: str) -> Optional[Session]:
        """Get session by ID"""
        pass
    
    @abstractmethod
    def update_session(self, session_id: str, status: str, final_audio_path: Optional[str] = None, final_transcription: Optional[str] = None):
        """Update session status and final data"""
        pass
    
    @abstractmethod
    def delete_session(self, session_id: str):
        """Delete session and all related data"""
        pass
    
    # ============================================================================
    # CHUNK OPERATIONS
    # ============================================================================
    
    @abstractmethod
    def create_chunk(self, session_id: str, audio_path: str, sequence_number: int, 
                    start_time_ms: int = 0, end_time_ms: int = 0) -> str:
        """Create new audio chunk and return chunk_id"""
        pass
    
    @abstractmethod
    def get_chunk(self, chunk_id: str) -> Optional[Chunk]:
        """Get chunk by ID"""
        pass
    
    @abstractmethod
    def get_chunks_by_session(self, session_id: str) -> List[Chunk]:
        """Get all chunks for a session"""
        pass
    
    @abstractmethod
    def get_last_n_chunks(self, session_id: str, n: int) -> List[Chunk]:
        """Get last n chunks for real-time processing"""
        pass
    
    # ============================================================================
    # TRANSCRIPTION OPERATIONS
    # ============================================================================
    
    @abstractmethod
    def create_transcription(self, chunk_id: str, transcribed_text: str, 
                           confidence_score: float = 0.0, start_offset_ms: int = 0, end_offset_ms: int = 0) -> str:
        """Create new transcription and return transcription_id"""
        pass
    
    @abstractmethod
    def get_transcriptions_by_chunk(self, chunk_id: str) -> List[Transcription]:
        """Get all transcriptions for a chunk"""
        pass
    
    @abstractmethod
    def get_transcriptions_by_session(self, session_id: str) -> List[Transcription]:
        """Get all transcriptions for a session"""
        pass
    
    @abstractmethod
    def get_last_n_transcriptions(self, session_id: str, n: int) -> List[Transcription]:
        """Get last n transcriptions for real-time processing"""
        pass
    
    @abstractmethod
    def execute(self, query:str, data:Optional[Any]=None)->List[Any]: pass

    @abstractmethod
    def close(self):
        """Close backend connection/resources"""
        pass