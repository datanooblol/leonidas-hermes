from .utils import call_agent, pack_message
import asyncio
from .base import Context
import json
from .task_manager import TaskManager
import logging

class ExtractionTask:
    def __init__(
            self, 
            websocket,
            model_id:str,
            context:Context,
            task_manager:TaskManager
    ):
        self.websocket = websocket
        self.context = context
        self.model_id = model_id
        self.task_manager = task_manager
        self.logger = logging.getLogger("extraction_task")

    async def extract_information(self, id, content):
        try:
            agent_name = "customer-information-extractor"
            response = await call_agent(agent_name=agent_name, id=id, model_id=self.model_id, content=content)
            data = response.get("data", {})
            self.logger.debug(f"Extracted information: {data}")
            is_update = self.context.update_customer_information(data)
            if is_update:
                response_data = self.context.get_customer_information()
                response_msg = pack_message(agent_name, response_data)
                await self.websocket.send_text(json.dumps(response_msg))
                await self.check_product_update()
        except Exception as e:
            self.logger.error(f"Information Extraction failed: {e}")

    async def extract_interest(self, id, content):
        try:
            agent_name = "customer-interest-extractor"
            response = await call_agent(agent_name=agent_name, id=id, model_id=self.model_id, content=content)
            data = response.get("data", {})
            self.logger.debug(f"Extracted interest: {data}")
            is_update = self.context.update_customer_interest(data)
            if is_update:
                response_data = self.context.get_customer_interest()
                response_msg = pack_message(agent_name, response_data)
                await self.websocket.send_text(json.dumps(response_msg))
                await self.check_product_update()
        except Exception as e:
            self.logger.error(f"Interest Extraction failed: {e}")
    
    async def extract_checklist(self, id, content):
        try:
            agent_name = "agent-checklist-extractor"
            response = await call_agent(agent_name=agent_name, id=id, model_id=self.model_id, content=content)
            data = response.get("data", {})
            self.logger.debug(f"Extracted checklist: {data}")
            is_update = self.context.update_agent_checklist(data)
            if is_update:
                response_data = self.context.get_agent_checklist()
                response_msg = pack_message(agent_name, response_data)
                await self.websocket.send_text(json.dumps(response_msg))
                await self.check_stage_transition()
        except Exception as e:
            self.logger.error(f"Checklist Extraction failed: {e}")

    async def check_product_update(self):
        current_filters = self.context.get_product_filters()

        if current_filters != self.context.last_product_filters:
            self.context.last_product_filters = current_filters.copy()
            self.task_manager.product_event.set()
            self.logger.info("Product filters updated, triggering product update.")

    async def check_stage_transition(self):
        old_stage = self.context.stage
        if self.context.stage=="greeting" and self.context.is_checklist_complete():
            self.logger.debug(f"Current Checklist: {self.context.get_agent_checklist()}")
            self.logger.info("Checklist complete, moving to discovery stage.")
            self.context.stage = "discovery"
        if old_stage != self.context.stage:
            self.task_manager.transition_event.set()

    async def process_message(self):
        while True:
            try:
                id, content = await self.task_manager.message_queue.get()
                if not self.context.is_information_complete():
                    asyncio.create_task(self.extract_information(id, content))

                if not self.context.is_interest_complete():
                    asyncio.create_task(self.extract_interest(id, content))
                    
                if not self.context.is_checklist_complete():
                    asyncio.create_task(self.extract_checklist(id, content))
            except Exception as e:
                self.logger.error(f"Message Processing failed: {e}")


        