# Debug Manual Information Update and Product Filtering
import asyncio
import json
import pandas as pd
from package.program.memory import conversation_memory
from package.program.product_filter import filter_and_send_products, get_customer_filters

# Mock WebSocket for testing
class DebugWebSocket:
    def __init__(self):
        self.messages = []
    
    async def send_text(self, message):
        data = json.loads(message)
        self.messages.append(data)
        print(f"📡 WebSocket Message Sent:")
        print(f"   Type: {data['type']}")
        if data['type'] == 'information':
            print(f"   Status: {data.get('status')}")
            if 'customer_information' in data:
                print(f"   Customer Info: {data['customer_information']}")
        elif data['type'] == 'products':
            print(f"   Products Count: {data['count']}")
            print(f"   First Product: {data['products'][0]['product_name'] if data['products'] else 'None'}")
        elif data['type'] == 'products_error':
            print(f"   Error: {data['message']}")
        print()

# Simulate handle_manual_information_update function
async def debug_manual_information_update(websocket, data):
    """Debug version of handle_manual_information_update"""
    print(f"🔧 DEBUG: Received manual update data: {data}")
    print(f"🔧 DEBUG: Current memory before update: {conversation_memory.customer_information}")
    
    is_updated = conversation_memory.update_customer_information(data)
    print(f"🔧 DEBUG: Memory updated: {is_updated}")
    print(f"🔧 DEBUG: Memory after update: {conversation_memory.customer_information}")
    
    if is_updated:
        # Send updated information
        await websocket.send_text(json.dumps({
            "type": "information",
            "customer_information": conversation_memory.customer_information,
            "status": "updated"
        }))
        
        # Debug: Check filters before product filtering
        filters = get_customer_filters()
        print(f"🔧 DEBUG: Filters extracted: {filters}")
        
        # Filter and send products if data changed
        print(f"🔧 DEBUG: Calling filter_and_send_products...")
        await filter_and_send_products(websocket, products_df)
        print(f"🔧 DEBUG: filter_and_send_products completed")
        
    else:
        await websocket.send_text(json.dumps({
            "type": "information",
            "message": "No changes detected",
            "status": "no_change"
        }))

async def run_debug_tests():
    """Run all debug tests"""
    # Load products
    global products_df
    products_df = pd.read_csv("./dataset/mock_life_insurance_products.csv")
    print(f"📊 Loaded {len(products_df)} products")

    # Initialize
    mock_ws = DebugWebSocket()
    conversation_memory.reset()

    print("\n" + "="*80)
    print("🎯 TEST 1: UPDATE WITH AGE ONLY")
    print("="*80)

    # Test 1: Age only
    test_data_1 = {"age": 35}
    await debug_manual_information_update(mock_ws, test_data_1)

    print("\n" + "="*80)
    print("🎯 TEST 2: UPDATE WITH INCOME ONLY")
    print("="*80)

    # Reset memory
    conversation_memory.reset()

    # Test 2: Income only
    test_data_2 = {"income_per_month": 50000}
    await debug_manual_information_update(mock_ws, test_data_2)

    print("\n" + "="*80)
    print("🎯 TEST 3: UPDATE WITH BOTH AGE AND INCOME")
    print("="*80)

    # Reset memory
    conversation_memory.reset()

    # Test 3: Both age and income
    test_data_3 = {"age": 35, "income_per_month": 50000}
    await debug_manual_information_update(mock_ws, test_data_3)

    print("\n" + "="*80)
    print("🎯 TEST 4: UPDATE WITH SAME DATA (NO CHANGE)")
    print("="*80)

    # Test 4: Same data (should not trigger product filtering)
    test_data_4 = {"age": 35, "income_per_month": 50000}  # Same as previous
    await debug_manual_information_update(mock_ws, test_data_4)

    print("\n" + "="*80)
    print("🎯 TEST 5: UPDATE WITH PARTIAL CHANGE")
    print("="*80)

    # Test 5: Partial change
    test_data_5 = {"age": 40, "income_per_month": 50000}  # Only age changed
    await debug_manual_information_update(mock_ws, test_data_5)

    print("\n" + "="*80)
    print("📊 SUMMARY OF ALL WEBSOCKET MESSAGES")
    print("="*80)

    print(f"Total messages sent: {len(mock_ws.messages)}")
    for i, msg in enumerate(mock_ws.messages, 1):
        print(f"{i}. {msg['type']}: {msg.get('status', msg.get('count', 'N/A'))}")

    # Check final memory state
    print(f"\n🧠 Final Memory State:")
    print(f"Customer Info: {conversation_memory.customer_information}")
    print(f"Product List Count: {len(conversation_memory.product_list)}")

    print("\n🔍 Troubleshooting Checklist:")
    print("1. ✅ Check if customer information is being updated in memory")
    print("2. ✅ Check if filters are being extracted correctly")
    print("3. ✅ Check if products are being filtered")
    print("4. ✅ Check if product list changes are detected")
    print("5. ✅ Check if WebSocket messages are being sent")

if __name__ == "__main__":
    asyncio.run(run_debug_tests())