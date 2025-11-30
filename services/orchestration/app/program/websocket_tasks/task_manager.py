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

from asyncio import Queue

class MockExtractor:
    def __init__(self, websocket, message_queue:Queue, command_queue:Queue):
        self.message_queue = message_queue
        self.command_queue = command_queue
        self.product_queue = Queue()
        self.websocket = websocket

    async def extractor_component(self, message):
        while True:
            # do the work
            filters ={} # some function to extract filters
            await self.product_queue.put(filters)

    async def command_component(self, message):
        while True:
            # do the work
            pass

    async def recommend_product(self, message):
        while True:
            # do the work
            pass
    
    async def llm1(self, message):return
    async def llm2(self, message):return
    async def llm3(self, message):return

    async def process_messages(self, message_queue:Queue):
        while True:
            message = await message_queue.get()
            await self.llm1(message)
            await self.llm2(message)
            await self.llm3(message)

