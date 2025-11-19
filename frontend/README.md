# Real-time Transcription Frontend

Next.js frontend for real-time audio transcription with separate recording and display components.

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs on: http://localhost:3000

## Architecture

### Components

- **AudioRecorder**: Records audio in 2-second chunks and uploads to backend
- **TranscriptionDisplay**: Polls backend for transcription results and displays them

### Key Features

- ✅ Real-time audio recording with 2-second chunking
- ✅ Non-blocking uploads (recording continues while uploading)
- ✅ Independent transcription polling and display
- ✅ Clean component separation
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling

## Usage

1. Click "Start Recording" to begin audio capture
2. Audio is automatically chunked every 2 seconds and uploaded
3. Transcriptions appear in real-time as they're processed
4. Click "Stop Recording" to end the session

## Backend Integration

- **Upload**: POST to `http://localhost:8000/upload_chunk`
- **Transcription**: GET from `http://localhost:8000/get_transcription/{key}`

Make sure the FastAPI backend is running on port 8000 before using the frontend.