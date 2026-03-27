# Frontend-Backend Connection Status Analysis

## 📊 Overview

The `frontend_max` application is currently **NOT CONNECTED** to the backend. It operates in **SIMULATION MODE** using mock data.

---

## ❌ Components NOT Connected to Backend

### 1. **Main Dashboard (DashboardPage.tsx)**
**Status:** ❌ Using Mock Data Only

**Current Implementation:**
```typescript
// Uses local state management
const [customer, setCustomer] = useState<CustomerInfo>({ ... });
const [interests, setInterests] = useState<Record<string, boolean>>({ ... });

// Uses mock products from local file
import { MOCK_PRODUCTS } from "@/data/mock";
const filteredProducts = MOCK_PRODUCTS.filter((p) => interests[p.category]);
```

**What's Missing:**
- No WebSocket connection initialization
- No real-time data sync with backend
- Customer info is manually entered or extracted from mock responses
- Products are filtered locally, not fetched from backend

---

### 2. **AI Simulation (useTeleSaleSimulation.ts)**
**Status:** ❌ Using Mock JSON Responses

**Current Implementation:**
```typescript
// Simulates AI responses from local JSON file
import mockAiResponses from '@/data/mockAiResponses.json';

const simulateCustomerResponse = (text: string, stageId: string) => {
  setTimeout(() => {
    const response = (mockAiResponses as any)[text];
    // Process mock response...
  }, 1500);
};
```

**What's Missing:**
- No actual LLM/AI API calls
- No real extraction of customer information
- No real objection detection
- All responses are pre-scripted in `mockAiResponses.json`

---

### 3. **Audio Recording (Mic Button)**
**Status:** ❌ Not Functional

**Current Implementation:**
```typescript
// In DashboardPage.tsx
handleMicClick: simulationState.toggleRecording

// In useTeleSaleSimulation.ts
const toggleRecording = () => setIsRecording(!isRecording);
// Only toggles UI state, doesn't actually record or send audio
```

**What's Missing:**
- No audio capture
- No audio streaming to backend
- No transcription service integration
- The mic button only changes visual state (red pulse animation)

---

### 4. **Product Recommendations**
**Status:** ❌ Using Static Mock Data

**Current Implementation:**
```typescript
// data/mock.ts
export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Life Protect 99/20', category: 'Life Insurance', ... },
  { id: '2', name: 'Health Care Gold', category: 'Health Insurance', ... },
  // ... hardcoded products
];

// Filtered locally based on interests
const filteredProducts = MOCK_PRODUCTS.filter((p) => interests[p.category]);
```

**What's Missing:**
- No dynamic product fetching from backend
- No real-time product filtering based on AI analysis
- No product database integration

---

### 5. **Stage Management**
**Status:** ❌ Manual/Mock-Based Only

**Current Implementation:**
```typescript
// Manual stage changes via UI buttons
const handleStageChange = (stage: Stage) => {
  setCurrentStage(stage);
};

// Or automatic from mock responses
if (response.nextStage && response.nextStage !== currentStage) {
  setCurrentStage(response.nextStage as Stage);
}
```

**What's Missing:**
- No AI-driven stage detection from backend
- No real conversation flow analysis
- Stages change only when clicking buttons or from pre-defined mock responses

---

### 6. **Customer Information Extraction**
**Status:** ❌ Mock Extraction Only

**Current Implementation:**
```typescript
// From mockAiResponses.json
{
  "ผมอายุ 35 ปีครับ รายได้ประมาณ 45,000 บาท": {
    "extractedData": {
      "customer": { "age": "35", "income": "45000" }
    }
  }
}

// Applied via callback
if (extractedData?.customer) {
  setCustomer((prev) => ({ ...prev, ...extractedData.customer }));
}
```

**What's Missing:**
- No real NLP/LLM extraction
- Only works for exact text matches in mock JSON
- No fuzzy matching or intelligent parsing

---

### 7. **Objection Detection**
**Status:** ❌ Mock Detection Only

**Current Implementation:**
```typescript
// Triggered by tags in mock responses
if (response.tags.includes("Objection")) {
  setWarningData({
    title: "⚠️ ตรวจพบข้อโต้แย้ง (OBJECTION DETECTED)",
    concern: "...",
    action: response.action,
    // ... from mock data
  });
}
```

**What's Missing:**
- No real-time objection detection from backend
- No sentiment analysis
- Only triggers on pre-defined mock responses with "Objection" tag

---

## ✅ Components PREPARED for Backend (But Not Connected)

### 1. **useWebSocket Hook**
**Status:** ⚠️ Code Exists But Not Used

**Location:** `hooks/useWebSocket.ts`

**What's Ready:**
```typescript
// WebSocket connection setup
ws.current = new WebSocket('ws://localhost:8000/ws');

// Message handlers for backend messages
ws.current.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch(data.type) {
    case 'transcription': setTranscription(data.transcription); break;
    case 'information': setCustomerInfo(data.customer_information); break;
    case 'interest': setInterests(data.customer_interest); break;
    case 'guide': setGuide(data.guide); break;
    case 'products': setProducts(data.products); break;
    case 'objection': setShowWarning(true); break;
  }
};

// Audio recording and streaming
const toggleRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // Convert to WAV and send via WebSocket
  ws.current.send(wavBlob);
};
```

