from .base import BaseWebsocketWorker, Context, WebSocket, CancelledError
from pathlib import Path
import time
from pydub import AudioSegment
from io import BytesIO
import logging

class TranscriptionProcessor(BaseWebsocketWorker):
    def __init__(self, voice_memory, ol2t, ws_session_id, logger=None):
        self.voice_memory = voice_memory
        self.ol2t = ol2t
        self.ws_session_id = ws_session_id
        self.out_dir = Path("./out_ws")
        self.out_dir.mkdir(exist_ok=True, parents=True)
        self.logger = logging.getLogger(__name__) if logger is None else logger
    
    async def process(self, audio_bytes: bytes, context: Context):
        timestamp = str(int(time.time() * 1000))
        
        try:
            # Convert audio to WAV
            audio_segment = AudioSegment.from_file(BytesIO(audio_bytes))
            wav_file = self.out_dir / f"{timestamp}.wav"
            audio_segment.export(wav_file, format="wav")
            
            chunk_id = self.voice_memory.create_chunk(self.ws_session_id, str(wav_file), 0)
            records = self.voice_memory.get_last_n_chunks(self.ws_session_id, 2)
            
            transcription = self.ol2t.run(records)
            transcription_id = self.voice_memory.create_transcription(chunk_id, transcription)
            
            await context.transcription_queue.put({
                "timestamp": timestamp,
                "records": records
            })
            
            self.logger.info(f"Processed WebSocket audio: {len(audio_bytes)} bytes")
        except Exception as e:
            self.logger.error(f"Transcription error: {e}")

    async def run_worker(self, ws: WebSocket, context: Context):
        try:
            while True:
                audio_bytes = await context.audio_queue.get()
                await self.process(audio_bytes, context)
        except CancelledError:
            self.logger.info("Transcription stopped.")