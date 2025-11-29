from fastapi import APIRouter
from agents.pools.extractor import Extractor
from agents.llms.bedrock import BedrockNova
from agents.llms.base import ModelRequest
from .prompt_hub import PromptHub
from .data_models import CustomerInfo, CustomerInterest, AgentCheckList, Guide
from agents.core import AgentResponse
import time
router = APIRouter(prefix="/sales-coach", tags=["Sales Coach"])

def run_extractor(id, model_id, agent_name, system_prompt, DataModel, format, content):
    llm = BedrockNova(model_id=model_id)
    extractor = Extractor(
        agent_name=agent_name,
        llm=llm,
        system_prompt=system_prompt,
        DataModel=DataModel,
        format=format
    )
    start_time = time.time()
    response = extractor.run([dict(role="user", content=content)])
    response_time_ms = int((time.time() - start_time) * 1000)
    return AgentResponse(
        id=id,
        model_id=model_id,
        agent_name=agent_name,
        data=response.model_dump(),
        input_tokens=extractor.input_tokens,
        output_tokens=extractor.output_tokens,
        response_time_ms=response_time_ms,
    )

@router.post("/customer-information-extractor", response_model=AgentResponse)
async def information_extractor(request: ModelRequest):
    return run_extractor(
        request.id, request.model_id, "customer-information-extractor", 
        PromptHub().extract_customer_information, 
        CustomerInfo, "toon", request.content
    )

@router.post("/customer-interest-extractor", response_model=AgentResponse)
async def interest_extractor(request: ModelRequest):
    return run_extractor(
        request.id, request.model_id, "customer-interest-extractor", 
        PromptHub().extract_customer_interest, 
        CustomerInterest, "toon", request.content
    )

@router.post("/agent-checklist-extractor", response_model=AgentResponse)
async def checklist_extractor(request: ModelRequest):
    return run_extractor(
        request.id, request.model_id, "agent-checklist-extractor", 
        PromptHub().extract_agent_checklist, 
        AgentCheckList, "toon", request.content
    )

@router.post("/greeting-extractor", response_model=AgentResponse)
async def greeting_extractor(request: ModelRequest):
    data = {
        "action": "เริ่มการสนทนาด้วยการทักทายอย่างมืออาชีพและแนะนำตัว",
        "explanation": "เริ่มการโทรโดยการสร้างความน่าเชื่อถือและสร้างความสัมพันธ์กับลูกค้า",
        "signals": [
            "เพิ่มเริ่มต้นการโทร",
            "ลูกค้ารับสายแล้ว",
            "ไม่มีบริบทการสนทนาก่อนหน้า"
        ],
        "lines_to_say": [
            "แนะนำตัวเองและบริษัท",
            "อยากทราบว่าลูกค้ามีเวลาสักครู่ไหม",
            "อธิบายวัตถุประสงค์การโทรเกี่ยวกับข้อเสนอพิเศษของบริษัท"
        ]
    }
    return AgentResponse(
        id=request.id,
        model_id=request.model_id,
        agent_name="greeting-extractor",
        data=data,
        input_tokens=0,
        output_tokens=0,
        response_time_ms=0,
    )

@router.post("/discovery-extractor", response_model=AgentResponse)
async def discovery_extractor(request: ModelRequest):
    return run_extractor(
        request.id, request.model_id, "discovery-extractor", 
        PromptHub().discovery_agent, 
        Guide, "json", request.content
    )

@router.post("/pitch-extractor", response_model=AgentResponse)
async def pitch_extractor(request: ModelRequest):
    return run_extractor(
        request.id, request.model_id, "pitch-extractor", 
        PromptHub().pitch_agent, 
        Guide, "json", request.content
    )

@router.post("/closing-extractor", response_model=AgentResponse)
async def closing_extractor(request: ModelRequest):
    return run_extractor(
        request.id, request.model_id, "closing-extractor", 
        PromptHub().closing_agent, 
        Guide, "json", request.content
    )

@router.post("/objection-extractor", response_model=AgentResponse)
async def objection_extractor(request: ModelRequest):
    return run_extractor(
        request.id, request.model_id, "objection-extractor", 
        PromptHub().objection_handling_agent, 
        Guide, "json", request.content
    )

@router.get("/status")
async def get_status():
    return {"status": "Sales Coach is operational"}