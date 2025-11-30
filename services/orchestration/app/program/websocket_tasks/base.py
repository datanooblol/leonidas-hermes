from abc import ABC, abstractmethod
from uuid import uuid4
from fastapi import WebSocket
from asyncio import CancelledError
import time
from typing import List, Dict, Any, Literal
from dataclasses import dataclass, field

@dataclass
class Context:
    session_id: str = field(default_factory=lambda: str(uuid4()))
    transcription_texts: List[str] = field(default_factory=list)
    customer_information: Dict[str, Any] = field(default_factory=dict)
    customer_interest: Dict[str, Any] = field(default_factory=dict)
    agent_checklist: Dict[str, Any] = field(default_factory=dict)
    stage:Literal["greeting", "discovery", "pitch", "closing"] = "greeting"
    previous_stage: str = "greeting"
    in_objection: bool = False
    objection_cooldown_until: float = 0.0
    information_history: List[Dict[str, Any]] = field(default_factory=list)
    last_product_filters:dict = field(default_factory=dict)

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

    def is_checklist_complete(self) -> bool:
        """Check if all checklist items are True"""
        # if not self.agent_checklist:
        #     return False
        
        # Check if all values are True (not None or False)
        required_fields = ["agent_introduced", "company_mentioned", "permission_asked"]
        # return all(value is True for value in self.agent_checklist.values())
        return all(self.agent_checklist.get(field) for field in required_fields)
    
    def is_information_complete(self) -> bool:
        required_fields = ["age", "income_per_month", "marital_status", "number_of_children"]
        return all(self.customer_information.get(field) is not None for field in required_fields)
    
    def is_interest_complete(self) -> bool:
        required_fields = ["life_insurance", "health_insurance", "critical_illness", "accident_insurance", "retirement_planning", "tax_benefits"]
        return all(self.customer_interest.get(field) is not None for field in required_fields)

    def get_agent_checklist(self):
        return self.agent_checklist
    
    def get_customer_interest(self):
        return self.customer_interest
    
    def get_customer_information(self):
        return self.customer_information

    def get_stage(self):
        return self.stage
    
    def get_product_filters(self):
        return self.customer_information

class BaseWebsocketWorker(ABC):
    @abstractmethod
    async def run_worker(self, ws: WebSocket, context:Context): pass