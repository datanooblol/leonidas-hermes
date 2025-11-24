from .base import BaseWebsocketWorker, Context, WebSocket, CancelledError
import json
import asyncio
from backend.llms.base import UserMessage
from toon import decode
from backend.llms.utils import parse_blockcode
from typing import Callable
from backend.llms.base import BaseLLM
import logging
from backend.agents.extractor import Extractor

# class ExtractionProcessor(BaseWebsocketWorker):
#     """
#     Args:
#         extraction_task (str) : name of extraction name
#         llm (BaseLLM) : LLM model
#         system_prompt (str) : an instruction for extraction using PromptHub().method_that_return_markdown_string
#         DataModel (Callable) : a data model using to parsing model response and return as dictionary
#         updateFunc (Callable) : an update function that will update data i.e. context.update_function
#         returnData (dict) : a dictionary containing type and other value i.e. dict(type="message_type", value=context.work_with_updateFunc) or dict(type="information", customer_information=context.customer_information)
#         length (int) : how long of transcription chunk is (time window)
#         offset (int) : incremental step (rolling time window)
#         sleep (float) : a sleep time using in while loop
#         logger (logging) : python logging object, default=None
#     """
#     def __init__(
#             self, 
#             extraction_task:str,
#             llm:BaseLLM, 
#             system_prompt:str, 
#             DataModel:Callable, 
#             updateFunc:Callable,
#             returnData:dict,
#             length:int=5, 
#             offset:int=2, 
#             sleep:float=2.0,
#             logger=None
#         ):
#         self.system_prompt = system_prompt
#         self.DataModel = DataModel
#         self.updateFunc = updateFunc
#         self.returnData = returnData # {"type": "message type", "customer_information": context.customer_information}
#         # Initialize the LLM client (Bedrock Nova for fast extraction)
#         self.llm = llm
#         self.length = length  # Number of chunks to extract at once
#         self.offset = offset  # How many chunks to move forward after each extraction
#         self.sleep = sleep  # How long to sleep between checks
#         self.logger = logging.getLogger(extraction_task) if logger is None else logger
#         # Initialize queue for background processing
#         self.extraction_queue = asyncio.Queue()

#     def extract_information(self, text):
#         """
#         SYNCHRONOUS function that calls LLM to extract customer info
#         This is the SLOW part that we want to run in background
#         """
#         self.logger.info(f"Starting extraction - text length: {len(text)} chars")
        
#         try:
#             # Call LLM - this takes 1-3 seconds (BLOCKING)
#             response = self.llm.run(self.system_prompt, [UserMessage(content=text)])
#             self.logger.debug(f"LLM response: {response.content}")
            
#             # Parse the structured response from LLM
#             data = parse_blockcode(response.content, "toon")
#             data = decode(data)
#             data = self.DataModel(**data)
#             data = data.model_dump()
            
#             self.logger.info(f"Extraction completed - extracted {len(data)} fields")
#             self.logger.debug(f"LLM parsed response: {data}")
#             return data
            
#         except Exception as e:
#             self.logger.error(f"Extraction failed: {e}")
#             return {}  # Return empty dict if extraction fails

#     async def extraction_worker(self, ws: WebSocket, context: Context):
#         """
#         Background worker that processes extraction requests
#         This runs in parallel with the main loop
#         """
#         while True:
#             try:
#                 # WAIT for text to be queued (this blocks until text is available)
#                 text = await self.extraction_queue.get()
                
#                 # RUN EXTRACTION in thread pool to avoid blocking
#                 # run_in_executor moves the slow LLM call to a separate thread
#                 data = await asyncio.get_event_loop().run_in_executor(
#                     None,  # Use default thread pool
#                     self.extract_information,  # Function to run
#                     text   # Argument to pass
#                 )
                
#                 # PROCESS RESULTS if extraction succeeded
#                 if data:
#                     # Merge new info with existing customer data
#                     is_update = self.updateFunc(data)
#                     if is_update:
#                         # Send updated customer info to frontend
#                         await ws.send_text(json.dumps(self.returnData))
#             except Exception as e:
#                 self.logger.error(f"Extraction worker error: {e}")

#     async def run_worker(self, ws: WebSocket, context: Context):
#         """
#         MAIN WORKER FUNCTION - implements the background queue pattern
#         This prevents LLM calls from blocking the main loop
#         """
        
#         # === SETUP PHASE ===
#         index = 0  # Current position in transcription_texts (where we start extracting)
        
#         # === START BACKGROUND WORKER ===
#         # This creates a separate async task that runs in parallel
#         asyncio.create_task(self.extraction_worker(ws, context))
        
#         # === MAIN SCHEDULING LOOP ===
#         # This loop decides WHEN to extract and WHAT text to send
#         try:
#             while True:
#                 # CHECK if we have enough transcriptions from current position
#                 # We need at least 'length' chunks starting from 'index'
#                 available_chunks = len(context.transcription_texts[index:])
                
#                 # TRIGGER CONDITION: Extract when we have 5+ chunks from current position
#                 if available_chunks >= self.length:
                    
#                     # TEXT SELECTION: Get exactly 5 chunks starting from current index
#                     # Example: if index=0, get chunks [0,1,2,3,4]
#                     # Example: if index=2, get chunks [2,3,4,5,6]
#                     text = "".join(context.transcription_texts[index:index+self.length])
                    
#                     # QUEUE THE WORK: Put text in queue for background worker
#                     # This is non-blocking - we don't wait for extraction to complete
#                     await self.extraction_queue.put(text)
                    
