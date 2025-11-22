from backend.websocket_tasks.base import BaseWebsocketWorker, Context, WebSocket, CancelledError
import json
from backend.audio_processing.preprocessing import deduplicate_exact_match

class TranscriptionResponseProcessor(BaseWebsocketWorker):
    def __init__(self, voice_memory):
        self.voice_memory = voice_memory
    
    def process_response(self, record_data: dict):
        try:
            records = record_data["records"]
            timestamp = record_data["timestamp"]
            
            if len(records) >= 2:
                last_transcriptions = self.voice_memory.get_transcriptions_by_chunks([rec.chunk_id for rec in records])
                latest = last_transcriptions[0].transcribed_text
                previous = last_transcriptions[1].transcribed_text if len(last_transcriptions) > 1 else ""
                deduplicated_transcription = deduplicate_exact_match(latest, previous)
            else:
                last_transcriptions = self.voice_memory.get_transcriptions_by_chunks([records[0].chunk_id])
                deduplicated_transcription = last_transcriptions[0].transcribed_text
            
            return {
                "type": "transcription",
                "timestamp": timestamp,
                "transcription": deduplicated_transcription,
                "status": "success"
            }
        except Exception as e:
            return {
                "error": str(e),
                "status": "error"
            }

    async def run_worker(self, ws: WebSocket, context: Context):
        try:
            while True:
                record_data = await context.transcription_queue.get()
                response = self.process_response(record_data)
                if response["transcription"]:
                    context.transcription_texts.append(response["transcription"])
                await ws.send_text(json.dumps(response))
        except CancelledError:
            print("Return transcription stopped.")