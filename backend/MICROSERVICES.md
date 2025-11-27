# Microservices Architecture for Leonidas-Hermes

## Overview
This document outlines the proposed microservices architecture to improve development speed and system modularity by separating concerns into three distinct services.

## Current Problem
- Monolithic backend with heavy dependencies (transcription + LLM processing)
- Slow Docker container startup and rebuild times during development
- Tight coupling between transcription, AI agents, and business logic

## Proposed Solution: 3-Service Architecture

### 1. Main Orchestrator Service (Port 8000)
**Responsibility:** WebSocket management, business logic, state management

**Features:**
- WebSocket connection with frontend
- Session context and memory management
- Database operations
- Service orchestration and flow control
- Stage management and decision engine

**Key Components:**
```python
# WebSocket handler that orchestrates other services
async def websocket_handler(websocket):
    while True:
        audio_bytes = await websocket.receive_bytes()
        
        # Call transcription service
        transcription = await call_transcription_service(audio_bytes)
        
        # Update context/memory
        context.add_transcription(transcription)
        
        # Conditionally call agents based on business logic
        if should_extract_info(context):
            info = await call_agents_service("extract/information", context.get_recent_text())
        
        # Send results to frontend
        await websocket.send_json(results)
```

### 2. Transcription Engine Service (Port 8001)
**Responsibility:** Pure audio-to-text processing

**Features:**
- Stateless REST API
- Audio file processing (ol2t integration)
- Temporary file management
- Fast audio transcription

**API Endpoints:**
```python
@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    
    # Convert and process audio
    audio_segment = AudioSegment.from_file(BytesIO(audio_bytes))
    result = ol2t.run(audio_segment)
    
    return {"transcription": result, "timestamp": timestamp}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

### 3. Agents Service (Port 8002)
**Responsibility:** LLM processing and AI agent operations

**Features:**
- Stateless REST API
- Bedrock LLM integration
- Multiple agent endpoints
- Pure text processing

**API Endpoints:**
```python
@app.post("/extract/information")
async def extract_information(request: dict):
    result = await information_agent.process_async(request["text"])
    return {"extracted_info": result}

@app.post("/extract/interest")
async def extract_interest(request: dict):
    result = await interest_agent.process_async(request["text"])
    return {"customer_interest": result}

@app.post("/detect/objection")
async def detect_objection(request: dict):
    result = await objection_agent.process_async(request["text"])
    return {"objection_detected": result}

@app.post("/generate/guide")
async def generate_guide(request: dict):
    result = await guide_agent.process_async(request["stage"], request["context"])
    return {"guide": result}
```

## Data Flow

```
Frontend (Audio) 
    ↓ WebSocket
Main Orchestrator 
    ↓ HTTP POST /transcribe
Transcription Engine 
    ↓ Return transcription
