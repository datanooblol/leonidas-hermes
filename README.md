# Leonidas Hermes

Real-time AI-powered conversation assistant with transcription, extraction, and decision engine capabilities.

## Architecture Overview

### Backend - Component-Based Microservices
The backend uses a **component-based architecture** with independent, swappable services:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Transcription  │    │   Extraction    │    │     Stage       │
│   Component     │───▶│   Component     │───▶│   Component     │
│                 │    │                 │    │                 │
│ • Audio → Text  │    │ • Info Extract  │    │ • Flow Control  │
│ • Real-time     │    │ • Interest      │    │ • Objections    │
│ • WebSocket     │    │ • Checklist     │    │ • Guides        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Product      │    │    Command      │    │   TaskManager   │
│   Component     │    │   Component     │    │   (Orchestrator) │
│                 │    │                 │    │                 │
│ • Filtering     │    │ • Manual Updates│    │ • Queue Mgmt    │
│ • Recommendations│   │ • Frontend Cmds │    │ • Event System  │
│ • Dynamic       │    │ • User Actions  │    │ • Task Lifecycle│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### Core Components:

- **TranscriptionTask**: Converts audio streams to text in real-time
- **ExtractionTask**: Uses LLMs to extract customer information, interests, and agent checklists
- **StageTask**: Manages conversation flow, detects objections, provides stage-specific guidance
- **ProductTask**: Filters and recommends products based on customer profile
- **CommandTask**: Handles manual updates and user commands from frontend
- **TaskManager**: Orchestrates all components with queues and events

#### Communication Pattern:
```
Audio → audio_queue → TranscriptionTask → message_queue → ExtractionTask
                                                      ↓
Frontend ← WebSocket ← ProductTask ← product_event ← Context Updates
                                                      ↓
Frontend ← WebSocket ← StageTask ← transition_event ← Stage Changes
```

### Frontend - React Real-time Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                    Debug Dashboard                          │
├─────────────────────┬───────────────────────────────────────┤
│  Customer Info      │         Stage Guide                   │
│  & Interest Panel   │         Panel                         │
│                     │                                       │
│ • Manual Updates    │ • Stage Selection                     │
│ • Real-time Sync    │ • AI Guidance                         │
│ • Form Controls     │ • Objection Handling                 │
├─────────────────────┴───────────────────────────────────────┤
│                Product Recommendations                      │
│                                                             │
│ • Dynamic Filtering  • Real-time Updates                   │
└─────────────────────────────────────────────────────────────┘
│                    Audio Recording                          │
│                  (Floating Button)                         │
└─────────────────────────────────────────────────────────────┘
```

## Message Flow

### Real-time Data Flow:
1. **Audio** → Backend transcription → `transcription` messages
2. **Transcription** → LLM extraction → `information`/`interest`/`checklist` messages  
3. **Context Changes** → Product filtering → `products` messages
4. **Stage Detection** → Guide generation → `guide` messages
5. **Objection Detection** → Alert system → `objection` messages

### User Interaction Flow:
1. **Manual Updates** → `manual_information_update`/`manual_interest_update`
2. **Stage Changes** → `guide` commands
3. **Objection Resolution** → `manual_resolve_objection`

## Key Features

### 🎯 **Real-time Processing**
- Fire-and-forget async pattern for low latency
- Concurrent LLM processing (information, interest, checklist)
- Event-driven architecture for instant updates

### 🔄 **Component Swappability**
- Each component is independent and replaceable
- Business-specific customization per component
- Clean separation of concerns

### 🧠 **AI-Powered Intelligence**
- Multi-LLM extraction pipeline
- Objection detection with cooldown system
- Stage-aware conversation guidance
- Dynamic product recommendations

### 🎛️ **Manual Override**
- Frontend can manually update any data
- Real-time sync between manual and AI updates
- User-controlled objection resolution

## Quick Start

### Backend
```bash
# Start all services
docker-compose up

# Stop all services  
docker-compose down
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Access Points
- **Backend API**: http://localhost:8000
- **WebSocket**: ws://localhost:8000/ws
- **Frontend Dashboard**: http://localhost:3000/debug
- **Health Check**: http://localhost:8000/health

## Technology Stack

### Backend
- **FastAPI** - WebSocket server
- **AsyncIO** - Concurrent processing
- **Pandas** - Data filtering
- **DuckDB** - Session storage
- **AWS Bedrock** - LLM integration

### Frontend  
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **WebSocket API** - Real-time communication

## Development

### Adding New Components
1. Create new task class in `services/orchestration/app/program/websocket_tasks/`
2. Add to TaskManager in `main.py`
3. Define message types in frontend interface
4. Update frontend handlers

### Message Types
```typescript
type MessageType = 
  | "transcription"     // Audio → Text
  | "information"      // Customer data
  | "interest"         // Customer interests  
  | "guide"            // Stage guidance
  | "products"         // Recommendations
  | "objection"        // Objection detected
  | "stage_change"     // Flow transitions
  | "objection_resolved" // Resolution complete
```

This architecture enables **scalable, maintainable, and business-adaptable** real-time AI conversation systems.
