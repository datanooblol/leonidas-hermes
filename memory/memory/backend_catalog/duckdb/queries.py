# queries.py - All SQL queries for DuckDB memory management

# ============================================================================
# TABLE CREATION QUERIES
# ============================================================================

CREATE_SESSIONS_TABLE = """
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'processing', 'paused')),
    final_audio_path VARCHAR(500),
    final_transcription TEXT
)
"""

CREATE_CHUNKS_TABLE = """
CREATE TABLE IF NOT EXISTS audio_chunks (
    chunk_id VARCHAR PRIMARY KEY,
    session_id VARCHAR,
    sequence_number INTEGER,
    audio_path VARCHAR(500),
    start_time_ms INTEGER,
    end_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
)
"""

CREATE_TRANSCRIPTIONS_TABLE = """
CREATE TABLE IF NOT EXISTS transcriptions (
    transcription_id VARCHAR PRIMARY KEY,
    chunk_id VARCHAR,
    transcribed_text TEXT,
    confidence_score FLOAT,
    start_offset_ms INTEGER,
    end_offset_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
)
"""

# ============================================================================
# SESSION OPERATIONS
# ============================================================================

INSERT_SESSION = "INSERT INTO sessions (session_id) VALUES (?)"

GET_SESSION = "SELECT * FROM sessions WHERE session_id = ?"

UPDATE_SESSION_STATUS = """
UPDATE sessions 
SET status = ?, final_audio_path = ?, final_transcription = ? 
WHERE session_id = ?
"""

DELETE_SESSION = "DELETE FROM sessions WHERE session_id = ?"

# ============================================================================
# CHUNK OPERATIONS
# ============================================================================

INSERT_CHUNK = """
INSERT INTO audio_chunks (chunk_id, session_id, sequence_number, audio_path, start_time_ms, end_time_ms) 
VALUES (?, ?, ?, ?, ?, ?)
"""

GET_CHUNK = "SELECT * FROM audio_chunks WHERE chunk_id = ?"

GET_CHUNKS_BY_SESSION = """
SELECT * FROM audio_chunks 
WHERE session_id = ? 
ORDER BY sequence_number ASC
"""

GET_LAST_N_CHUNKS = """
SELECT * FROM audio_chunks 
WHERE session_id = ? 
ORDER BY sequence_number DESC 
LIMIT ?
"""

GET_CHUNK_COUNT = "SELECT COUNT(*) as count FROM audio_chunks WHERE session_id = ?"

DELETE_CHUNKS_BY_SESSION = "DELETE FROM audio_chunks WHERE session_id = ?"

# ============================================================================
# TRANSCRIPTION OPERATIONS
# ============================================================================

INSERT_TRANSCRIPTION = """
INSERT INTO transcriptions (transcription_id, chunk_id, transcribed_text, confidence_score, start_offset_ms, end_offset_ms) 
VALUES (?, ?, ?, ?, ?, ?)
"""

GET_TRANSCRIPTIONS_BY_CHUNK = """
SELECT * FROM transcriptions 
WHERE chunk_id = ? 
ORDER BY start_offset_ms ASC
"""

GET_TRANSCRIPTIONS_BY_SESSION = """
SELECT t.* FROM transcriptions t
JOIN audio_chunks c ON t.chunk_id = c.chunk_id
WHERE c.session_id = ?
ORDER BY c.sequence_number ASC, t.start_offset_ms ASC
"""

DELETE_TRANSCRIPTIONS_BY_SESSION = """
DELETE FROM transcriptions 
WHERE chunk_id IN (
    SELECT chunk_id FROM audio_chunks WHERE session_id = ?
)
"""

# ============================================================================
# COMBINED QUERIES FOR ANALYSIS
# ============================================================================

GET_SESSION_SUMMARY = """
SELECT 
    s.session_id,
    s.status,
    s.created_at,
    COUNT(c.chunk_id) as chunk_count,
    COUNT(t.transcription_id) as transcription_count
FROM sessions s
LEFT JOIN audio_chunks c ON s.session_id = c.session_id
LEFT JOIN transcriptions t ON c.chunk_id = t.chunk_id
WHERE s.session_id = ?
GROUP BY s.session_id, s.status, s.created_at
"""

GET_RECENT_TRANSCRIPTIONS = """
SELECT t.transcribed_text, t.confidence_score, c.sequence_number
FROM transcriptions t
JOIN audio_chunks c ON t.chunk_id = c.chunk_id
WHERE c.session_id = ?
ORDER BY c.sequence_number DESC, t.start_offset_ms ASC
LIMIT ?
"""

GET_LAST_N_TRANSCRIPTIONS = """
SELECT t.*
FROM transcriptions t
JOIN audio_chunks c ON t.chunk_id = c.chunk_id
WHERE c.session_id = ?
ORDER BY c.sequence_number DESC, t.created_at DESC
LIMIT ?
"""