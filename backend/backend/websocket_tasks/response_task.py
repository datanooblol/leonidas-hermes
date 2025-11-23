from backend.websocket_tasks.base import BaseWebsocketWorker, Context, WebSocket, CancelledError
import json
from backend.audio_processing.preprocessing import deduplicate_exact_match
import asyncio

class TranscriptionResponseProcessor(BaseWebsocketWorker):
    def __init__(self, voice_memory):
        self.voice_memory = voice_memory
    
    def process_response(self, record_data: dict):
        try:
            records = record_data["records"]
            timestamp = record_data["timestamp"]
            
            if len(records) >= 2:
                last_transcriptions = self.voice_memory.get_transcriptions_by_chunks([rec.chunk_id for rec in records])
                latest = last_transcriptions[0].transcribed_text
                previous = last_transcriptions[1].transcribed_text if len(last_transcriptions) > 1 else ""
                deduplicated_transcription = deduplicate_exact_match(latest, previous)
            else:
                last_transcriptions = self.voice_memory.get_transcriptions_by_chunks([records[0].chunk_id])
                deduplicated_transcription = last_transcriptions[0].transcribed_text
            
            return {
                "type": "transcription",
                "timestamp": timestamp,
                "transcription": deduplicated_transcription,
                "status": "success"
            }
        except Exception as e:
            return {
                "error": str(e),
                "status": "error"
            }

    async def run_worker(self, ws: WebSocket, context: Context):
        try:
            while True:
                record_data = await context.transcription_queue.get()
                response = self.process_response(record_data)
                if response["transcription"]:
                    context.transcription_texts.append(response["transcription"])
                await ws.send_text(json.dumps(response))
        except CancelledError:
            print("Return transcription stopped.")

class ProductListResponseProcessor(BaseWebsocketWorker):
    def __init__(self, products, afford:float=0.1):
        self.products = products
        self.last_filter_hash = None
        self.afford = afford

    def product_filter_by_customer_info(self, age=None, income_per_month=None, **kwargs):
        """Simple filtering using customer information only"""
        dataset = self.products
        mask = True
        
        if age:
            mask &= dataset['age_min'] <= age
            mask &= dataset['age_max'] >= age
            
        if income_per_month:
            afford = income_per_month * self.afford
            mask &= dataset['premium_min_month_thb'] <= afford
            mask &= dataset['premium_max_month_thb'] >= afford
            
        return dataset.loc[mask,:].head(5)

    def _generate_filter_hash(self, customer_info):
        """Generate hash to detect if filtering criteria changed"""
        import hashlib
        filter_data = f"{customer_info}"
        return hashlib.md5(filter_data.encode()).hexdigest()

    async def run_worker(self, ws: WebSocket, context: Context):
        try:
            while True:
                # Only process if we have customer information
                if context.customer_information:
                    # Generate filter hash to detect changes
                    current_hash = self._generate_filter_hash(context.customer_information)
                    
                    # Only process if filters changed
                    if current_hash != self.last_filter_hash:
                        print(f"[ProductList] Customer info changed: {context.customer_information}")
                        
                        current_product_list = self.product_filter_by_customer_info(**context.customer_information)
                        print(f"[ProductList] Generated product list length: {len(current_product_list) if current_product_list else 0}")
                        if current_product_list.shape[0]>0: 
                        # Send updated product list
                            await ws.send_text(json.dumps({
                                "type": "product_list",
                                "product_list": current_product_list.to_dict(orient="records"),
                            }))                        
                        self.last_filter_hash = current_hash
                
                await asyncio.sleep(2.0)
        except CancelledError:
            print("Return product list stopped.")
