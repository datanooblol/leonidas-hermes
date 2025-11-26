from abc import ABC, abstractmethod
from uuid import uuid4
from fastapi import WebSocket
from asyncio import Queue, CancelledError
import time
from typing import Optional, List, Dict, Any, Literal
from dataclasses import dataclass, field

@dataclass
class Context:
    session_id: str = field(default_factory=lambda: str(uuid4()))
    audio_queue: Queue = field(default_factory=Queue)
    transcription_queue: Queue = field(default_factory=Queue)
    product_queue: Queue = field(default_factory=Queue)
    transcription_texts: List[str] = field(default_factory=list)
    summaries: List[str] = field(default_factory=list)
    customer_information: Dict[str, Any] = field(default_factory=dict)
    customer_interest: Dict[str, Any] = field(default_factory=dict)
    agent_checklist: Dict[str, Any] = field(default_factory=dict)
    stage_queue: Queue = field(default_factory=Queue)
    stage:Literal["greeting", "discovery", "pitch", "closing"] = "greeting"
    guide:Dict[str, Any] = field(default_factory=dict)
    objection: Optional[bool] = None
    information_history: List[Dict[str, Any]] = field(default_factory=list)

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
            
    def _update_data(self, new_info, current_info):
        changes_detected = False
        
        for field, value in new_info.items():
            if value is not None:
                if field not in current_info or current_info[field] != value:
                    current_info[field] = value
                    changes_detected = True
        
        return changes_detected

    def update_agent_checklist(self, new_info):
        return self._update_data(new_info, self.agent_checklist)
    
    def update_customer_interest(self, new_info):
        return self._update_data(new_info, self.customer_interest)
    
    def update_guide(self, new_info):
        self.stage = new_info
        return True

class BaseWebsocketWorker(ABC):
    @abstractmethod
    async def run_worker(self, ws: WebSocket, context:Context): pass