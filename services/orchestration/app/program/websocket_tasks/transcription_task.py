from .base import BaseWebsocketWorker, Context, WebSocket, CancelledError
from pathlib import Path
import time
from pydub import AudioSegment
import httpx
from io import BytesIO
import logging
from program.audio_processing.merge_overlapping_audio import merge_audio_with_overlap
from program.audio_processing.preprocessing import deduplicate_exact_match
from asyncio import Queue
import json
from uuid import uuid4
# class TranscriptionProcessor(BaseWebsocketWorker):
#     def __init__(self, voice_memory, ol2t, ws_session_id, logger=None):
#         self.voice_memory = voice_memory
#         self.ol2t = ol2t
#         self.ws_session_id = ws_session_id
#         self.out_dir = Path("./out_ws")
#         self.out_dir.mkdir(exist_ok=True, parents=True)
#         self.logger = logging.getLogger(__name__) if logger is None else logger
    
#     async def process(self, audio_bytes: bytes, context: Context):
#         timestamp = str(int(time.time() * 1000))
        
#         try:
#             # Convert audio to WAV
#             audio_segment = AudioSegment.from_file(BytesIO(audio_bytes))
#             wav_file = self.out_dir / f"{timestamp}.wav"
#             audio_segment.export(wav_file, format="wav")
            
#             chunk_id = self.voice_memory.create_chunk(self.ws_session_id, str(wav_file), 0)
#             records = self.voice_memory.get_last_n_chunks(self.ws_session_id, 2)
            
#             transcription = self.ol2t.run(records)
#             transcription_id = self.voice_memory.create_transcription(chunk_id, transcription)
            
#             await context.transcription_queue.put({
#                 "timestamp": timestamp,
#                 "records": records
#             })
            
#             self.logger.info(f"Processed WebSocket audio: {len(audio_bytes)} bytes")
#         except Exception as e:
#             self.logger.error(f"Transcription error: {e}")

#     async def run_worker(self, ws: WebSocket, context: Context):
#         try:
#             while True:
#                 audio_bytes = await context.audio_queue.get()
#                 await self.process(audio_bytes, context)
#         except CancelledError:
#             self.logger.info("Transcription stopped.")

async def transcribe_audio(chunk_id, audio_segment):
    # Convert AudioSegment to bytes
    buffer = BytesIO()
    audio_segment.export(buffer, format="wav")
    audio_bytes = buffer.getvalue()
    
    # Async HTTP request with timeout
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            "http://transcription:8001/transcribe",
            files={"file": ("audio.wav", audio_bytes, "audio/wav")},
            data={
                "chunk_id": chunk_id,
                "normalize": False,
                "with_timestamps": False,
                "format": "wav"
            }
        )
        return response.json()

# async def create_transcription_task(websocket, session_id, memory, audio_queue:Queue, message_queue:Queue):
#     out_dir = Path("./out_ws")
#     out_dir.mkdir(exist_ok=True, parents=True)
#     transcription_messages = []
#     while True:
#         audio_bytes = await audio_queue.get()
#         print("get audio bytes")
#         audio_segment = AudioSegment.from_file(BytesIO(audio_bytes))
#         timestamp = str(int(time.time() * 1000))
#         wav_file = out_dir / f"{timestamp}.wav"
#         audio_segment.export(wav_file, format="wav")
#         chunk_id = memory.create_chunk(session_id, str(wav_file), 0)

#         records = memory.get_last_n_chunks(session_id, 2)
#         if len(records)>1:
#             latest_path = records[0].audio_path
#             previous_path = records[1].audio_path
#             audio = merge_audio_with_overlap(latest_path, previous_path, overlap=0.5)
#         else:
#             audio = AudioSegment.from_wav(records[0].audio_path)

#         response = await transcribe_audio(chunk_id, audio)

#         transcription = response.get("text", "")
#         transcription_id = memory.create_transcription(chunk_id, transcription)
#         last_transcriptions = memory.get_transcriptions_by_chunks([rec.chunk_id for rec in records])

