from .base import BaseWebsocketWorker, Context, WebSocket, CancelledError
import json
import asyncio
from backend.llms.ollama import OllamaLLM, OpenAIOutputMessage
from backend.llms.base import UserMessage

# system_prompt = """\
# นี่คือบทสนทนาระหว่างบริษัทประกันกับลูกค้า
# สรุปใจความให้ครอบคลุมมากที่สุดจาก จาก CONTEXT และ TEXT ที่กำหนด
# """

system_prompt = """\
คุณเป็น AI Sales Coach ที่ช่วยวิเคราะห์บทสนทนาระหว่างเซลส์และลูกค้าแบบเรียลไทม์

**วัตถุประสงค์:** สรุปบทสนทนาและให้คำแนะนำเพื่อเพิ่มโอกาสปิดการขาย

**รูปแบบการตอบ (ใช้ Markdown):**

## 📋 สรุปบทสนทนา
- **ความต้องการลูกค้า:** [สิ่งที่ลูกค้าต้องการ]
- **ข้อกังวล/คำถาม:** [ปัญหาหรือข้อสงสัยของลูกค้า]
- **จุดสนใจ:** [สิ่งที่ลูกค้าให้ความสนใจ]

## 🎯 สถานะการขาย
- **ระดับความสนใจ:** 🟢สูง / 🟡ปานกลาง / 🔴ต่ำ
- **ความพร้อมซื้อ:** [ประเมินจาก 1-10]
- **อุปสรรคหลัก:** [สิ่งที่ขัดขวางการตัดสินใจ]

## 💡 คำแนะนำเซลส์ (เร่งด่วน)
| ควรทำ | ไม่ควรทำ |
|-------|----------|
| [การกระทำที่แนะนำ] | [สิ่งที่ควรหลีกเลี่ยง] |

## 🔥 กลยุทธ์ปิดการขาย
- **ขั้นตอนถัดไป:** [สิ่งที่ควรทำทันที]
- **จุดขาย:** [เน้นประโยชน์ที่ลูกค้าสนใจ]
- **ข้อเสนอ:** [โปรโมชั่นหรือเงื่อนไขพิเศษ]

วิเคราะห์จาก CONTEXT (บทสนทนาก่อนหน้า) และ TEXT (บทสนทนาใหม่) ที่กำหนด
"""
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
        self.llm = OllamaLLM(model_name="gpt-oss:20b", OutputMessage=OpenAIOutputMessage)

    def summarize(self, summaries, texts):
        
        # content = "".join(texts)
        context = f"CONTEXT:\n\n{summaries[-1]}\n\n" if summaries else ""
        content = "TEXT:\n\n{content}".format(content="".join(texts))
        response = self.llm.run(system_prompt, [UserMessage(content=context+content)])
        return response.content

    async def run_worker(self, ws: WebSocket, context: Context):
        index = 0
        length = 5
        offset = 2
        try:
            while True:
                if len(context.transcription_texts[index:])>length:
                    summaries = context.summaries
                    summary = self.summarize(summaries, context.transcription_texts[index:index+length])
                    summaries.append(summary)
                    await ws.send_text(json.dumps(dict(
                        type="summary",
                        summary=summary
                    )))
                    index += offset
                await asyncio.sleep(1.0)  # Check every 1 second
        except CancelledError:
            print("Summary stopped.")