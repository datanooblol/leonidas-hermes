from abc import ABC, abstractmethod
from uuid import uuid4
from fastapi import WebSocket
from asyncio import Queue, CancelledError
import time
class Context:
    def __init__(self):
        self.session_id = str(uuid4())
        self.audio_queue = Queue()
        self.transcription_queue = Queue()
        self.transcription_texts = []
        self.summaries = []
        self.customer_information = {}
        self.customer_interest = {}
        self.information_history = []  # Track changes over time

    def update_customer_information(self, new_info):
        """Enhanced merge with change detection and confidence scoring"""
        changes_detected = False
        
        for field, value in new_info.items():
            if value is not None:
                old_value = self.customer_information.get(field)
                
                # Always update if no existing value
                if field not in self.customer_information or self.customer_information[field] is None:
                    self.customer_information[field] = value
                    changes_detected = True
                    
                # Handle updates with conflict resolution
                elif self._should_update_field(field, old_value, value):
                    self.customer_information[field] = value
                    changes_detected = True
                    
                    # Log the change for audit
                    self.information_history.append({
                        "field": field,
                        "old_value": old_value,
                        "new_value": value,
                        "timestamp": time.time()
                    })
        
        return changes_detected

    def _should_update_field(self, field, old_value, new_value):
        """Smart field update logic"""
        if field == "age":
            # Update if difference > 5 years (likely correction)
            return abs(old_value - new_value) > 5
        elif field == "income_per_month":
            # Update if difference > 20% (significant change)
            return abs(old_value - new_value) / old_value > 0.2
        elif field in ["has_life_policy", "has_health_policy", "has_accident_policy"]:
            # Update boolean if more specific information
            return new_value != old_value
        else:
            # For other fields, always update with new info
            return True

    def update_customer_interest(self, new_info):
        """Track evolving customer interests"""
        changes_detected = False
        
        for field, value in new_info.items():
            if value is not None:
                # Interest can change over conversation
                if field not in self.customer_interest or self.customer_interest[field] != value:
                    self.customer_interest[field] = value
                    changes_detected = True
        
        return changes_detected

class BaseWebsocketWorker(ABC):
    @abstractmethod
    async def run_worker(self, ws: WebSocket, context:Context): pass