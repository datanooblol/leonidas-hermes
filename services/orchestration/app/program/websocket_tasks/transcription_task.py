from pathlib import Path
import time
from pydub import AudioSegment
from asyncio import Queue
import httpx
from io import BytesIO
from program.audio_processing.merge_overlapping_audio import merge_audio_with_overlap
from program.audio_processing.preprocessing import deduplicate_exact_match
from uuid import uuid4
from .base import Context
import json
from .task_manager import TaskManager
import logging
from typing import Any

class TranscriptionTask:
    def __init__(
            self, 
            websocket,
            context:Context,
            task_manager:TaskManager,
            memory:Any
    ):
        self.websocket = websocket
        self.context = context
        self.task_manager = task_manager
        self.logger = logging.getLogger("transcription_task")
        self.out_dir = Path("./out_ws")
        self.out_dir.mkdir(exist_ok=True, parents=True)
        self.transcription_messages = []
        self.memory = memory

    async def save_audio_file(self, session_id, audio_bytes):
        # save file
        audio_segment = AudioSegment.from_file(BytesIO(audio_bytes))
        timestamp = str(int(time.time() * 1000))
        wav_file = self.out_dir / f"{timestamp}.wav"
        audio_segment.export(wav_file, format="wav")
        chunk_id = self.memory.create_chunk(session_id, str(wav_file), 0)
        return chunk_id, timestamp
    
    async def prepare_chunk(self, session_id):
        # prep audio segment
        records = self.memory.get_last_n_chunks(session_id, 2)
        if len(records)>1:
            latest_path = records[0].audio_path
            previous_path = records[1].audio_path
            audio = merge_audio_with_overlap(latest_path, previous_path, overlap=0.5)
        else:
            audio = AudioSegment.from_wav(records[0].audio_path)
        return records, audio

    async def transcribe_audio(self, chunk_id, audio):

        # Convert AudioSegment to bytes
        buffer = BytesIO()
        audio.export(buffer, format="wav")
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

    async def save_transcription(self, chunk_id, transcription):
        transcription_id = self.memory.create_transcription(chunk_id, transcription)

    async def push_transcription(self, records, timestamp):

        last_transcriptions = self.memory.get_transcriptions_by_chunks([rec.chunk_id for rec in records])

        # send to front
        if len(records) > 1:
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
        await self.websocket.send_text(json.dumps(response))
        
        self.transcription_messages.append(deduplicated_transcription)

    async def should_trigger_queue(self, messages, window_size, offset=2, start_at=3):

        """
        Trigger logic: start at start_at messages, then every offset messages after reaching window_size
        """
        msg_len = len(messages)
        if (msg_len == start_at) or (msg_len >= window_size and (msg_len - start_at) % offset == 0):
            return "".join(messages[-window_size:])
        return None

    async def trigger_queues(self):
        # start message_queue and stage_queue
        messages_to_send = await self.should_trigger_queue(self.transcription_messages, window_size=5, offset=2, start_at=5)
        if messages_to_send:
            await self.task_manager.message_queue.put((str(uuid4()), messages_to_send))
        
        # Handle stage_queue (8 messages)  
        stage_messages_to_send = await self.should_trigger_queue(self.transcription_messages, window_size=8, offset=4, start_at=8)
        if stage_messages_to_send:
            await self.task_manager.stage_queue.put((str(uuid4()), stage_messages_to_send))

    async def process_transcription(self):
        while True:
            try:
                session_id, audio_bytes = await self.task_manager.audio_queue.get()
                chunk_id, timestamps = await self.save_audio_file(session_id, audio_bytes)
                records, audio = await self.prepare_chunk(session_id)
                response = await self.transcribe_audio(chunk_id, audio)
                transcription = response.get("text", "")
                await self.save_transcription(chunk_id, transcription)
                await self.push_transcription(records, timestamps)
                await self.trigger_queues()
            except Exception as e:
                self.logger.error(f"Transcription Processing failed: {e}")

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
        # save file
        audio_segment = AudioSegment.from_file(BytesIO(audio_bytes))
        timestamp = str(int(time.time() * 1000))
        wav_file = out_dir / f"{timestamp}.wav"
        audio_segment.export(wav_file, format="wav")
        chunk_id = memory.create_chunk(session_id, str(wav_file), 0)
        
        # prep audio segment
        records = memory.get_last_n_chunks(session_id, 2)
        if len(records)>1:
            latest_path = records[0].audio_path
            previous_path = records[1].audio_path
            audio = merge_audio_with_overlap(latest_path, previous_path, overlap=0.5)
        else:
            audio = AudioSegment.from_wav(records[0].audio_path)

        # transcribe and save
        response = await transcribe_audio(chunk_id, audio)

        transcription = response.get("text", "")
        transcription_id = memory.create_transcription(chunk_id, transcription)
        last_transcriptions = memory.get_transcriptions_by_chunks([rec.chunk_id for rec in records])

        # send to front
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
        
        # start message_queue and stage_queue
        messages_to_send = await should_trigger_queue(transcription_messages, window_size=5, offset=2, start_at=5)
        if messages_to_send:
            await message_queue.put((str(uuid4()), messages_to_send))
        
        # Handle stage_queue (8 messages)  
        stage_messages_to_send = await should_trigger_queue(transcription_messages, window_size=8, offset=4, start_at=5)
        if stage_messages_to_send:
            await stage_queue.put((str(uuid4()), stage_messages_to_send))
