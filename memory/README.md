# Memory Package

Memory management system for real-time transcription with pluggable backend support.

## Quick Start

```python
from memory.package import create_memory_backend

memory = create_memory_backend("duckdb", db_path="test_session_audio.db")
session_id = memory.create_session()
chunk_id = memory.create_chunk(session_id, "audio.wav", 1)
memory.close()
```

## Architecture

### Core Components

- **`interfaces.py`** - Contract for all backend implementations. Defines the abstract `MemoryBackend` class that all backends must implement.

- **`models.py`** - Data models that will be used across all backend implementations. Provides consistent data structures regardless of storage backend.

### Backend Catalog

- **`backend_catalog/<backend_name>/`** - Individual backend implementations. Currently available backends:
  - `duckdb/` - DuckDB implementation for in-memory/file-based storage

### Backend Structure

Each backend follows this structure:

- **`backend_catalog/<backend_name>/manager.py`** - Main implementation for the specific backend. Implements the `MemoryBackend` interface.

- **`backend_catalog/<backend_name>/queries.py`** - Backend-specific queries and operations (SQL for DuckDB, commands for Redis, etc.).

## Usage

### Basic Workflow

```python
from memory.package import create_memory_backend, list_available_backends

# List available backends
print(list_available_backends())  # ['duckdb']

# Create backend instance
memory = create_memory_backend("duckdb")

# Create session
session_id = memory.create_session()

# Add audio chunks (in sequence)
chunk1_id = memory.create_chunk(session_id, "audio_chunk_1.wav", 1)
chunk2_id = memory.create_chunk(session_id, "audio_chunk_2.wav", 2)
chunk3_id = memory.create_chunk(session_id, "audio_chunk_3.wav", 3)

# Get recent chunks for real-time processing (returns in DESCENDING order)
last_2_chunks = memory.get_last_n_chunks(session_id, 2)  # [chunk3, chunk2]

# Add transcriptions
trans_id = memory.create_transcription(chunk1_id, "Hello world", confidence_score=0.95)

# Get recent transcriptions (returns in DESCENDING order)
last_transcriptions = memory.get_last_n_transcriptions(session_id, 2)

# Clean up
memory.close()
```

### Important Notes

- **`get_last_n_chunks()`** returns chunks in **descending order** by sequence number (newest first)
- **`get_last_n_transcriptions()`** returns transcriptions in **descending order** by creation time (newest first)
- Always call `memory.close()` when done to properly clean up resources

## Testing and Development

### Test Files

- **`test_duckdb.py`** - Complete workflow test demonstrating all features
- **`dev.ipynb`** - Jupyter notebook for interactive development and testing
- **`test_session_audio.db`** - Sample DuckDB file created during testing (if using file-based storage)

### Running Tests

```bash
# Run the main test
python memory/test_duckdb.py

# Interactive development
jupyter notebook memory/dev.ipynb

# Test with persistent database
memory = create_memory_backend("duckdb", db_path="test_session_audio.db")
```

## Adding New Backends

1. Create `backend_catalog/<new_backend>/` directory
2. Implement `manager.py` that inherits from `MemoryBackend`
3. Add backend-specific `queries.py` if needed
4. Register in factory function
