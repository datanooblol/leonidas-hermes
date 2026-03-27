from package.prompt_hub import PromptHub
from package.llms.bedrock import BedrockNova
from package.llms.extractor import parse_blockcode, Extractor
from package.datamodel.agent_datamodel import CustomerInfo, AgentCheckList, CustomerInterest, Guide
from package.program.memory import conversation_memory
from package.program.product_filter import filter_and_send_products
import json

def run_extractor(model_id, agent_name, system_prompt, DataModel, format, content):
    llm = BedrockNova(model_id=model_id)
    extractor = Extractor(
        agent_name=agent_name,
        llm=llm,
        system_prompt=system_prompt,
        DataModel=DataModel,
        format=format
    )
    response = extractor.run([dict(role="user", content=content)])
    return response

def extract_information(model_id, content):
    return run_extractor(
        model_id, "customer-info-extractor", 
        PromptHub().extract_customer_information, 
        CustomerInfo, "toon", content
    )
def extract_interest(model_id, content):
    return run_extractor(
        model_id, "customer-interest-extractor",
        PromptHub().extract_customer_interest,
        CustomerInterest, "toon", content
    )

def extract_agent_checklist(model_id, content):
    return run_extractor(
        model_id, "agent-checklist-extractor",
        PromptHub().extract_agent_checklist,
        AgentCheckList, "toon", content
    )

def suggest_discovery(model_id, content):
    return run_extractor(
        model_id, "customer-discovery-suggester",
        PromptHub().discovery_agent,
        Guide, "json", content
    )

def suggest_pitching(model_id, content):
    return run_extractor(
        model_id, "customer-pitching-suggester",
        PromptHub().pitch_agent,
        Guide, "json", content
    )

def suggest_closing(model_id, content):
    return run_extractor(
        model_id, "customer-closing-suggester",
        PromptHub().closing_agent,
        Guide, "json", content
    )
def suggest_objection(model_id, content):
    return run_extractor(
        model_id, "customer-objection-suggester",
        PromptHub().objection_handling_agent,
        Guide, "json", content
    )

# Flow 1: Customer Data Extraction
async def extract_customer_data(websocket, model_id, conversation, products_df=None):
    print(f"🔍 Starting extraction for: {conversation[:50]}...")
    try:
        info_updated = False
        interest_updated = False
        
        # Extract customer information
        print("📊 Calling extract_information...")
        info_response = extract_information(model_id, conversation)
        print(f"📊 Info response type: {type(info_response)}")
        print(f"📊 Info response: {info_response}")
        
        if info_response:
            # If it's a Pydantic object, use model_dump() or dict()
            info_data = info_response.model_dump() if hasattr(info_response, 'model_dump') else info_response.dict()
            print(f"📊 Info data: {info_data}")
            
            # Update memory with CRUD logic
            info_updated = conversation_memory.update_customer_information(info_data)
            if info_updated:
                # Send updated information to frontend
                await websocket.send_text(json.dumps({
                    "type": "information",
                    "customer_information": conversation_memory.customer_information
                }))
                print("✅ Sent updated information response")
            else:
                print("ℹ️ No new information to update")
        else:
            print("❌ No info response")
        
        # Extract customer interests
        print("🎯 Calling extract_interest...")
        interest_response = extract_interest(model_id, conversation)
        print(f"🎯 Interest response type: {type(interest_response)}")
        print(f"🎯 Interest response: {interest_response}")
        
        if interest_response:
            # If it's a Pydantic object, use model_dump() or dict()
            interest_data = interest_response.model_dump() if hasattr(interest_response, 'model_dump') else interest_response.dict()
            print(f"🎯 Interest data: {interest_data}")
            
            # Update memory with CRUD logic
            interest_updated = conversation_memory.update_customer_interest(interest_data)
            if interest_updated:
                # Send updated interests to frontend
                await websocket.send_text(json.dumps({
                    "type": "interest",
                    "customer_interest": conversation_memory.customer_interest
                }))
                print("✅ Sent updated interest response")
            else:
                print("ℹ️ No new interests to update")
        else:
            print("❌ No interest response")
        
        # Filter products if customer data was updated and products_df is available
        if (info_updated or interest_updated) and products_df is not None:
            print("🔍 Customer data updated, filtering products...")
            await filter_and_send_products(websocket, products_df)
            
    except Exception as e:
        print(f"💥 Extraction failed: {e}")
        import traceback
        traceback.print_exc()
        # Send error response to frontend
        await websocket.send_text(json.dumps({
            "type": "extraction_error",
            "message": f"Data extraction failed: {str(e)}",
            "status": "error"
        }))

