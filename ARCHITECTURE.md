# 🏗️ Complete System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                 │
│                         http://localhost:3000/dashboard                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │  Simulation     │  │   Customer      │  │  Journey Guide  │            │
│  │   Sidebar       │  │   Sidebar       │  │     Panel       │            │
│  │                 │  │                 │  │                 │            │
│  │ • Send text     │  │ • Age/Income    │  │ • AI Guidance   │            │
│  │ • Simulate      │  │ • Interests     │  │ • Stage Select  │            │
│  │   customer      │  │ • Manual edit   │  │ • Suggestions   │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                    Product Sidebar                          │           │
│  │  • Filtered products based on customer data                 │           │
│  │  • Real-time updates                                        │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↕
                          WebSocket Connection
                        ws://localhost:8000/ws
                                    ↕
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND SERVER                                    │
│                      http://localhost:8000                                  │
│                    prototype-mindai/main_clean.py                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WebSocket Endpoint: /ws                                                   │
│  ├─ Accept connection                                                      │
│  ├─ Send initial greeting guide                                            │
│  └─ Listen for messages                                                    │
│                                                                             │
│  Message Router:                                                           │
│  ├─ "guide" ──────────────────────┐                                        │
│  ├─ "manual_information_update" ──┤                                        │
│  ├─ "manual_interest_update" ─────┤                                        │
│  ├─ "manual_stage_update" ────────┤                                        │
│  └─ "manual_resolve_objection" ───┤                                        │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                    Message Handlers                         │           │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │                                                             │           │
│  │  guide_stage()                                              │           │
│  │  ├─ Extract customer data (async)                           │           │
│  │  ├─ Generate AI strategy (async)                            │           │
│  │  ├─ Detect objections (async)                               │           │
│  │  └─ Check agent checklist (async)                           │           │
│  │                                                             │           │
│  │  handle_manual_information_update()                         │           │
│  │  ├─ Update conversation memory                              │           │
│  │  ├─ Send updated information                                │           │
│  │  └─ Filter and send products                                │           │
│  │                                                             │           │
│  │  handle_manual_interest_update()                            │           │
│  │  ├─ Update conversation memory                              │           │
│  │  ├─ Send updated interests                                  │           │
│  │  └─ Filter and send products                                │           │
│  │                                                             │           │
│  │  handle_manual_stage_update()                               │           │
│  │  ├─ Update stage in memory                                  │           │
│  │  └─ Send stage change confirmation                          │           │
│  │                                                             │           │
│  │  handle_manual_objection_resolution()                       │           │
│  │  └─ Send objection resolved                                 │           │
│  │                                                             │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                  Business Logic Layer                       │           │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │                                                             │           │
│  │  extraction.py                                              │           │
│  │  ├─ extract_customer_data()                                 │           │
│  │  │  ├─ extract_information() → LLM                          │           │
│  │  │  ├─ extract_interest() → LLM                             │           │
│  │  │  └─ filter_and_send_products()                           │           │
│  │  │                                                           │           │
│  │  ├─ generate_strategy()                                     │           │
│  │  │  ├─ suggest_discovery() → LLM                            │           │
│  │  │  ├─ suggest_pitching() → LLM                             │           │
│  │  │  ├─ suggest_closing() → LLM                              │           │
│  │  │  └─ suggest_objection() → LLM                            │           │
│  │  │                                                           │           │
│  │  ├─ handle_objection()                                      │           │
│  │  │  └─ suggest_objection() → LLM                            │           │
│  │  │                                                           │           │
│  │  └─ extract_agent_checklist_flow()                          │           │
│  │     ├─ extract_agent_checklist() → LLM                      │           │
│  │     └─ Auto stage transition if complete                    │           │
│  │                                                             │           │
│  │  product_filter.py                                          │           │
│  │  ├─ get_customer_filters()                                  │           │
│  │  ├─ product_filter_by_params()                              │           │
│  │  └─ filter_and_send_products()                              │           │
│  │                                                             │           │
│  │  memory.py                                                  │           │
│  │  └─ conversation_memory (Global State)                      │           │
│  │     ├─ customer_information                                 │           │
│  │     ├─ customer_interest                                    │           │
│  │     ├─ agent_checklist                                      │           │
│  │     ├─ current_stage                                        │           │
│  │     └─ product_list                                         │           │
│  │                                                             │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                    External Services                        │           │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │                                                             │           │
│  │  AWS Bedrock (LLM)                                          │           │
│  │  └─ Model: us.amazon.nova-micro-v1:0                        │           │
│  │                                                             │           │
│  │  Product Database                                           │           │
│  │  └─ mock_life_insurance_products.csv                        │           │
│  │                                                             │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Customer Info Update

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: User changes age to 35                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ CustomerSidebar.tsx                                             │
│ • User edits input field                                        │
│ • onChange triggers setCustomer()                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ DashboardPage.tsx                                               │
│ • handleCustomerUpdate() called                                 │
│ • Updates localCustomer state                                   │
│ • Checks if WebSocket connected                                 │
│ • Calls wsState.sendMessage()                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ useWebSocket.ts                                                 │
│ • sendMessage() called                                          │
│ • JSON.stringify message                                        │
│ • ws.current.send()                                             │
│ • Console: "📝 Sent customer info update: {age: 35}"           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    WebSocket Message
        {type: "manual_information_update", data: {age: 35}}
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND: main_clean.py                                          │
│ • websocket.receive() gets message                              │
│ • Parse JSON                                                    │
│ • command_type = "manual_information_update"                    │
│ • Route to handler                                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ handle_manual_information_update()                              │
│ • conversation_memory.update_customer_information(data)         │
│ • is_updated = True                                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ memory.py                                                       │
│ • Update customer_information dict                              │
│ • customer_information['age'] = 35                              │
│ • Return True (changed)                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ handle_manual_information_update() (continued)                  │
│ • Send information message                                      │
│ • Call filter_and_send_products()                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ product_filter.py                                               │
│ • get_customer_filters() → {age: 35}                            │
│ • product_filter_by_params(products_df, age=35)                 │
│ • Filter: age_min <= 35 <= age_max                              │
│ • Return filtered products                                      │
│ • Send products message                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    WebSocket Messages
        {type: "information", customer_information: {age: 35}}
        {type: "products", products: [...]}
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: useWebSocket.ts                                       │
│ • ws.current.onmessage triggered                                │
│ • Parse JSON                                                    │
│ • Console: "📨 Received message: information"                  │
│ • setCustomerInfo(data.customer_information)                    │
│ • Console: "✅ Customer info updated"                          │
│ • Console: "📨 Received message: products"                     │
│ • setProducts(data.products)                                    │
│ • Console: "🛍️ Products received: 5"                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ DashboardPage.tsx                                               │
│ • useEffect detects wsState.customerInfo change                 │
│ • Sync to localCustomer state                                   │
│ • UI re-renders with new data                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ UI Updates                                                      │
│ • CustomerSidebar shows age: 35                                 │
│ • ProductSidebar shows 5 filtered products                      │
│ • All components in sync                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Stage Change with AI

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: User clicks "Discover" stage button                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ JourneyGuide.tsx                                                │
│ • onStageChange('Discover') called                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ useWebSocket.ts                                                 │
│ • handleStageChange('Discover')                                 │
│ • Map 'Discover' → 'discovery'                                  │
│ • sendMessage({type: "guide", data: {stage_name: "discovery"}}) │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    WebSocket Message
        {type: "guide", data: {stage_name: "discovery", content: ""}}
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND: main_clean.py                                          │
│ • Route to guide_stage()                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ guide_stage()                                                   │
│ • stage_name = "discovery"                                      │
│ • content = ""                                                  │
│ • model_id = "us.amazon.nova-micro-v1:0"                        │
│                                                                 │
│ • Spawn 4 async tasks:                                          │
│   1. asyncio.create_task(extract_customer_data(...))            │
│   2. asyncio.create_task(generate_strategy(...))                │
│   3. asyncio.create_task(handle_objection(...))                 │
│   4. asyncio.create_task(extract_agent_checklist_flow(...))     │
│                                                                 │
│ • Send immediate response:                                      │
│   {type: "guide", stage_name: "discovery", status: "processing"}│
└─────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                   ↓                   ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Task 1:       │  │ Task 2:       │  │ Task 3:       │
│ Extract Data  │  │ AI Strategy   │  │ Objection     │
│               │  │               │  │ Detection     │
│ • LLM extract │  │ • LLM suggest │  │ • LLM detect  │
│   info        │  │   discovery   │  │   objection   │
│ • LLM extract │  │ • Generate    │  │ • Send if     │
│   interest    │  │   guide       │  │   detected    │
│ • Filter      │  │ • Send guide  │  │               │
│   products    │  │   message     │  │               │
│               │  │               │  │               │
│ Sends:        │  │ Sends:        │  │ Sends:        │
│ • information │  │ • guide       │  │ • objection   │
│ • interest    │  │               │  │   (if found)  │
│ • products    │  │               │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
        ↓                   ↓                   ↓
        └───────────────────┴───────────────────┘
                            ↓
                    Multiple WebSocket Messages
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: useWebSocket.ts                                       │
│ • Receives multiple messages in sequence                        │
│ • Console: "📨 Received message: guide (processing)"           │
│ • Console: "⏳ Backend processing..."                          │
│ • Console: "📨 Received message: information"                  │
│ • Console: "📨 Received message: interest"                     │
│ • Console: "📨 Received message: guide"                        │
│ • Console: "📋 Guide received"                                 │
│ • Console: "📨 Received message: products"                     │
│ • Updates all state variables                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ UI Updates                                                      │
│ • JourneyGuide shows AI strategy                                │
│ • Suggested lines appear                                        │
│ • Tags/signals display                                          │
│ • Products filter                                               │
│ • Stage indicator updates                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App
└── DashboardPage
    ├── DashboardTemplate
    │   ├── Navbar
    │   │   └── Connection Status Indicator
    │   │
    │   ├── SimulationSidebar (left)
    │   │   └── Send simulated customer responses
    │   │
    │   ├── CustomerSidebar (left)
    │   │   ├── Customer Info Section
    │   │   │   ├── CompactField (Age)
    │   │   │   ├── CompactField (Income)
    │   │   │   ├── CompactField (Status)
    │   │   │   └── CompactField (Children)
    │   │   │
    │   │   └── Interests Section
    │   │       └── InterestToggle × 8
    │   │
    │   ├── JourneyGuide (center)
    │   │   ├── Progress Bar
    │   │   ├── Stage Buttons
    │   │   ├── Current Action Banner
    │   │   ├── Suggested Lines
    │   │   └── Guidance Panel
    │   │
    │   ├── ProductSidebar (right)
    │   │   ├── Search Box
    │   │   └── ProductCardItem × N
    │   │
    │   └── Floating Actions
    │       └── Mic Button (Connect/Record)
    │
    └── Modals
        ├── WarningModal (Objection)
        ├── ProductModal
        ├── TranscriptModal
        └── LogoutModal
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend State                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  useWebSocket Hook (Global WebSocket State)                    │
│  ├─ connectionState                                             │
│  ├─ isConnected                                                 │
│  ├─ currentStage                                                │
│  ├─ isRecording                                                 │
│  ├─ customerInfo ←──────────────┐                               │
│  ├─ interests ←─────────────────┤                               │
│  ├─ products ←──────────────────┤                               │
│  ├─ guide ←─────────────────────┤                               │
│  ├─ warningData ←───────────────┤                               │
│  └─ transcription               │                               │
│                                 │                               │
│  DashboardPage (Local UI State) │                               │
│  ├─ localCustomer ──────────────┘                               │
│  ├─ localInterests                                              │
│  ├─ selectedProduct                                             │
│  ├─ showTranscript                                              │
│  └─ showLogoutConfirm                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↕
                    WebSocket Sync
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                      Backend State                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  conversation_memory (Global Memory)                            │
│  ├─ customer_information                                        │
│  │  ├─ age                                                      │
│  │  ├─ income_per_month                                         │
│  │  ├─ marital_status                                           │
│  │  └─ number_of_children                                       │
│  │                                                              │
│  ├─ customer_interest                                           │
│  │  ├─ life_insurance                                           │
│  │  ├─ health_insurance                                         │
│  │  ├─ critical_illness                                         │
│  │  ├─ retirement_planning                                      │
│  │  ├─ accident_insurance                                       │
│  │  └─ tax_benefits                                             │
│  │                                                              │
│  ├─ agent_checklist                                             │
│  │  ├─ agent_introduced                                         │
│  │  ├─ company_mentioned                                        │
│  │  └─ permission_asked                                         │
│  │                                                              │
│  ├─ current_stage                                               │
│  ├─ previous_stage                                              │
│  └─ product_list                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
```
Next.js 14
├── React 18
├── TypeScript
├── Tailwind CSS
├── WebSocket API
└── Hooks
    ├── useWebSocket (Connection & State)
    ├── useAudioRecorder (Audio handling)
    └── useThemeManager (Dark/Light mode)
```

