from program.memory.interfaces import MemoryBackend
from program.memory.models import Session, Chunk, Transcription, SessionStatus
from .queries import *
from typing import Optional, Any, List
from datetime import datetime
import duckdb

class DuckDBManager(MemoryBackend):
    def __init__(self, db_path:str="session_audio.db"):
        self.db_path = db_path
        # self.conn = duckdb.connect(self.db_path)
        self._create_tables()
    
    def _create_tables(self):
        """Create all required tables"""
        self.execute(CREATE_SESSIONS_TABLE)
        self.execute(CREATE_CHUNKS_TABLE)
        self.execute(CREATE_TRANSCRIPTIONS_TABLE)
    
    def execute(self, query: str, data: Any = None):
        """Execute query and return results"""
        with duckdb.connect(self.db_path) as conn:
            if data:
                return conn.execute(query, data).fetchall()
            else:
                return conn.execute(query).fetchall()
    
    # ============================================================================
    # SESSION OPERATIONS
    # ============================================================================
    
    def create_session(self) -> str:
        session = Session()
        self.execute(INSERT_SESSION, [session.session_id])
        return session.session_id
    
    def get_session(self, session_id: str) -> Optional[Session]:
        result = self.execute(GET_SESSION, [session_id])
        if not result:
            return None
        row = result[0]
        return Session(
            session_id=row[0],
            created_at=row[1],
            status=SessionStatus(row[2]),
            final_audio_path=row[3],
            final_transcription=row[4]
        )
    
    def update_session(self, session_id: str, status: str, final_audio_path: Optional[str] = None, final_transcription: Optional[str] = None):
        self.execute(UPDATE_SESSION_STATUS, [status, final_audio_path, final_transcription, session_id])
    
    def delete_session(self, session_id: str):
        self.execute(DELETE_TRANSCRIPTIONS_BY_SESSION, [session_id])
        self.execute(DELETE_CHUNKS_BY_SESSION, [session_id])
        self.execute(DELETE_SESSION, [session_id])
    
    # ============================================================================
    # CHUNK OPERATIONS
    # ============================================================================
    
    def create_chunk(self, session_id: str, audio_path: str, sequence_number: int, 
                    start_time_ms: int = 0, end_time_ms: int = 0) -> str:
        chunk = Chunk(
            session_id=session_id,
            audio_path=audio_path,
            sequence_number=sequence_number,
            start_time_ms=start_time_ms or None,
            end_time_ms=end_time_ms or None
        )
        self.execute(INSERT_CHUNK, [
            chunk.chunk_id, chunk.session_id, chunk.sequence_number,
            chunk.audio_path, chunk.start_time_ms, chunk.end_time_ms
        ])
        return chunk.chunk_id
    
    def get_chunk(self, chunk_id: str) -> Optional[Chunk]:
        result = self.execute(GET_CHUNK, [chunk_id])
        if not result:
            return None
        row = result[0]
        return Chunk(
            chunk_id=row[0],
            session_id=row[1],
            sequence_number=row[2],
            audio_path=row[3],
            start_time_ms=row[4],
            end_time_ms=row[5],
            created_at=row[6]
        )

    def get_chunks_by_session(self, session_id: str) -> List[Chunk]:
        results = self.execute(GET_CHUNKS_BY_SESSION, [session_id])
        return [Chunk(
            chunk_id=row[0],
            session_id=row[1],
            sequence_number=row[2],
            audio_path=row[3],
            start_time_ms=row[4],
            end_time_ms=row[5],
            created_at=row[6]
        ) for row in results]
    
    def get_last_n_chunks(self, session_id: str, n: int) -> List[Chunk]:
        results = self.execute(GET_LAST_N_CHUNKS, [session_id, n])
        return [Chunk(
            chunk_id=row[0],
            session_id=row[1],
            sequence_number=row[2],
            audio_path=row[3],
            start_time_ms=row[4],
            end_time_ms=row[5],
            created_at=row[6]
        ) for row in results]
    
    # ============================================================================
    # TRANSCRIPTION OPERATIONS
    # ============================================================================
    
    def create_transcription(self, chunk_id: str, transcribed_text: str, 
                           confidence_score: float = 0.0, start_offset_ms: int = 0, end_offset_ms: int = 0) -> str:
        transcription = Transcription(
            chunk_id=chunk_id,
            transcribed_text=transcribed_text,
            confidence_score=confidence_score,
            start_offset_ms=start_offset_ms or None,
            end_offset_ms=end_offset_ms or None
        )
        self.execute(INSERT_TRANSCRIPTION, [
            transcription.transcription_id, transcription.chunk_id, transcription.transcribed_text,
            transcription.confidence_score, transcription.start_offset_ms, transcription.end_offset_ms
        ])
        return transcription.transcription_id
    
    def get_transcriptions_by_chunk(self, chunk_id: str) -> List[Transcription]:
        results = self.execute(GET_TRANSCRIPTIONS_BY_CHUNK, [chunk_id])
        return [Transcription(
            transcription_id=row[0],
            chunk_id=row[1],
            transcribed_text=row[2],
            confidence_score=row[3],
            start_offset_ms=row[4],
            end_offset_ms=row[5],
            created_at=row[6]
        ) for row in results]
    
    def get_transcriptions_by_chunks(self, chunk_ids: List[str]) -> List[Transcription]:
        placeholders = ','.join(['?' for _ in chunk_ids])
        query = GET_TRANSCRIPTIONS_BY_CHUNKS.format(placeholders)        
        results = self.execute(query, chunk_ids)
        return [Transcription(
            transcription_id=row[0],
            chunk_id=row[1],
            transcribed_text=row[2],
            confidence_score=row[3],
            start_offset_ms=row[4],
            end_offset_ms=row[5],
            created_at=row[6]
        ) for row in results]

    def get_transcriptions_by_session(self, session_id: str) -> List[Transcription]:
        results = self.execute(GET_TRANSCRIPTIONS_BY_SESSION, [session_id])
        return [Transcription(
            transcription_id=row[0],
            chunk_id=row[1],
            transcribed_text=row[2],
            confidence_score=row[3],
            start_offset_ms=row[4],
            end_offset_ms=row[5],
            created_at=row[6]
        ) for row in results]
    
    def get_last_n_transcriptions(self, session_id: str, n: int) -> List[Transcription]:
        results = self.execute(GET_LAST_N_TRANSCRIPTIONS, [session_id, n])
        return [Transcription(
            transcription_id=row[0],
            chunk_id=row[1],
            transcribed_text=row[2],
            confidence_score=row[3],
            start_offset_ms=row[4],
            end_offset_ms=row[5],
            created_at=row[6]
        ) for row in results]
    
    def close(self):
        pass