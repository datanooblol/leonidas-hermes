"""
Complete WebSocket Test Script for Leonidas Hermes
Tests full conversation flow from greeting to closing
"""
import asyncio
import websockets
import json
import time

class ConversationTester:
    def __init__(self, uri="ws://localhost:8000/ws"):
        self.uri = uri
        self.websocket = None
        
    async def connect(self):
        """Connect to WebSocket server"""
        print("🔌 Connecting to WebSocket server...")
        self.websocket = await websockets.connect(self.uri)
        print("✅ Connected successfully!")
        
    async def listen_for_messages(self, duration=2):
        """Listen for incoming messages for specified duration"""
        print(f"👂 Listening for messages ({duration}s)...")
        end_time = time.time() + duration
        
        while time.time() < end_time:
            try:
                message = await asyncio.wait_for(self.websocket.recv(), timeout=0.5)
                data = json.loads(message)
                self.print_message("📨 RECEIVED", data)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print(f"❌ Error receiving message: {e}")
                break
                
    async def send_command(self, command_type, data, listen_duration=3):
        """Send command and listen for responses"""
        command = {
            "type": command_type,
            "data": data
        }
        
        print(f"\n📤 SENDING: {command_type}")
        print(f"   Data: {data}")
        
        await self.websocket.send(json.dumps(command))
        await self.listen_for_messages(listen_duration)
        
    def print_message(self, prefix, data):
        """Pretty print received messages"""
        msg_type = data.get("type", "unknown")
        print(f"\n{prefix}: {msg_type}")
        
        if msg_type == "guide":
            guide = data.get("guide", {})
            print(f"   Stage: {data.get('stage_name', 'N/A')}")
            print(f"   Action: {guide.get('action', 'N/A')}")
            if guide.get('lines_to_say'):
                print(f"   Lines: {guide['lines_to_say'][:2]}")  # First 2 lines
                
        elif msg_type == "information":
            info = data.get("customer_information", {})
            print(f"   Customer: Age {info.get('age')}, Income {info.get('income_per_month')}, {info.get('marital_status')}")
            
        elif msg_type == "interest":
            interests = data.get("customer_interest", {})
            active_interests = [k for k, v in interests.items() if v]
            print(f"   Interests: {active_interests}")
            
        elif msg_type == "products":
            products = data.get("products", [])
            print(f"   Products: {len(products)} found")
            if products:
                print(f"   Example: {products[0]['product_name']} ({products[0]['premium_min_month_thb']}-{products[0]['premium_max_month_thb']} THB)")
                
        elif msg_type == "objection":
            guide = data.get("guide", {})
            print(f"   Objection detected!")
            print(f"   Action: {guide.get('action', 'N/A')}")
            
        elif msg_type == "stage_change":
            print(f"   From: {data.get('from_stage')} → To: {data.get('to_stage')}")
            print(f"   Reason: {data.get('reason')}")
            
        else:
            # Show other message types with key info
            key_fields = ['message', 'status', 'stage_name', 'count']
            for field in key_fields:
                if field in data:
                    print(f"   {field}: {data[field]}")