# Flow 2: Strategy Generation
async def generate_strategy(websocket, model_id, stage_name, conversation):
    print(f"🎯 Starting strategy generation for stage: {stage_name}")
    try:
        # Map stage to suggestion function
        stage_functions = {
            "discovery": suggest_discovery,
            "pitch": suggest_pitching,
            "closing": suggest_closing,
            "objection": suggest_objection
        }
        
        suggest_func = stage_functions.get(stage_name)
        if suggest_func:
            print(f"🎯 Calling {stage_name} suggester...")
            strategy_response = suggest_func(model_id, conversation)
            print(f"🎯 Strategy response type: {type(strategy_response)}")
            print(f"🎯 Strategy response: {strategy_response}")
            
            if strategy_response:
                # If it's a Pydantic object, use model_dump() or dict()
                strategy_data = strategy_response.model_dump() if hasattr(strategy_response, 'model_dump') else strategy_response.dict()
                print(f"🎯 Strategy data: {strategy_data}")
                await websocket.send_text(json.dumps({
                    "type": "guide",
                    "stage_name": stage_name,
                    "guide": strategy_data
                }))
                print("✅ Sent strategy response")
            else:
                print("❌ No strategy response")
        else:
            print(f"❌ Unknown stage: {stage_name}")
            # Handle unknown stage
            await websocket.send_text(json.dumps({
                "type": "guide",
                "stage_name": stage_name,
                "message": f"Unknown stage: {stage_name}",
                "status": "error"
            }))
        
    except Exception as e:
        print(f"💥 Strategy generation failed: {e}")
        import traceback
        traceback.print_exc()
        # Send error response to frontend
        await websocket.send_text(json.dumps({
            "type": "guide",
            "stage_name": stage_name,
            "message": f"Strategy generation failed: {str(e)}",
            "status": "error"
        }))

# Flow 3: Objection Detection and Handling
async def handle_objection(websocket, model_id, conversation):
    print(f"🚨 Starting objection detection for conversation...")
    try:
        # Use objection suggester to detect and handle objections
        print("🚨 Calling suggest_objection...")
        objection_response = suggest_objection(model_id, conversation)
        print(f"🚨 Objection response type: {type(objection_response)}")
        print(f"🚨 Objection response: {objection_response}")
        
        if objection_response:
            # If it's a Pydantic object, use model_dump() or dict()
            objection_data = objection_response.model_dump() if hasattr(objection_response, 'model_dump') else objection_response.dict()
            print(f"🚨 Objection data: {objection_data}")
            
            # Check if there's actually an objection detected
            # Assuming the Guide model has fields like action, explanation, signals, lines_to_say
            if objection_data.get('action') and objection_data.get('explanation'):
                await websocket.send_text(json.dumps({
                    "type": "objection",
                    "guide": objection_data,
                    "detected": True
                }))
                print("✅ Sent objection response")
            else:
                print("ℹ️ No objection detected")
                await websocket.send_text(json.dumps({
                    "type": "objection",
                    "detected": False,
                    "message": "No objection detected"
                }))
        else:
            print("❌ No objection response")
            
    except Exception as e:
        print(f"💥 Objection handling failed: {e}")
        import traceback
        traceback.print_exc()
        # Send error response to frontend
        await websocket.send_text(json.dumps({
            "type": "objection_error",
            "message": f"Objection handling failed: {str(e)}",
            "status": "error"
        }))

# Flow 4: Agent Checklist (for greeting stage)
async def extract_agent_checklist_flow(websocket, model_id, conversation, stage_name):
    print(f"📋 Starting agent checklist extraction for {stage_name} stage...")
    try:
        # Only run checklist extraction for greeting stage
        if stage_name != "greeting":
            print(f"ℹ️ Skipping checklist - not in greeting stage (current: {stage_name})")
            return
            
        print("📋 Calling extract_agent_checklist...")
        checklist_response = extract_agent_checklist(model_id, conversation)
        print(f"📋 Checklist response type: {type(checklist_response)}")
        print(f"📋 Checklist response: {checklist_response}")
        
        if checklist_response:
            # If it's a Pydantic object, use model_dump() or dict()
            checklist_data = checklist_response.model_dump() if hasattr(checklist_response, 'model_dump') else checklist_response.dict()
            print(f"📋 Checklist data: {checklist_data}")
            
            # Update memory with CRUD logic
            is_updated = conversation_memory.update_agent_checklist(checklist_data)
            if is_updated:
                # Send updated checklist to frontend
                await websocket.send_text(json.dumps({
                    "type": "checklist",
                    "agent_checklist": conversation_memory.agent_checklist
                }))
                print("✅ Sent updated checklist response")
                
                # Check if all checklist items are True for stage transition
                if conversation_memory.is_checklist_complete():
                    print("🎯 All checklist items completed! Transitioning to discovery stage...")
                    
                    # Update stage in memory
                    conversation_memory.update_stage("discovery")
                    
                    # Send stage transition response
                    await websocket.send_text(json.dumps({
                        "type": "stage_change",
                        "from_stage": conversation_memory.previous_stage,
                        "to_stage": conversation_memory.current_stage,
                        "reason": "checklist_complete",
                        "message": "All greeting tasks completed, moving to discovery stage"
                    }))
                    print("✅ Sent stage transition response")
                else:
                    print("📋 Checklist not yet complete, staying in greeting stage")
            else:
                print("ℹ️ No new checklist updates")
        else:
            print("❌ No checklist response")
            
    except Exception as e:
        print(f"💥 Agent checklist extraction failed: {e}")
        import traceback
        traceback.print_exc()
        # Send error response to frontend
        await websocket.send_text(json.dumps({
            "type": "checklist_error",
            "message": f"Agent checklist extraction failed: {str(e)}",
            "status": "error"
        }))