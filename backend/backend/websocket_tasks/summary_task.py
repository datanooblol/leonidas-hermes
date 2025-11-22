from .base import BaseWebsocketWorker, Context, WebSocket, CancelledError
import json
import asyncio
from backend.llms.ollama import OllamaLLM, OpenAIOutputMessage
from backend.llms.base import UserMessage

system_prompt = """\
ระบุสัญญาณสำคัญจากบทสนทนา:

🟢 BUYING_SIGNAL - ลูกค้าสนใจซื้อ
🟡 OBJECTION - ลูกค้ามีข้อกังวล  
🔴 LOSING - ลูกค้าจะปฏิเสธ
⚪ NEUTRAL - สนทนาปกติ

ตอบแค่: [สัญญาณ] + [คำแนะนำ 1 ประโยค]
"""

class SummaryProcessor(BaseWebsocketWorker):
    def __init__(self, voice_memory):
        self.voice_memory = voice_memory
        # Initialize LLM for conversation analysis
        self.llm = OllamaLLM(model_name="gpt-oss:20b", OutputMessage=OpenAIOutputMessage)

    def summarize(self, summaries, texts):
        """
        SYNCHRONOUS function that calls LLM to analyze conversation
        This is the SLOW part that we want to run in background
        """
        try:
            # Build context from previous summaries (conversation history)
            context = f"CONTEXT:\n\n{summaries[-1]}\n\n" if summaries else ""
            
            # Add new text to analyze
            content = "TEXT:\n\n{content}".format(content="".join(texts))
            
            # Call LLM - this takes 1-3 seconds (BLOCKING)
            response = self.llm.run(system_prompt, [UserMessage(content=context+content)])
            return response.content
        except Exception as e:
            print(f"Summary error: {e}")
            return ""  # Return empty string if summarization fails

    async def run_worker(self, ws: WebSocket, context: Context):
        """
        MAIN WORKER FUNCTION - implements the same background queue pattern
        This prevents LLM calls from blocking the main loop
        """
        
        # === SETUP PHASE ===
        summary_queue = asyncio.Queue()  # Queue to hold summarization requests
        last_processed_count = 0  # Track how many transcriptions we've processed
        
        # === BACKGROUND WORKER DEFINITION ===
        async def summary_worker():
            """
            Background worker that processes summarization requests
            This runs in parallel with the main loop
            """
            while True:
                try:
                    # WAIT for summarization request (this blocks until request is available)
                    data = await summary_queue.get()
                    summaries = data["summaries"]  # Previous conversation summaries
                    texts = data["texts"]          # New text chunks to analyze
                    
                    # RUN SUMMARIZATION in thread pool to avoid blocking
                    # run_in_executor moves the slow LLM call to a separate thread
                    summary = await asyncio.get_event_loop().run_in_executor(
                        None,  # Use default thread pool
                        self.summarize,  # Function to run
                        summaries,       # First argument
                        texts           # Second argument
                    )
                    
                    # PROCESS RESULTS if summarization succeeded
                    if summary:
                        # Add new summary to conversation history
                        context.summaries.append(summary)
                        
                        # Send summary to frontend
                        await ws.send_text(json.dumps({
                            "type": "summary",
                            "summary": summary
                        }))
                        print(f"Summary generated: {summary[:100]}...")
                except Exception as e:
                    print(f"Summary worker error: {e}")
        
        # === START BACKGROUND WORKER ===
        # This creates a separate async task that runs in parallel
        asyncio.create_task(summary_worker())
        
        # === MAIN SCHEDULING LOOP ===
        # This loop decides WHEN to summarize and WHAT text to send
        try:
            while True:
                # CHECK how many transcriptions we have now
                current_count = len(context.transcription_texts)
                
                # TRIGGER CONDITION: Summarize when we have 5+ new transcriptions
                # Summary needs more text than extraction, so we wait longer
                if current_count - last_processed_count >= 5:
                    
                    # TEXT SELECTION: Get specific range of transcriptions
                    # We take 5 chunks starting from where we left off
                    texts = context.transcription_texts[last_processed_count:last_processed_count+5]
                    
                    # CONTEXT: Get all previous summaries for conversation history
                    summaries = context.summaries
                    
                    print("Queuing summary for processing...")
                    
                    # QUEUE THE WORK: Put data in queue for background worker
                    # This is non-blocking - we don't wait for summarization to complete
                    await summary_queue.put({
                        "summaries": summaries,
                        "texts": texts
                    })
                    
                    # UPDATE COUNTER: Move forward by 2 (overlap for continuity)
                    # This creates overlap between summary chunks for better context
                    last_processed_count += 2
                    
                # SLEEP: Check every 2 seconds (prevents busy waiting)
                await asyncio.sleep(2.0)
                
        except CancelledError:
            print("Summary stopped.")

"""
KEY DIFFERENCES FROM EXTRACTION:

1. TRIGGER FREQUENCY:
   - Extraction: Every 3 transcriptions (more frequent)
   - Summary: Every 5 transcriptions (less frequent, needs more text)

2. TEXT SELECTION:
   - Extraction: Always last 5 chunks (sliding window)
   - Summary: Sequential chunks with overlap (progressive analysis)

3. CONTEXT HANDLING:
   - Extraction: Merges with existing customer data
   - Summary: Builds conversation history over time

4. DATA STRUCTURE:
   - Extraction: Structured data (age, income, etc.)
   - Summary: Free-form text analysis

SAME PATTERN, DIFFERENT PURPOSE:
Both use the background queue pattern to prevent LLM blocking,
but they process different types of information at different frequencies.
"""