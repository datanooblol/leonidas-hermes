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

## WebSocket Message Protocol

### Connection

- **Endpoint**: `ws://localhost:8000/ws`
- **Protocol**: JSON messages over WebSocket
- **Data Types**: Text (JSON) and Binary (Audio)

### Frontend → Backend Messages

#### Audio Data

```typescript
// Binary audio chunks sent directly as WebSocket bytes
websocket.send(audioBlob); // ArrayBuffer/Blob
```

#### Manual Updates

```typescript
// Customer information update
{
  "type": "manual_information_update",
  "data": {
    "age": 35,
    "income_per_month": 50000,
    "marital_status": "Married",
    "number_of_children": 2
  }
}

// Customer interest update
{
  "type": "manual_interest_update",
  "data": {
    "life_insurance": true,
    "health_insurance": false,
    "retirement_planning": true
  }
}

// Manual stage change
{
  "type": "guide",
  "data": {
    "stage_name": "pitch" // "greeting" | "discovery" | "pitch" | "closing"
  }
}

// Resolve objection manually
{
  "type": "manual_resolve_objection",
  "data": {
    "resolved": true
  }
}
```

### Backend → Frontend Messages

#### Real-time Transcription

```typescript
{
  "type": "transcription",
  "timestamp": "1703123456789",
  "transcription": "Hello, I'm interested in life insurance",
  "status": "success"
}
```

#### AI Extracted Data

```typescript
// Customer information extracted from conversation
{
  "type": "information",
  "customer_information": {
    "age": 35,
    "income_per_month": 50000,
    "marital_status": "Married",
    "number_of_children": 2
  }
}

// Customer interests detected
{
  "type": "interest",
  "customer_interest": {
    "life_insurance": true,
    "health_insurance": false,
    "critical_illness": true,
    "accident_insurance": false,
    "retirement_planning": true,
    "tax_benefits": false
  }
}

// Agent checklist completion
{
  "type": "checklist",
  "agent_checklist": {
    "agent_introduced": true,
    "company_mentioned": true,
    "permission_asked": false
  }
}
```

#### Stage Management

```typescript
// AI-generated stage guidance
{
  "type": "guide",
  "stage_name": "discovery",
  "guide": {
    "action": "Ask about family protection needs",
    "explanation": "Customer has children, focus on family security",
    "lines_to_say": [
      "Tell me about your family's financial security needs",
      "What would happen to your family if something happened to you?"
    ],
    "signals": ["has_children", "married", "income_stable"]
  },
  "message": "Stage set to discovery" // Optional confirmation message
}

// Automatic stage transitions
{
  "type": "stage_change",
  "stage": "discovery",
  "reason": "checklist_complete"
}
```

#### Objection Handling

```typescript
// Objection detected
{
  "type": "objection",
  "guide": {
    "action": "Address price concerns with value proposition",
    "explanation": "Customer is concerned about premium costs",
    "lines_to_say": [
      "I understand cost is important to you",
      "Let me show you the value you're getting"
    ],
    "signals": ["price_concern", "budget_mention"]
  },
  "previous_stage": "pitch"
}

// Objection resolved
{
  "type": "objection_resolved"
}
```

#### Product Recommendations

```typescript
{
  "type": "products",
  "products": [
    {
      "product_id": "LIFE001",
      "product_name": "Family Protection Plan",
      "objective": "Life Insurance with Family Benefits",
      "premium_min_month_thb": 2500,
      "premium_max_month_thb": 5000,
      "age_min": 18,
      "age_max": 65,
      "notes": "Ideal for families with children"
    }
  ]
}
```

### Message Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   WebSocket     │    │   TaskManager   │
│                 │    │   Handler       │    │   Queues        │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ Audio Recording │───▶│ Binary Data     │───▶│ audio_queue     │
│ Manual Updates  │───▶│ JSON Commands   │───▶│ command_queue   │
│ Stage Changes   │───▶│ Text Messages   │───▶│ command_queue   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       │
         │                       │                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Real-time UI    │◀───│ WebSocket       │◀───│ Component       │
│ Updates         │    │ Responses       │    │ Processing      │
│                 │    │                 │    │                 │
│ • Transcription │    │ • JSON Messages │    │ • Transcription │
│ • Information   │    │ • Typed Data    │    │ • Extraction    │
│ • Guidance      │    │ • Real-time     │    │ • Stage Logic   │
│ • Products      │    │ • Structured    │    │ • Products      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Error Handling

- All backend components include try-catch with logging
- WebSocket disconnections are handled gracefully
- Failed LLM calls don't block other components
- Frontend validates WebSocket connection state before sending

### Message Types Reference

```typescript
type MessageType =
  | "transcription" // Audio → Text conversion
  | "information" // Customer demographic data
  | "interest" // Customer product interests
  | "checklist" // Agent task completion
  | "guide" // Stage-specific AI guidance
  | "products" // Filtered product recommendations
  | "stage_change" // Automatic stage transitions
  | "objection" // Objection detection & guidance
  | "objection_resolved" // Objection resolution confirmation
  | "manual_information_update" // Frontend → Backend info updates
  | "manual_interest_update" // Frontend → Backend interest updates
  | "manual_resolve_objection"; // Frontend → Backend objection resolution
```

This architecture enables **scalable, maintainable, and business-adaptable** real-time AI conversation systems.