### Backend
```
FastAPI
├── Python 3.8+
├── Uvicorn (ASGI server)
├── WebSocket support
├── Pydantic (Data validation)
├── Pandas (Data filtering)
├── AsyncIO (Concurrent processing)
└── AWS Bedrock (LLM integration)
```

---

## File Structure

```
leonidas-hermes/
├── frontend_max/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── src/
│   │   │   └── components/
│   │   │       ├── atoms/
│   │   │       ├── molecules/
│   │   │       ├── organisms/
│   │   │       │   ├── CustomerSidebar.tsx
│   │   │       │   ├── JourneyGuide.tsx
│   │   │       │   ├── ProductSidebar.tsx
│   │   │       │   └── WarningModal.tsx
│   │   │       ├── pages/
│   │   │       │   └── DashboardPage.tsx
│   │   │       └── templates/
│   │   │           └── DashboardTemplate.tsx
│   │   └── layout.tsx
│   ├── hooks/
│   │   └── useWebSocket.ts ← MODIFIED
│   ├── types/
│   │   └── index.ts
│   └── package.json
│
├── prototype-mindai/
│   ├── package/
│   │   ├── datamodel/
│   │   │   ├── websocket.py
│   │   │   └── schemas.py
│   │   ├── program/
│   │   │   ├── extraction.py
│   │   │   ├── product_filter.py
│   │   │   └── memory.py
│   │   └── prompt_hub/
│   ├── dataset/
│   │   └── mock_life_insurance_products.csv
│   └── main_clean.py ← BACKEND ENTRY POINT
│
├── FRONTEND_BACKEND_CONNECTION_PLAN.md ← NEW
├── QUICK_START_GUIDE.md ← NEW
├── CONNECTION_STATUS.md ← NEW
├── SUMMARY.md ← NEW
└── ARCHITECTURE.md ← THIS FILE
```

---

## 🎉 System Ready!

Your complete system is now connected and documented. Start both servers and enjoy your AI-powered telesales assistant!
