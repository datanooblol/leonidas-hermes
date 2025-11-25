from .base import BaseWebsocketWorker, Context, WebSocket, CancelledError
import json
import asyncio
import logging
from backend.llms.base import BaseLLM
from functools import partial
from backend.agents.ai_sales_coaching.stage_agent import StageAgentFactory

class StageGuideProcessor(BaseWebsocketWorker):
    """
    Args:
        extraction_task (str) : name of extraction name
        llm (BaseLLM) : LLM extractor agent
        length (int) : how long of transcription chunk is (time window)
        offset (int) : incremental step (rolling time window)
        sleep (float) : a sleep time using in while loop
        logger (logging) : python logging object, default=None
    """
    def __init__(
            self, 
            extraction_task:str,
            llm:BaseLLM,
            length:int=5, 
            offset:int=2, 
            sleep:float=2.0,
            logger=None
        ):
        self.llm = llm
        self.length = length  # Number of chunks to extract at once
        self.offset = offset  # How many chunks to move forward after each extraction
        self.sleep = sleep  # How long to sleep between checks
        self.logger = logging.getLogger(extraction_task) if logger is None else logger
        self.stage_guide_queue = asyncio.Queue() # Initialize queue for background processing

    async def guide_worker(self, ws: WebSocket, context: Context):
        """
        Background worker that processes extraction requests
        This runs in parallel with the main loop
        """
        while True:
            try:
                text, stage = await self.stage_guide_queue.get()
                agent = StageAgentFactory.create_stage_agent(stage, self.llm)
                data = await asyncio.get_event_loop().run_in_executor(
                    None,  # Use default thread pool
                    partial(agent.run),  # Function to run
                    [dict(role="user", content=text)],   # Argument to pass
                )
                
                if data:
                    data = data.model_dump()
                    await ws.send_text(json.dumps(
                        dict(
                            typd="guide",
                            stage_name=stage,
                            guide=data
                        )
                    ))
            except Exception as e:
                self.logger.error(f"StageGuide worker error: {e}")

    async def run_worker(self, ws: WebSocket, context: Context):
        """
        MAIN WORKER FUNCTION - implements the background queue pattern
        This prevents LLM calls from blocking the main loop
        """
        index = 0  # Current position in transcription_texts (where we start extracting)
        
        asyncio.create_task(self.guide_worker(ws, context))
        try:
            while True:
                available_chunks = len(context.transcription_texts[index:])
                if available_chunks >= self.length:
                    text = "".join(context.transcription_texts[index:index+self.length])
                    await self.stage_guide_queue.put(text)
                    index += self.offset
                    
                await asyncio.sleep(self.sleep)
                
        except CancelledError:
            self.logger.info("Stage Guide stopped.")
        except Exception as e:
            self.logger.error(f"Stage Guide error: {e}")
        finally:
            self.logger.info("Stage Guide task completed.")