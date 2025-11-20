# test_duckdb.py - Test DuckDB memory management

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'package'))

from memory import create_memory_backend

def test_duckdb_workflow():
    print("Testing DuckDB Memory Management")
    print("=" * 40)
    
    # Create DuckDB backend
    memory = create_memory_backend("duckdb", db_path="test_session_audio.db")
    
    # 1. Create session
    print("1. Creating session...")
    session_id = memory.create_session()
    print(f"   Session created: {session_id}")
    
    # 2. Create chunks
    print("\n2. Creating chunks...")
    chunk1_id = memory.create_chunk(session_id, "audio_chunk_1.wav", 1)
    chunk2_id = memory.create_chunk(session_id, "audio_chunk_2.wav", 2)
    chunk3_id = memory.create_chunk(session_id, "audio_chunk_3.wav", 3)
    print(f"   Chunk 1: {chunk1_id}")
    print(f"   Chunk 2: {chunk2_id}")
    print(f"   Chunk 3: {chunk3_id}")
    
    # 3. Get last 2 chunks (latest)
    print("\n3. Getting last 2 chunks...")
    last_chunks = memory.get_last_n_chunks(session_id, 2)
    print(f"   Found {len(last_chunks)} chunks:")
    for chunk in last_chunks:
        print(f"   - Sequence {chunk.sequence_number}: {chunk.audio_path}")
    
    # 4. Create transcriptions
    print("\n4. Creating transcriptions...")
    trans1_id = memory.create_transcription(chunk1_id, "Hello world", 0.95)
    trans2_id = memory.create_transcription(chunk2_id, "This is a test", 0.88)
    trans3_id = memory.create_transcription(chunk3_id, "Final transcription", 0.92)
    print(f"   Transcription 1: {trans1_id}")
    print(f"   Transcription 2: {trans2_id}")
    print(f"   Transcription 3: {trans3_id}")
    
    # 5. Get last transcriptions
    print("\n5. Getting last 2 transcriptions...")
    last_transcriptions = memory.get_last_n_transcriptions(session_id, 2)
    print(f"   Found {len(last_transcriptions)} transcriptions:")
    for trans in last_transcriptions:
        print(f"   - Text: '{trans.transcribed_text}' (confidence: {trans.confidence_score})")
    
    # 6. Verify session data
    print("\n6. Session verification...")
    session = memory.get_session(session_id)
    print(f"   Session status: {session.status}")
    print(f"   Session created: {session.created_at}")
    
    print("\n✅ Test completed successfully!")
    memory.close()

if __name__ == "__main__":
    test_duckdb_workflow()