#                     # MOVE FORWARD: Advance index by offset (2 chunks)
#                     # This creates overlap between extractions for better continuity
#                     # Example: index 0→2→4→6 (with 3-chunk overlap each time)
#                     index += self.offset
                    
#                 # SLEEP: Check every 2 seconds (prevents busy waiting)
#                 await asyncio.sleep(self.sleep)
                
#         except CancelledError:
#             self.logger.info("Extraction stopped.")
#         except Exception as e:
#             self.logger.error(f"Extraction error: {e}")
#         finally:
#             self.logger.info("Extraction task completed.")

class ExtractionProcessor(BaseWebsocketWorker):
    """
    Args:
        extraction_task (str) : name of extraction name
        llm (BaseLLM) : LLM model
        system_prompt (str) : an instruction for extraction using PromptHub().method_that_return_markdown_string
        DataModel (Callable) : a data model using to parsing model response and return as dictionary
        updateFunc (Callable) : an update function that will update data i.e. context.update_function
        returnData (dict) : a dictionary containing type and other value i.e. dict(type="message_type", value=context.work_with_updateFunc) or dict(type="information", customer_information=context.customer_information)
        length (int) : how long of transcription chunk is (time window)
        offset (int) : incremental step (rolling time window)
        sleep (float) : a sleep time using in while loop
        logger (logging) : python logging object, default=None
    """
    def __init__(
            self, 
            extraction_task:str,
            llm:Extractor, 
            updateFunc:Callable,
            returnData:dict,
            length:int=5, 
            offset:int=2, 
            sleep:float=2.0,
            logger=None
        ):
        self.updateFunc = updateFunc
        self.returnData = returnData # {"type": "message type", "customer_information": context.customer_information}
        # Initialize the LLM client (Bedrock Nova for fast extraction)
        self.llm = llm
        self.length = length  # Number of chunks to extract at once
        self.offset = offset  # How many chunks to move forward after each extraction
        self.sleep = sleep  # How long to sleep between checks
        self.logger = logging.getLogger(extraction_task) if logger is None else logger
        # Initialize queue for background processing
        self.extraction_queue = asyncio.Queue()

    async def extraction_worker(self, ws: WebSocket, context: Context):
        """
        Background worker that processes extraction requests
        This runs in parallel with the main loop
        """
        while True:
            try:
                # WAIT for text to be queued (this blocks until text is available)
                text = await self.extraction_queue.get()
                
                # RUN EXTRACTION in thread pool to avoid blocking
                # run_in_executor moves the slow LLM call to a separate thread
                data = await asyncio.get_event_loop().run_in_executor(
                    None,  # Use default thread pool
                    self.llm.run,  # Function to run
                    [dict(role="user", content=text)]   # Argument to pass
                )
                
                # PROCESS RESULTS if extraction succeeded
                if data:
                    # Merge new info with existing customer data
                    is_update = self.updateFunc(data.model_dump())
                    if is_update:
                        # Send updated customer info to frontend
                        await ws.send_text(json.dumps(self.returnData))
            except Exception as e:
                self.logger.error(f"Extraction worker error: {e}")

    async def run_worker(self, ws: WebSocket, context: Context):
        """
        MAIN WORKER FUNCTION - implements the background queue pattern
        This prevents LLM calls from blocking the main loop
        """
        
        # === SETUP PHASE ===
        index = 0  # Current position in transcription_texts (where we start extracting)
        
        # === START BACKGROUND WORKER ===
        # This creates a separate async task that runs in parallel
        asyncio.create_task(self.extraction_worker(ws, context))
        
        # === MAIN SCHEDULING LOOP ===
        # This loop decides WHEN to extract and WHAT text to send
        try:
            while True:
                # CHECK if we have enough transcriptions from current position
                # We need at least 'length' chunks starting from 'index'
                available_chunks = len(context.transcription_texts[index:])
                
                # TRIGGER CONDITION: Extract when we have 5+ chunks from current position
                if available_chunks >= self.length:
                    
                    # TEXT SELECTION: Get exactly 5 chunks starting from current index
                    # Example: if index=0, get chunks [0,1,2,3,4]
                    # Example: if index=2, get chunks [2,3,4,5,6]
                    text = "".join(context.transcription_texts[index:index+self.length])
                    
                    # QUEUE THE WORK: Put text in queue for background worker
                    # This is non-blocking - we don't wait for extraction to complete
                    await self.extraction_queue.put(text)
                    
                    # MOVE FORWARD: Advance index by offset (2 chunks)
                    # This creates overlap between extractions for better continuity
                    # Example: index 0→2→4→6 (with 3-chunk overlap each time)
                    index += self.offset
                    
                # SLEEP: Check every 2 seconds (prevents busy waiting)
                await asyncio.sleep(self.sleep)
                
        except CancelledError:
            self.logger.info("Extraction stopped.")
        except Exception as e:
            self.logger.error(f"Extraction error: {e}")
        finally:
            self.logger.info("Extraction task completed.")


"""
REFACTORED BENEFITS:

1. CLEANER ARCHITECTURE:
   - Queue initialized once in __init__
   - extraction_worker as separate method (reusable)
   - Less nested code in run_worker

2. BETTER MAINTAINABILITY:
   - Worker logic separated from scheduling logic
   - Easier to test individual components
   - Clear separation of concerns

3. CONSISTENT PATTERN:
   - Same architecture as SummaryProcessor
   - Both use self.queue in __init__
   - Both have separate worker methods
"""