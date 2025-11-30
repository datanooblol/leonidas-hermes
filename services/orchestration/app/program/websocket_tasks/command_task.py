from .utils import call_agent, pack_message
import asyncio
from .base import Context
import json
from .task_manager import TaskManager
import logging

class CommandTask:
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
        self.logger = logging.getLogger("command_task")

    async def process_command(self):
        while True:
            command = await self.task_manager.command_queue.get()
            if command.get("type") == "manual_information_update":
                self.context.customer_information.update(command.get("data", {}))
                await self.task_manager.product_queue.put(self.context.customer_information)