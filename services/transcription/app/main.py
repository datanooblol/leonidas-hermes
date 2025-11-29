from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from asr.models.asr_models import ASRResponse
from asr.audio_processing.load_model import load_model
from asr.audio_processing.engine import TranscriptionEngine
from uuid import uuid4

asr_model = load_model()
app = FastAPI(title="Transcription Service")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/transcribe", response_model=ASRResponse)
async def transcribe(
    file: UploadFile = File(...),
    chunk_id: str = Form(...),
    # task_id: str = Form(default_factory=lambda: str(uuid4())),
    normalize: bool = Form(False),
    with_timestamps: bool = Form(False),
    # format: str = Form("wav")
):
    audio_bytes = await file.read()
    task_id = str(uuid4())
    # Placeholder for transcription logic
    # transcription = "Transcribed text from audio."
    tengine = TranscriptionEngine(asr_model)
    transcription = tengine.run(
        audio_chunks=[audio_bytes], 
        normalize=normalize, 
        with_timestamps=with_timestamps
    )
    return ASRResponse(
        chunk_id=chunk_id,
        task_id=task_id,
        text=transcription,
        processing_time=0.0,
    )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Transcription API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)