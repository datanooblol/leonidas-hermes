from .base import BaseWebsocketWorker, Context, WebSocket, CancelledError
import json
import asyncio
from backend.llms.base import UserMessage
from toon import decode
from backend.llms.utils import parse_blockcode
from typing import Callable
from backend.llms.base import BaseLLM

class ExtractionProcessor(BaseWebsocketWorker):
    """
    Args:
        llm (BaseLLM) : LLM model
        system_prompt (str) : an instruction for extraction using PromptHub().method_that_return_markdown_string
        DataModel (Callable) : a data model using to parsing model response and return as dictionary
        updateFunc (Callable) : an update function that will update data i.e. context.update_function
        returnData (dict) : a dictionary containing type and other value i.e. dict(type="message_type", value=context.work_with_updateFunc) or dict(type="information", customer_information=context.customer_information)
        length (int) : how long of transcription chunk is (time window)
        offset (int) : incremental step (rolling time window)
        sleep (float) : a sleep time using in while loop
    """
    def __init__(
            self, 
            llm:BaseLLM, 
            system_prompt:str, 
            DataModel:Callable, 
            updateFunc:Callable,
            returnData:dict,
            length:int=5, 
            offset:int=2, 
            sleep:float=2.0
        ):
        self.system_prompt = system_prompt
        self.DataModel = DataModel
        self.updateFunc = updateFunc
        self.returnData = returnData # {"type": "message type", "customer_information": context.customer_information}
        # Initialize the LLM client (Bedrock Nova for fast extraction)
        self.llm = llm
        self.length = length  # Number of chunks to extract at once
        self.offset = offset  # How many chunks to move forward after each extraction
        self.sleep = sleep  # How long to sleep between checks

    def extract_information(self, text):
        """
        SYNCHRONOUS function that calls LLM to extract customer info
        This is the SLOW part that we want to run in background
        """
        try:
            # Call LLM - this takes 1-3 seconds (BLOCKING)
            response = self.llm.run(self.system_prompt, [UserMessage(content=text)])
            
            # Parse the structured response from LLM
            data = parse_blockcode(response.content, "toon")
            data = decode(data)
            data = self.DataModel(**data)
            return data.model_dump()
        except Exception as e:
            print(f"Extraction error: {e}")
            return {}  # Return empty dict if extraction fails

    async def run_worker(self, ws: WebSocket, context: Context):
        """
        MAIN WORKER FUNCTION - implements the background queue pattern
        This prevents LLM calls from blocking the main loop
        """
        
        # === SETUP PHASE ===
        extraction_queue = asyncio.Queue()  # Queue to hold text waiting for extraction
        index = 0  # Current position in transcription_texts (where we start extracting)
        
        # === BACKGROUND WORKER DEFINITION ===
        async def extraction_worker():
            """
            Background worker that processes extraction requests
            This runs in parallel with the main loop
            """
            while True:
                try:
                    # WAIT for text to be queued (this blocks until text is available)
                    text = await extraction_queue.get()
                    
                    # RUN EXTRACTION in thread pool to avoid blocking
                    # run_in_executor moves the slow LLM call to a separate thread
                    data = await asyncio.get_event_loop().run_in_executor(
                        None,  # Use default thread pool
                        self.extract_information,  # Function to run
                        text   # Argument to pass
                    )
                    
                    # PROCESS RESULTS if extraction succeeded
                    if data:
                        # Merge new info with existing customer data
                        # context.updateFunc(data)
                        is_update = self.updateFunc(data)
                        if is_update:
                            # Send updated customer info to frontend
                            await ws.send_text(json.dumps(self.returnData))
                except Exception as e:
                    print(f"Extraction worker error: {e}")
        
        # === START BACKGROUND WORKER ===
        # This creates a separate async task that runs in parallel
        asyncio.create_task(extraction_worker())
        
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
                    
                    # print(f"Queuing extraction for processing... (index={index}, length={length})")
                    
                    # QUEUE THE WORK: Put text in queue for background worker
                    # This is non-blocking - we don't wait for extraction to complete
                    await extraction_queue.put(text)
                    
                    # MOVE FORWARD: Advance index by offset (2 chunks)
                    # This creates overlap between extractions for better continuity
                    # Example: index 0→2→4→6 (with 3-chunk overlap each time)
                    index += self.offset
                    
                # SLEEP: Check every 2 seconds (prevents busy waiting)
                await asyncio.sleep(self.sleep)
                
        except CancelledError:
            print("Extraction stopped.")

"""
YOUR LOGIC IMPLEMENTED:

1. EXTRACTION TRIGGER:
   - Wait until we have 5+ chunks from current position
   - Extract exactly 5 chunks starting from 'index'

2. OFFSET LOGIC:
   - After each extraction, move forward by 2 chunks
   - This creates 3-chunk overlap between extractions

3. EXAMPLE FLOW:
   Transcriptions: [A, B, C, D, E, F, G, H, I, J]
                    0  1  2  3  4  5  6  7  8  9

   Step 1: index=0, extract chunks [0,1,2,3,4] = "ABCDE"
           → index += 2 → index=2

   Step 2: index=2, extract chunks [2,3,4,5,6] = "CDEFG"  
           → index += 2 → index=4

   Step 3: index=4, extract chunks [4,5,6,7,8] = "EFGHI"
           → index += 2 → index=6

4. OVERLAP BENEFIT:
   - Ensures continuity between extractions
   - Customer info mentioned across chunk boundaries gets captured
   - More robust than non-overlapping windows
"""