**Why Not Used:**
- `DashboardPage.tsx` uses `useTeleSaleSimulation` instead of `useWebSocket`
- No import or initialization of WebSocket hook in the main app
- Completely separate from current simulation flow

---

## 🔄 How to Connect to Backend

### Step 1: Replace Simulation Hook with WebSocket Hook

**Current (DashboardPage.tsx):**
```typescript
const simulationState = useTeleSaleSimulation(); // ❌ Mock-based
```

**Should Be:**
```typescript
const wsState = useWebSocket(); // ✅ Real backend connection
```

### Step 2: Update Component Props

**Replace:**
```typescript
simulationState={{
  currentStage,
  isRecording,
  aiSuggestion,
  simulateCustomerResponse, // ❌ Mock function
  // ...
}}
```

**With:**
```typescript
wsState={{
  currentStage: wsState.currentStage,
  isRecording: wsState.isRecording,
  aiSuggestion: wsState.guide, // ✅ From backend
  toggleRecording: wsState.toggleRecording, // ✅ Real audio
  // ...
}}
```

### Step 3: Remove Mock Data Dependencies

**Remove:**
```typescript
import { MOCK_PRODUCTS } from "@/data/mock"; // ❌
import mockAiResponses from '@/data/mockAiResponses.json'; // ❌
```

**Use Backend Data:**
```typescript
// Products come from wsState.products (backend)
const filteredProducts = wsState.products;

// Customer info comes from wsState.customerInfo (backend)
const customer = wsState.customerInfo;

// Interests come from wsState.interests (backend)
const interests = wsState.interests;
```

### Step 4: Update Mic Button Handler

**Current:**
```typescript
handleMicClick: simulationState.toggleRecording // ❌ Just UI toggle
```

**Should Be:**
```typescript
handleMicClick: wsState.toggleRecording // ✅ Real audio recording + streaming
```

---

## 📋 Summary Table

| Component | Current Status | Backend Ready? | Action Needed |
|-----------|---------------|----------------|---------------|
| **Audio Recording** | ❌ UI Only | ✅ Yes | Replace hook |
| **Transcription** | ❌ No data | ✅ Yes | Use WebSocket |
| **AI Suggestions** | ❌ Mock JSON | ✅ Yes | Use `guide` from WS |
| **Customer Info** | ❌ Manual/Mock | ✅ Yes | Use `customerInfo` from WS |
| **Interests** | ❌ Manual toggle | ✅ Yes | Use `interests` from WS |
| **Products** | ❌ Static mock | ✅ Yes | Use `products` from WS |
| **Stage Detection** | ❌ Manual/Mock | ✅ Yes | Use `currentStage` from WS |
| **Objection Detection** | ❌ Mock tags | ✅ Yes | Use `showWarning` from WS |

---

## 🎯 Key Files to Modify

### 1. **DashboardPage.tsx**
```typescript
// BEFORE
import { useTeleSaleSimulation } from "@/hooks/useTeleSaleSimulation";
const simulationState = useTeleSaleSimulation();

// AFTER
import { useWebSocket } from "@/hooks/useWebSocket";
const wsState = useWebSocket();
```

### 2. **DashboardTemplate.tsx**
Update prop types to accept WebSocket state instead of simulation state.

### 3. **JourneyGuide.tsx**
Already accepts `aiSuggestion` prop - just needs to receive it from WebSocket instead of mock.

### 4. **SimulationSidebar.tsx**
Can be removed or repurposed since real audio will replace button-based simulation.

---

## 🚀 Migration Checklist

- [ ] Import `useWebSocket` in `DashboardPage.tsx`
- [ ] Replace `useTeleSaleSimulation` with `useWebSocket`
- [ ] Remove `MOCK_PRODUCTS` import
- [ ] Remove `mockAiResponses.json` dependency
- [ ] Update all state variables to use WebSocket data
- [ ] Test WebSocket connection to `ws://localhost:8000/ws`
- [ ] Verify audio recording and streaming
- [ ] Verify real-time transcription display
- [ ] Verify AI suggestions update from backend
- [ ] Verify customer info extraction
- [ ] Verify product filtering from backend
- [ ] Verify objection detection from backend

---

## 📝 Notes

1. **Backend Must Be Running**: Ensure `docker-compose up` is running before connecting
2. **WebSocket URL**: Currently hardcoded to `ws://localhost:8000/ws`
3. **Audio Format**: Frontend sends WAV format, backend expects this
4. **Message Protocol**: Frontend already implements the correct message types from README.md

---

## 🔗 Related Files

- **Mock Data**: `data/mock.ts`, `data/mockAiResponses.json`, `data/simulationActions.json`
- **Simulation Hook**: `hooks/useTeleSaleSimulation.ts` (to be replaced)
- **WebSocket Hook**: `hooks/useWebSocket.ts` (ready to use)
- **Main Page**: `app/src/components/pages/DashboardPage.tsx` (needs modification)
- **Backend Protocol**: Root `README.md` (WebSocket Message Protocol section)

---

**Last Updated:** 2024
**Status:** Frontend is fully functional in SIMULATION MODE, ready for backend integration