async def run_conversation_test():
    """Run complete conversation simulation"""
    tester = ConversationTester()
    
    try:
        # 1. Connect and get greeting
        await tester.connect()
        print("\n" + "="*60)
        print("🎯 STEP 1: CONNECTION & GREETING")
        print("="*60)
        await tester.listen_for_messages(3)
        
        # 2. Agent introduction and consent (greeting stage)
        print("\n" + "="*60)
        print("🎯 STEP 2: AGENT INTRODUCTION & CONSENT")
        print("="*60)
        
        greeting_content = """
        Agent: สวัสดีครับ ผมชื่อจอห์น จากบริษัทประกันชีวิต ABC ครับ
        Customer: สวัสดีค่ะ
        Agent: วันนี้ผมโทรมาเพื่อแนะนำโปรดักส์ประกันชีวิตใหม่ของเราครับ คุณมีเวลาสักครู่ไหมครับ
        Customer: ได้ค่ะ ดิฉันพอมีเวลาค่ะ
        Agent: ขอบคุณครับ ผมขออนุญาตสอบถามข้อมูลเบื้องต้นเพื่อแนะนำผลิตภัณฑ์ที่เหมาะสมได้ไหมครับ
        Customer: ได้ค่ะ
        """
        
        await tester.send_command("guide", {
            "stage_name": "greeting",
            "content": greeting_content
        }, 5)
        
        # 3. Discovery stage - customer shares information
        print("\n" + "="*60)
        print("🎯 STEP 3: DISCOVERY STAGE - CUSTOMER INFORMATION")
        print("="*60)
        
        discovery_content = """
        Agent: ขอทราบอายุและข้อมูลครอบครัวหน่อยครับ
        Customer: ดิฉันอายุ 35 ปีค่ะ แต่งงานแล้ว มีลูก 2 คน สามีทำงานบริษัทเอกชน
        Agent: รายได้ต่อเดือนประมาณเท่าไหร่ครับ
        Customer: รายได้รวมของครอบครัวประมาณ 80,000 บาทต่อเดือนค่ะ ส่วนตัวดิฉันได้ประมาณ 50,000 บาท
        Agent: คุณสนใจประกันประเภทไหนครับ
        Customer: อยากได้ประกันชีวิตสำหรับครอบครัว ประกันสุขภาพ และอยากวางแผนเกษียณด้วยค่ะ ส่วนประกันอุบัติเหตุไม่ค่อยสนใจ
        Agent: เข้าใจครับ คุณมีประกันอะไรอยู่แล้วไหมครับ
        Customer: มีประกันสังคมกับประกันกลุ่มจากบริษัทค่ะ แต่รู้สึกว่ายังไม่เพียงพอ
        """
        
        await tester.send_command("guide", {
            "stage_name": "discovery", 
            "content": discovery_content
        }, 8)
        
        # 4. Move to pitching stage
        print("\n" + "="*60)
        print("🎯 STEP 4: PITCHING STAGE - PRODUCT BENEFITS")
        print("="*60)
        
        pitching_content = """
        Agent: จากข้อมูลที่คุณให้มา ผมมีผลิตภัณฑ์ที่เหมาะสมมาแนะนำครับ
        Customer: ดีค่ะ อยากฟัง
        Agent: เรามีแพ็คเกจประกันชีวิตครอบครัวที่ให้ความคุ้มครอง 2 ล้านบาท เบี้ยเดือนละ 4,500 บาท
        Customer: ฟังดูดีนะคะ ได้อะไรบ้าง
        Agent: ได้ความคุ้มครองชีวิต การรักษาพยาบาล และยังมีส่วนออมเงินเกษียณด้วยครับ
        Customer: น่าสนใจค่ะ แต่...
        """
        
        await tester.send_command("guide", {
            "stage_name": "pitch",
            "content": pitching_content  
        }, 6)
        
        # 5. Customer shows financial concern (objection)
        print("\n" + "="*60)
        print("🎯 STEP 5: OBJECTION - FINANCIAL CONCERNS")
        print("="*60)
        
        objection_content = """
        Customer: แต่ว่าเบี้ย 4,500 บาทต่อเดือนค่อนข้างแพงนะคะ ตอนนี้ค่าใช้จ่ายเยอะ ลูกเรียน ผ่อนบ้าน
        Agent: เข้าใจครับ เรื่องงบประมาณเป็นเรื่องสำคัญ
        Customer: มีแพ็คเกจที่ถูกกว่านี้ไหมคะ หรือจ่ายเบี้ยน้อยกว่านี้ได้ไหม
        Agent: มีครับ แต่ความคุ้มครองจะลดลงด้วย
        Customer: งบที่จ่ายได้ตอนนี้ประมาณ 2,500-3,000 บาทต่อเดือนค่ะ
        """
        
        await tester.send_command("guide", {
            "stage_name": "pitch",
            "content": objection_content
        }, 6)
        
        # 6. Resolve objection
        print("\n" + "="*60)
        print("🎯 STEP 6: OBJECTION RESOLUTION")
        print("="*60)
        
        resolution_content = """
        Agent: ผมเข้าใจครับ ให้ผมหาแพ็คเกจที่เหมาะสมกับงบประมาณของคุณ
        Customer: ได้ค่ะ
        Agent: เรามีแพ็คเกจ Family Basic ความคุ้มครอง 1.5 ล้าน เบี้ย 2,800 บาทต่อเดือน ครอบคลุมทั้งชีวิตและสุขภาพ
        Customer: อันนี้ดูดีกว่าค่ะ ในงบที่จ่ายได้
        Agent: ดีครับ แล้วยังได้ผลตอบแทนจากการลงทุนด้วย คุ้มค่ามากครับ
        Customer: เอาอันนี้แล้วกันค่ะ
        """
        
        await tester.send_command("guide", {
            "stage_name": "pitch", 
            "content": resolution_content
        }, 5)
        
        # Manually resolve objection
        await tester.send_command("manual_resolve_objection", {
            "resolved": True
        }, 2)
        
        # 7. Move to closing stage
        print("\n" + "="*60)
        print("🎯 STEP 7: CLOSING STAGE - FINALIZE DEAL")
        print("="*60)
        
        closing_content = """
        Agent: ดีมากครับ งั้นเราไปขั้นตอนการสมัครกันเลยครับ
        Customer: ต้องเตรียมเอกสารอะไรบ้างคะ
        Agent: ต้องใช้บัตรประชาชน สำเนาทะเบียนบ้าน และใบรับรองเงินเดือนครับ
        Customer: มีครบค่ะ เมื่อไหร่จะได้รับกรมธรรม์
        Agent: ประมาณ 7-10 วันทำการหลังจากส่งเอกสารครับ
        Customer: ดีค่ะ งั้นดิฉันจะเตรียมเอกสารส่งให้
        Agent: ขอบคุณมากครับ ผมจะส่งรายละเอียดและใบสมัครให้ทาง LINE
        """
        
        await tester.send_command("guide", {
            "stage_name": "closing",
            "content": closing_content
        }, 5)
        
        # 8. Manual stage transitions test
        print("\n" + "="*60)
        print("🎯 STEP 8: MANUAL STAGE CONTROL TEST")
        print("="*60)
        
        await tester.send_command("manual_stage_update", {
            "stage_name": "closing"
        }, 3)
        
        print("\n🎉 CONVERSATION TEST COMPLETED!")
        print("="*60)
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        if tester.websocket:
            await tester.websocket.close()
            print("🔌 WebSocket connection closed")

if __name__ == "__main__":
    print("🚀 Starting Leonidas Hermes Conversation Test")
    print("Make sure the server is running: python main_clean.py")
    print("="*60)
    
    asyncio.run(run_conversation_test())