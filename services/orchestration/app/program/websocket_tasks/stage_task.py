from .utils import call_agent, pack_message
import asyncio
from .base import Context
import json
from .task_manager import TaskManager
import logging

class StageTask:
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
        self.logger = logging.getLogger("stage_task")

    async def send_new_stage(self):
        stage = self.context.get_stage()
        reasons = dict(
            discovery="checklist_complete"
        )

        self.websocket.send_text(json.dumps({
            "type": "stage_change",
            "stage": stage,
            "reason": reasons[stage]
        }))

    async def stage_transition(self):
        while True:
            await self.task_manager.transition_event.wait()
            await self.send_new_stage()
