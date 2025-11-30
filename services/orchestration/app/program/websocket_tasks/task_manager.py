import asyncio

class TaskManager:
    def __init__(self):
        self.tasks = []
        # Centralized queue management
        self.audio_queue = asyncio.Queue()
        self.message_queue = asyncio.Queue()
        self.command_queue = asyncio.Queue()
        self.product_queue = asyncio.Queue()
        self.stage_queue = asyncio.Queue()
        self.transition_event = asyncio.Event()
        self.product_event = asyncio.Event()
    
    def create(self, coro):
        task = asyncio.create_task(coro)
        self.tasks.append(task)
        return task

    async def cancel_all(self):
        for t in self.tasks:
            t.cancel()
        await asyncio.gather(*self.tasks, return_exceptions=True)