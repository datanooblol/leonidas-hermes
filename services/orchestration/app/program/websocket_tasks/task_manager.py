import asyncio

class TaskManager:
    def __init__(self):
        self.tasks = []
        self.audio_queue = asyncio.Queue()
        self.message_queue = asyncio.Queue()
        self.eight_message_event = asyncio.Event()

    def create(self, coro):
        task = asyncio.create_task(coro)
        self.tasks.append(task)
        return task

    async def cancel_all(self):
        for t in self.tasks:
            t.cancel()
        await asyncio.gather(*self.tasks, return_exceptions=True)
