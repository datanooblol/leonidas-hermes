from .base import BaseWebsocketWorker, Context, WebSocket, CancelledError
import json

class SummaryProcessor(BaseWebsocketWorker):
    def __init__(self, voice_memory):
        self.voice_memory = voice_memory

    def summarize(self,):
        return {
            "type":"summary",
            "summary": "test summary from websocket"
        }

    async def run_worker(self, ws: WebSocket, context: Context):
        index = 0
        length = 10
        offset = 5
        try:
            while True:
                if len(context.transcription_texts[index:])>length:
                    index += offset
                    response = self.summarize()
                    await ws.send_text(json.dumps(response))
        except CancelledError:
            print("Summary stopped.")