Main Orchestrator 
    ↓ HTTP POST /extract/* (conditional)
Agents Service 
    ↓ Return AI results
Main Orchestrator 
    ↓ WebSocket response
Frontend (Results)
```

## Service Communication

### Main → Transcription
```python
async with httpx.AsyncClient() as client:
    files = {"audio": ("audio.wav", audio_bytes, "audio/wav")}
    response = await client.post("http://transcription:8001/transcribe", files=files)
    return response.json()["transcription"]
```

### Main → Agents
```python
async with httpx.AsyncClient() as client:
    payload = {"text": transcription, "context": context_data}
    response = await client.post("http://agents:8002/extract/information", json=payload)
    return response.json()["extracted_info"]
```

## Conditional Agent Triggers

The main orchestrator calls agents based on business logic conditions:

- **Text Length**: Trigger extraction after 5+ sentences
- **Time Intervals**: Process every 10 seconds
- **Stage Changes**: Generate new guides when stage changes
- **Keyword Detection**: Detect objections on specific phrases
- **Manual Triggers**: Frontend-initiated processing

## Development Setup

### Docker Compose
```yaml
version: '3.8'
services:
  main:
    build: ./main-orchestrator
    ports: ["8000:8000"]
    environment:
      - TRANSCRIPTION_URL=http://transcription:8001
      - AGENTS_URL=http://agents:8002
    depends_on: [transcription, agents]
  
  transcription:
    build: ./transcription-engine
    ports: ["8001:8001"]
    
  agents:
    build: ./agents-service
    ports: ["8002:8002"]
    environment:
      - AWS_REGION=us-east-1
```

### Local Development
```bash
# Terminal 1 - Transcription Engine
cd transcription-engine
uvicorn main:app --reload --port 8001

# Terminal 2 - Agents Service  
cd agents-service
uvicorn main:app --reload --port 8002

# Terminal 3 - Main Orchestrator
cd main-orchestrator
uvicorn main:app --reload --port 8000
```

## Benefits

### Development Phase
- **Fast Iteration**: Change one service without rebuilding others
- **Parallel Development**: Team can work on different services simultaneously
- **Simple Debugging**: Isolate issues to specific services
- **Quick Testing**: Easy to mock services for testing
- **Lightweight Containers**: Each service has minimal dependencies

### Production Ready
- **Scalability**: Scale transcription and agents independently
- **Reliability**: Service isolation prevents cascading failures
- **Maintainability**: Clear separation of concerns
- **Monitoring**: Individual service health and performance tracking

## Migration Strategy

### Phase 1: Extract Transcription Service
1. Create transcription-engine service with existing ol2t logic
2. Modify main service to call transcription API
3. Test WebSocket flow with external transcription

### Phase 2: Extract Agents Service
1. Create agents-service with existing LLM logic
2. Modify main service to call agents API conditionally
3. Test full flow with all three services

### Phase 3: Optimization
1. Add retry logic and error handling
2. Implement service health checks
3. Add monitoring and logging
4. Performance optimization

## Production Considerations (Future)

- **Service Discovery**: Consul, etcd, or Kubernetes DNS
- **Load Balancing**: Multiple instances of each service
- **Circuit Breakers**: Prevent cascading failures
- **Monitoring**: Prometheus, Grafana, distributed tracing
- **Security**: Service-to-service authentication
- **Data Consistency**: Event sourcing or saga patterns

## File Structure
```
backend/
├── main-orchestrator/
│   ├── main.py
│   ├── context.py
│   └── requirements.txt
├── transcription-engine/
│   ├── main.py
│   ├── transcription.py
│   └── requirements.txt
├── agents-service/
│   ├── main.py
│   ├── agents/
│   └── requirements.txt
└── docker-compose.yml
```

## Proposed Project Structure

```
leonidas-hermes/
├── frontend/                    # React/Next.js (unchanged)
│   ├── app/
│   │   ├── debug/
│   │   └── page.tsx
│   ├── components/
│   │   ├── StageGuidePanel.tsx
│   │   ├── WebSocketAudioRecorder.tsx
│   │   └── ...
│   ├── package.json
│   └── next.config.js
│
├── backend/
│   ├── main-orchestrator/       # Main WebSocket service (Port 8000)
│   │   ├── main.py             # WebSocket handler + orchestration logic
│   │   ├── context.py          # Session context and state management
│   │   ├── memory/             # Voice memory dependency (moved here)
│   │   │   ├── __init__.py
│   │   │   └── voice_memory.py
│   │   ├── database/           # Database operations and models
│   │   │   ├── __init__.py
│   │   │   └── operations.py
│   │   ├── models/             # Data models and schemas
│   │   │   ├── __init__.py
│   │   │   └── websocket_models.py
│   │   ├── services/           # HTTP client services
│   │   │   ├── __init__.py
│   │   │   ├── transcription_client.py
│   │   │   └── agents_client.py
│   │   ├── pyproject.toml      # Dependencies including memory/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── transcription-engine/    # Audio processing service (Port 8001)
│   │   ├── main.py             # FastAPI REST endpoints
│   │   ├── transcription/      # Core transcription logic
│   │   │   ├── __init__.py
│   │   │   ├── processor.py    # ol2t integration (from websocket_tasks)
│   │   │   └── audio_utils.py  # Audio conversion utilities
│   │   ├── models/             # Request/response models
│   │   │   ├── __init__.py
│   │   │   └── transcription_models.py
│   │   ├── pyproject.toml      # Minimal dependencies (pydub, ol2t)
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── agents-service/          # LLM processing service (Port 8002)
│   │   ├── main.py             # FastAPI REST endpoints
│   │   ├── agents/             # Individual agent implementations
│   │   │   ├── __init__.py
│   │   │   ├── base_agent.py   # Base agent class
│   │   │   ├── information_agent.py
│   │   │   ├── interest_agent.py
│   │   │   ├── objection_agent.py
│   │   │   ├── checklist_agent.py
│   │   │   └── guide_agent.py
│   │   ├── models/             # Request/response models
│   │   │   ├── __init__.py
│   │   │   └── agent_models.py
│   │   ├── llm/                # LLM integration
│   │   │   ├── __init__.py
│   │   │   └── bedrock_client.py
│   │   ├── pyproject.toml      # AWS Bedrock dependencies
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── shared/                  # Optional shared utilities
│   │   ├── __init__.py
│   │   ├── models.py           # Common data models
│   │   └── utils.py            # Shared utility functions
│   │
│   ├── docker-compose.yml       # Multi-service orchestration
│   ├── docker-compose.dev.yml  # Development overrides
│   └── MICROSERVICES.md        # This documentation
│
└── README.md                    # Project overview
```

## Service Dependencies

### Main Orchestrator Dependencies
- WebSocket handling (FastAPI, uvicorn)
- HTTP client (httpx)
- Database operations (existing DB libraries)
- Memory management (local memory/ package)
- Session context management

### Transcription Engine Dependencies
- Audio processing (pydub, AudioSegment)
- Transcription engine (ol2t)
- File I/O operations
- Minimal FastAPI setup

### Agents Service Dependencies
- AWS Bedrock SDK
- LLM processing libraries
- Minimal FastAPI setup
- No WebSocket or queue dependencies

## Migration Notes

### From Current Structure
1. **WebSocket Tasks → Services**: Move `websocket_tasks/transcription_task.py` logic to `transcription-engine/`
2. **Agent Logic**: Extract LLM processing from current agents to `agents-service/`
3. **Memory Dependency**: Move `memory/` into `main-orchestrator/` since only it needs state management
4. **Shared Models**: Create common models in `shared/` if needed across services

### Dependency Management
- Each service has its own `pyproject.toml` with minimal dependencies
- No cross-service Python imports (communication via HTTP only)
- Memory package becomes internal to main-orchestrator
- Shared utilities in `shared/` package if needed

## Implementation Steps

### Phase 1: Setup Service Structure
1. Create the three service directories with basic FastAPI setup
2. Move `memory/` dependency into `main-orchestrator/`
3. Set up individual `pyproject.toml` files for each service
4. Create basic Docker setup for each service

### Phase 2: Extract Transcription Service
1. Move transcription logic from `websocket_tasks/transcription_task.py` to `transcription-engine/`
2. Create REST endpoints for audio processing
3. Test transcription service independently
4. Update main orchestrator to call transcription API

### Phase 3: Extract Agents Service
1. Move LLM agent logic to `agents-service/`
2. Simplify agents to pure REST endpoints (no WebSocket workers)
3. Create individual agent endpoints
4. Update main orchestrator to call agents API conditionally

### Phase 4: Integration & Testing
1. Test complete flow with all three services
2. Add basic error handling and retry logic
3. Optimize service communication
4. Update frontend if needed

### Phase 5: Development Optimization
1. Set up development docker-compose with hot reload
2. Add service health checks
3. Implement proper logging across services
4. Document API endpoints for each service