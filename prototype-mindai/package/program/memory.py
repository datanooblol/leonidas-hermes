import json
from typing import Dict, Any, Optional
from dataclasses import dataclass, field

@dataclass
class ConversationMemory:
    """In-memory storage for conversation state"""
    
    # Stage tracking
    current_stage: str = "greeting"
    previous_stage: Optional[str] = None
    
    # Data storage
    agent_checklist: Dict[str, Any] = field(default_factory=dict)
    customer_information: Dict[str, Any] = field(default_factory=dict)
    customer_interest: Dict[str, Any] = field(default_factory=dict)
    product_list: list = field(default_factory=list)
    
    def update_stage(self, new_stage: str) -> bool:
        """Update current stage and track previous stage"""
        if self.current_stage != new_stage:
            self.previous_stage = self.current_stage
            self.current_stage = new_stage
            print(f"🔄 Stage changed: {self.previous_stage} → {self.current_stage}")
            return True
        return False
    
    def update_agent_checklist(self, new_data: Dict[str, Any]) -> bool:
        """Update agent checklist with CRUD logic"""
        if not new_data:
            return False
            
        updated = False
        for key, value in new_data.items():
            if key not in self.agent_checklist or self.agent_checklist[key] != value:
                self.agent_checklist[key] = value
                updated = True
                print(f"📋 Checklist updated: {key} = {value}")
        
        return updated
    
    def update_customer_information(self, new_data: Dict[str, Any]) -> bool:
        """Update customer information with CRUD logic"""
        if not new_data:
            return False
            
        updated = False
        for key, value in new_data.items():
            if value is not None:  # Only update if value is not None
                if key not in self.customer_information or self.customer_information[key] != value:
                    old_value = self.customer_information.get(key, "None")
                    self.customer_information[key] = value
                    updated = True
                    print(f"👤 Customer info updated: {key} = {old_value} → {value}")
        
        return updated
    
    def update_customer_interest(self, new_data: Dict[str, Any]) -> bool:
        """Update customer interest with CRUD logic"""
        if not new_data:
            return False
            
        updated = False
        for key, value in new_data.items():
            if value is not None:  # Only update if value is not None
                if key not in self.customer_interest or self.customer_interest[key] != value:
                    old_value = self.customer_interest.get(key, "None")
                    self.customer_interest[key] = value
                    updated = True
                    print(f"🎯 Customer interest updated: {key} = {old_value} → {value}")
        
        return updated
    
    def update_product_list(self, new_products: list) -> bool:
        """Update product list"""
        if not new_products:
            return False
            
        if self.product_list != new_products:
            self.product_list = new_products
            print(f"🛍️ Product list updated: {len(new_products)} products")
            return True
        
        return False
    
    def get_current_state(self) -> Dict[str, Any]:
        """Get complete current state"""
        return {
            "current_stage": self.current_stage,
            "previous_stage": self.previous_stage,
            "agent_checklist": self.agent_checklist,
            "customer_information": self.customer_information,
            "customer_interest": self.customer_interest,
            "product_count": len(self.product_list)
        }
    
    def is_checklist_complete(self) -> bool:
        """Check if all checklist items are True"""
        if not self.agent_checklist:
            return False
        return all(value is True for value in self.agent_checklist.values() if isinstance(value, bool))
    
    def reset(self):
        """Reset all memory to initial state"""
        self.current_stage = "greeting"
        self.previous_stage = None
        self.agent_checklist.clear()
        self.customer_information.clear()
        self.customer_interest.clear()
        self.product_list.clear()
        print("🔄 Memory reset to initial state")

# Global memory instance (for prototype)
conversation_memory = ConversationMemory()