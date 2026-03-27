# Frontend-Backend Connection Plan

## Overview
This document outlines the step-by-step plan to connect `frontend_max` with `prototype-mindai/main_clean.py` backend.

## Current Status
- ✅ Backend: `main_clean.py` is ready with WebSocket endpoint
- ✅ Frontend: `useWebSocket.ts` hook exists with connection logic
- ⚠️ Issues: Some message types not handled, stage name mismatches

## Connection Steps

### Step 1: Fix Backend Configuration
**File:** `prototype-mindai/main_clean.py`

**Changes Needed:**
1. Verify CORS settings allow frontend origin
2. Ensure WebSocket endpoint is accessible
3. Check port configuration (default: 8000)

**Current Status:** ✅ Already configured (lines 18-24)

---

### Step 2: Fix Frontend WebSocket URL
**File:** `frontend_max/hooks/useWebSocket.ts`

**Current:** Line 73
```typescript
ws.current = new WebSocket('ws://localhost:8000/ws');
```

**Action:** ✅ Already correct - matches backend endpoint

---

### Step 3: Add Missing Message Handlers in Frontend
**File:** `frontend_max/hooks/useWebSocket.ts`

**Add handlers for:**
1. `checklist` messages (from backend)
2. `stage_change` messages (from backend)
3. `error` messages (from backend)
4. Handle `status: "no_change"` responses

---

### Step 4: Fix Stage Name Mapping
**File:** `frontend_max/hooks/useWebSocket.ts`

**Current Issue:** Backend sometimes sends 'pitching' instead of 'pitch'

**Fix:** Update stageMap (line 96-103) to handle both

---

### Step 5: Update DashboardPage to Use Guide Message Correctly
**File:** `frontend_max/app/src/components/pages/DashboardPage.tsx`

**Current Issue:** Line 242-250 sends wrong message format

**Current:**
```typescript
wsState.sendMessage({
  type: "guide",
  text: {
    stage_name: stageMap[stageId] || 'greeting',
    content: text
  }
});
```

**Should be:**
```typescript
wsState.sendMessage({
  type: "guide",
  data: {
    stage_name: stageMap[stageId] || 'greeting',
    content: text
  }
});
```

---

### Step 6: Add Checklist Display Component
**File:** `frontend_max/app/src/components/organisms/CustomerSidebar.tsx`

**Add:** Display agent checklist from backend

---

### Step 7: Handle Stage Change Messages
**File:** `frontend_max/hooks/useWebSocket.ts`

**Add:** Handler for automatic stage transitions from backend

---

### Step 8: Add Error Handling UI
**File:** `frontend_max/app/src/components/organisms/`

**Create:** Error notification component for backend errors

---

### Step 9: Test Connection Flow
**Test Scenarios:**
1. Initial connection → Receive greeting guide
2. Manual customer info update → Receive updated info + products
3. Manual interest update → Receive updated interests + products
4. Stage change → Receive guide + multiple async responses
5. Objection resolution → Receive objection_resolved

---

### Step 10: Add Connection Status Indicator
**File:** `frontend_max/app/src/components/organisms/Navbar.tsx`

**Add:** Visual indicator for WebSocket connection state

---

## Implementation Priority

### Phase 1: Critical Fixes (Required for Basic Connection)
1. ✅ Fix message format in DashboardPage (Step 5)
2. ✅ Add missing message handlers (Step 3)
3. ✅ Fix stage name mapping (Step 4)

### Phase 2: Enhanced Features
4. Add checklist display (Step 6)
5. Handle stage change messages (Step 7)
6. Add error handling UI (Step 8)

### Phase 3: Polish
7. Add connection status indicator (Step 10)
8. Test all flows (Step 9)

---

## Files to Modify

### Frontend Files:
1. `frontend_max/hooks/useWebSocket.ts` - Add message handlers
2. `frontend_max/app/src/components/pages/DashboardPage.tsx` - Fix message format
3. `frontend_max/app/src/components/organisms/CustomerSidebar.tsx` - Add checklist
4. `frontend_max/app/src/components/organisms/Navbar.tsx` - Add connection status
5. `frontend_max/types/index.ts` - Add new types

### Backend Files:
- No changes needed to `main_clean.py` - it's ready!

---

## Testing Checklist

### Connection Tests:
- [ ] Frontend connects to backend successfully
- [ ] Initial greeting guide received
- [ ] WebSocket stays connected during idle

### Message Flow Tests:
- [ ] Customer info update works bidirectionally
- [ ] Interest update works bidirectionally
- [ ] Stage change triggers 4 async flows
- [ ] Products filter correctly based on customer data
- [ ] Objection detection and resolution works

### Error Handling Tests:
- [ ] Backend disconnection handled gracefully
- [ ] Invalid messages show error
- [ ] Reconnection works after disconnect

---

## Next Steps

Run these commands to start:

### Backend:
```bash
cd prototype-mindai
python main_clean.py
```

### Frontend:
```bash
cd frontend_max
npm install
npm run dev
```

Then access: http://localhost:3000/dashboard