#         if len(records) >= 2:
#             latest = last_transcriptions[0].transcribed_text
#             previous = last_transcriptions[1].transcribed_text if len(last_transcriptions) > 1 else ""
#             deduplicated_transcription = deduplicate_exact_match(latest, previous)
#         else:
#             # last_transcriptions = memory.get_transcriptions_by_chunks([records[0].chunk_id])
#             deduplicated_transcription = last_transcriptions[0].transcribed_text
#         response = {
#             "type": "transcription",
#             "timestamp": timestamp,
#             "transcription": deduplicated_transcription,
#             "status": "success"            
#         }
#         await websocket.send_text(json.dumps(response))
#         last_5_messages = "".join(transcription_messages[-5:])
#         transcription_messages.append(deduplicated_transcription)
#         new_5_messages = "".join(transcription_messages[-5:])
#         # if len(transcription_messages[-5:]) >= 5:
#         if last_5_messages!=new_5_messages:
#             await message_queue.put((str(uuid4()), new_5_messages))
        
# async def should_trigger_queue(messages, window_size):
#     """
#     Trigger logic: start at 3 messages, then every 2 messages after reaching window_size
#     """
#     msg_len = len(messages)
#     if (msg_len == 3) or (msg_len >= window_size and (msg_len - 3) % 2 == 0):
#         return "".join(messages[-window_size:])
#     return None

async def should_trigger_queue(messages, window_size, offset=2, start_at=3):
    """
    Trigger logic: start at start_at messages, then every offset messages after reaching window_size
    """
    msg_len = len(messages)
    if (msg_len == start_at) or (msg_len >= window_size and (msg_len - start_at) % offset == 0):
        return "".join(messages[-window_size:])
    return None


async def create_transcription_task(websocket, session_id, memory, audio_queue:Queue, message_queue:Queue, stage_queue:Queue):
    out_dir = Path("./out_ws")
    out_dir.mkdir(exist_ok=True, parents=True)
    transcription_messages = []
    while True:
        audio_bytes = await audio_queue.get()
        print("get audio bytes")
        audio_segment = AudioSegment.from_file(BytesIO(audio_bytes))
        timestamp = str(int(time.time() * 1000))
        wav_file = out_dir / f"{timestamp}.wav"
        audio_segment.export(wav_file, format="wav")
        chunk_id = memory.create_chunk(session_id, str(wav_file), 0)

        records = memory.get_last_n_chunks(session_id, 2)
        if len(records)>1:
            latest_path = records[0].audio_path
            previous_path = records[1].audio_path
            audio = merge_audio_with_overlap(latest_path, previous_path, overlap=0.5)
        else:
            audio = AudioSegment.from_wav(records[0].audio_path)

        response = await transcribe_audio(chunk_id, audio)

        transcription = response.get("text", "")
        transcription_id = memory.create_transcription(chunk_id, transcription)
        last_transcriptions = memory.get_transcriptions_by_chunks([rec.chunk_id for rec in records])

        if len(records) >= 2:
            latest = last_transcriptions[0].transcribed_text
            previous = last_transcriptions[1].transcribed_text if len(last_transcriptions) > 1 else ""
            deduplicated_transcription = deduplicate_exact_match(latest, previous)
        else:
            deduplicated_transcription = last_transcriptions[0].transcribed_text
        
        response = {
            "type": "transcription",
            "timestamp": timestamp,
            "transcription": deduplicated_transcription,
            "status": "success"            
        }
        await websocket.send_text(json.dumps(response))
        
        transcription_messages.append(deduplicated_transcription)
        
        messages_to_send = await should_trigger_queue(transcription_messages, window_size=5, offset=2, start_at=5)
        if messages_to_send:
            await message_queue.put((str(uuid4()), messages_to_send))
        
        # Handle stage_queue (8 messages)  
        stage_messages_to_send = await should_trigger_queue(transcription_messages, window_size=8, offset=4, start_at=5)
        if stage_messages_to_send:
            await stage_queue.put((str(uuid4()), stage_messages_to_send))
