# Real-time Transcription Backend

FastAPI backend for real-time audio transcription with async processing.

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python main.py
```

Server runs on: http://localhost:8000

## API Endpoints

### POST /upload_chunk
Upload audio chunk and get transcription key
- **Input**: Audio file (multipart/form-data)
- **Output**: `{"transcription_key": "uuid"}`

### GET /get_transcription/{key}
Get transcription result by key
- **Output**: `{"status": "ready|processing", "text": "transcription"}`

### GET /health
Health check endpoint

## Testing

```bash
# Test health
curl http://localhost:8000/health

# Test upload (with audio file)
curl -X POST -F "audio=@test.wav" http://localhost:8000/upload_chunk

# Test transcription
curl http://localhost:8000/get_transcription/{key}
```