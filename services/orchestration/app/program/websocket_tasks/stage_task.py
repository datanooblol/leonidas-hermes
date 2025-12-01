from .utils import call_agent, pack_message
import asyncio
from .base import Context
import json
from .task_manager import TaskManager
import logging
import time

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

        await self.websocket.send_text(json.dumps({
            "type": "stage_change",
            "stage": stage,
            "reason": reasons[stage]
        }))

    async def process_transition(self):
        while True:
            try:
                await self.task_manager.transition_event.wait()
                await self.send_new_stage()
                self.task_manager.transition_event.clear()
            except Exception as e:
                self.logger.error(f"Transition failed: {e}")

    async def guide_stage(self, id, content):
        stage_name = self.context.get_stage()
        try:
            agent_name = f"{stage_name}-extractor"
            response = await call_agent(agent_name=agent_name, id=id, model_id=self.model_id, content=content)
            data = response.get("data", {})
            self.logger.debug(f"{stage_name} extracted guide: {data}")
            response_msg = pack_message(agent_name, data, stage_name)
            await self.websocket.send_text(json.dumps(response_msg))
        except Exception as e:
            self.logger.error(f"{stage_name} failed: {e}")

    async def process_stage(self):
        while True:
            try:
                id, content = await self.task_manager.message_queue.get()
                # Initial idea is if in objection, we'll not run the stage detection, but it seems if we resolve the objection
                # we can't get the information back and have to wait for the next round which not good in terms of waiting time
                # if self.context.in_objection:
                #     self.logger.debug(f"Skipping guide_stage - currently in objection mode")
                #     continue
                asyncio.create_task(self.guide_stage(id, content))
            except Exception as e:
                self.logger.error(f"Message Processing failed: {e}")
    
    async def guide_objection(self, id, content):
        stage_name = "objection"
        try:
            agent_name = f"{stage_name}-extractor"
            response = await call_agent(agent_name=agent_name, id=id, model_id=self.model_id, content=content)
            data = response.get("data", {})
            self.logger.debug(f"{stage_name} extracted guide: {data}")
            await self.check_objection(data)
            # if response_data:
        except Exception as e:
            self.logger.error(f"{stage_name} failed: {e}")

    async def check_objection(self, data):
        # Fix: data might be dict, not object
        if all([data.get("action"), data.get("explanation"), data.get("signals"), data.get("lines_to_say")]):
            if self.context.in_objection is False:
                self.context.previous_stage = self.context.get_stage()
                self.context.in_objection = True
            await self.websocket.send_text(json.dumps({
                "type": "objection",
                "guide": data,
                "previous_stage": self.context.previous_stage
            }))
    
    async def process_objection(self):
        while True:
            try:
                id, content = await self.task_manager.message_queue.get()
                # Only check for objections if not in cooldown AND not already in objection
                if (time.time() >= self.context.objection_cooldown_until) and (self.context.in_objection is False):
                    asyncio.create_task(self.guide_objection(id, content))
            except Exception as e:
                self.logger.error(f"Objection Processing failed: {e}")
