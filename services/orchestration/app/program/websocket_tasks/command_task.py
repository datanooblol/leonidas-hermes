from .utils import call_agent, pack_message
import asyncio
from .base import Context
import json
from .task_manager import TaskManager
import logging
import time

class CommandTask:
    def __init__(
            self, 
            websocket,
            context:Context,
            task_manager:TaskManager
    ):
        self.websocket = websocket
        self.context = context
        self.task_manager = task_manager
        self.logger = logging.getLogger("command_task")

    async def update_information_manually(self, data):
        if data:
            self.context.customer_information.update(data)
            await self.websocket.send_text(json.dumps({
                "type": "information",
                "customer_information": self.context.get_customer_information()
            }))
            self.task_manager.product_event.set()

    async def update_interest_manually(self, data):
        if data:
            self.context.customer_interest.update(data)
            await self.websocket.send_text(json.dumps({
                "type": "interest",
                "customer_interest": self.context.get_customer_interest()
            }))
            # self.task_manager.product_event.set()

    async def update_stage_manually(self, data):
        if data:
            stage_name = data.get("stage_name")
            self.context.stage = stage_name
            await self.websocket.send_text(json.dumps({
                "type": "guide",
                "stage_name": stage_name,
                "message": f"Stage set to {stage_name}"
            }))

    async def resolve_objection_manually(self, data):
        if data:
            self.context.in_objection = False
            self.context.objection_cooldown_until = time.time() + 30  # Reset cooldown after resolving
            await self.websocket.send_text(json.dumps({
                "type": "objection_resolved",
            }))
            self.logger.info("Objection resolved manually, cooldown reset")

    async def process_command(self):
        while True:
            try:  # Add try-catch
                command = await self.task_manager.command_queue.get()
                _type = command.get("type")
                data = command.get("data", {})
                
                if _type == "guide":
                    await self.update_stage_manually(data)
                elif _type == "manual_information_update":
                    await self.update_information_manually(data)
                elif _type == "manual_interest_update":
                    await self.update_interest_manually(data)
                elif _type == "manual_resolve_objection":
                    await self.resolve_objection_manually(data)
            except Exception as e:
                self.logger.error(f"Command processing failed: {e}")