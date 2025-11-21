from abc import ABC, abstractmethod
from uuid import uuid4
from fastapi import WebSocket
from asyncio import Queue, CancelledError

class Context:
    def __init__(self):
        self.session_id = str(uuid4())
        self.audio_queue = Queue()
        self.transcription_queue = Queue()
        self.transcription_texts = []
class BaseWebsocketWorker(ABC):
    @abstractmethod
    async def run_worker(self, ws: WebSocket, context:Context): pass