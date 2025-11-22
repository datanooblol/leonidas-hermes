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
        self.summaries = []
        self.customer_information = {}
        self.customer_interest = {}

    def update_customer_information(self, new_info):
        """Merge new customer info with existing, keeping non-null values"""
        for field, value in new_info.items():
            if value is not None:
                # Only update if we don't have this info yet
                if field not in self.customer_information or self.customer_information[field] is None:
                    self.customer_information[field] = value
                # Handle conflicts for age (if significantly different)
                elif field == "age" and abs(self.customer_information[field] - value) > 5:
                    self.customer_information[field] = value

    def update_customer_interest(self, new_info):
        """Merge new customer info with existing, keeping non-null values"""
        for field, value in new_info.items():
            if value is not None:
                # Only update if we don't have this info yet
                if field not in self.customer_interest or self.customer_interest[field] is None:
                    self.customer_interest[field] = value

class BaseWebsocketWorker(ABC):
    @abstractmethod
    async def run_worker(self, ws: WebSocket, context:Context): pass