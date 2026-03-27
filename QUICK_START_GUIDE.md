# 🚀 Quick Start Guide: Connect Frontend to Backend

## Prerequisites
- Python 3.8+ installed
- Node.js 18+ installed
- Both frontend and backend code ready

---

## Step 1: Start Backend Server

### Navigate to backend directory:
```bash
cd C:\work\mick\ฝึกงาน\leonidas-hermes\prototype-mindai
```

### Install dependencies (if not already installed):
```bash
pip install fastapi uvicorn pandas pydantic boto3
```

### Start the backend:
```bash
python main_clean.py
```

### Expected output:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Verify backend is running:
Open browser: http://localhost:8000/docs
You should see FastAPI Swagger documentation.

---

## Step 2: Start Frontend Server

### Open NEW terminal and navigate to frontend:
```bash
cd C:\work\mick\ฝึกงาน\leonidas-hermes\frontend_max
```

### Install dependencies (if not already installed):
```bash
npm install
```

### Start the frontend:
```bash
npm run dev
```

### Expected output:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in X.Xs
```

---

## Step 3: Access Dashboard

### Open browser:
```
http://localhost:3000/dashboard
```

### What you should see:
1. ✅ Dashboard loads
2. ✅ WebSocket connects automatically
3. ✅ Initial greeting guide appears in Journey Guide panel
4. ✅ Console shows: "✅ WebSocket connected"

---

## Step 4: Test Connection

### Open Browser Console (F12)

### Test 1: Check Initial Connection
**Expected console logs:**
```
✅ WebSocket connected
📨 Received message: guide {...}
🎯 Stage changed to: greeting
📋 Guide received: {...}
```

### Test 2: Update Customer Information
1. In Customer Info panel, change Age to "35"
2. Change Income to "50000"

**Expected console logs:**
```
📝 Sent customer info update: {age: 35, income_per_month: 50000}
📨 Received message: information {...}
✅ Customer info updated: {...}
📨 Received message: products {...}
🛍️ Products received: X
```

### Test 3: Toggle Interest
1. Click "Life Insurance" checkbox

**Expected console logs:**
```
❤️ Sent interest update: Life Insurance true
📨 Received message: interest {...}
✅ Customer interest updated: {...}
📨 Received message: products {...}
🛍️ Products received: X
```

### Test 4: Change Stage
1. Click "Discover" stage button

**Expected console logs:**
```
📨 Received message: guide {...}
⏳ Backend processing...
🎯 Stage changed to: discovery
📨 Received message: information {...}
📨 Received message: interest {...}
📨 Received message: guide {...}
📋 Guide received: {...}
📨 Received message: products {...}
```

---

## Step 5: Verify All Features

### ✅ Customer Information Sync
- [ ] Age updates in both frontend and backend
- [ ] Income updates trigger product filtering
- [ ] Marital status changes reflected
- [ ] Number of children updates

### ✅ Interest Management
- [ ] Toggle interests on/off
- [ ] Products filter based on interests
- [ ] Backend receives all interest updates

### ✅ Stage Management
- [ ] Click stage buttons to change stages
- [ ] AI guidance updates for each stage
- [ ] Suggested lines appear
- [ ] Tags/signals display correctly

### ✅ Product Recommendations
- [ ] Products appear in right sidebar
- [ ] Products filter by age
- [ ] Products filter by income
- [ ] Product count updates

### ✅ Objection Handling
- [ ] Objection modal appears (if triggered)
- [ ] "RESOLVE NOW" button works
- [ ] Modal closes after resolution

---

## Troubleshooting

### Problem: WebSocket won't connect

**Check:**
1. Backend is running on port 8000
2. No firewall blocking localhost:8000
3. Browser console shows connection error

**Solution:**
```bash
# Kill any process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Restart backend
python main_clean.py
```

---

### Problem: "CORS error" in console

**Check:**
Backend CORS settings in `main_clean.py` line 18-24

**Should be:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Problem: Messages not received

**Check:**
1. Open browser console (F12)
2. Look for WebSocket messages
3. Check Network tab → WS filter

**Debug:**
```typescript
// In useWebSocket.ts, all messages are logged:
ws.current.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Received message:', data.type, data);
  // ...
}
```

---

### Problem: Products not filtering

**Check:**
1. Customer age is set (required for filtering)
2. Customer income is set (required for filtering)
3. Backend console shows product filtering logs

**Backend logs should show:**
```
🛍️ Starting product filtering...
🛍️ Filtering with: {'age': 35, 'income_per_month': 50000}
🛍️ Found X products matching criteria
✅ Sent updated product list
```

---

### Problem: Stage changes don't work

**Check:**
1. Message format is correct (should use `data` not `text`)
2. Stage name mapping is correct
3. Backend receives the message

**Verify in console:**
```
🗣️ Sent guide message: {stage: 'discovery', content: '...'}
```

---

## Expected Message Flow

### When you change customer info:

```
Frontend                          Backend
   |                                 |
   |--manual_information_update----->|
   |                                 |
   |<-------information--------------|
   |<-------products-----------------|
   |                                 |
```

### When you change stage:

```
Frontend                          Backend
   |                                 |
   |----------guide------------------>|
   |                                 |
   |<-------guide (processing)-------|
   |<-------information--------------|
   |<-------interest-----------------|
   |<-------guide (strategy)---------|
   |<-------products-----------------|
   |<-------checklist----------------|
   |<-------objection (if detected)--|
   |                                 |
```

---

## Success Indicators

### ✅ Everything is working when:

1. **Console shows:**
   - ✅ WebSocket connected
   - 📨 Messages received for all actions
   - No ❌ errors

2. **UI updates:**
   - Customer info syncs automatically
   - Products filter in real-time
   - Journey Guide shows AI suggestions
   - Stage buttons work

3. **Backend logs show:**
   - 🔍 Starting extraction...
   - 🎯 Starting strategy generation...
   - 🛍️ Starting product filtering...
   - ✅ Sent responses

---

## Next Steps

Once basic connection works:

1. **Test with real conversation:**
   - Use Simulation Sidebar to send customer responses
   - Watch AI generate strategies
   - See products filter automatically

2. **Test objection handling:**
   - Send message with objection keywords
   - Verify warning modal appears
   - Test resolution flow

3. **Test stage transitions:**
   - Complete greeting checklist
   - Watch automatic transition to discovery
   - Verify stage-specific guidance

---

## Support

If you encounter issues:

1. Check both backend and frontend console logs
2. Verify WebSocket connection in Network tab
3. Ensure all message formats match backend schema
4. Review FRONTEND_BACKEND_CONNECTION_PLAN.md for details

---

## Quick Reference

### Backend Endpoint:
```
ws://localhost:8000/ws
```

### Message Types Frontend Sends:
- `guide` - Stage change with conversation content
- `manual_information_update` - Customer info updates
- `manual_interest_update` - Interest toggles
- `manual_stage_update` - Manual stage changes (not used)
- `manual_resolve_objection` - Objection resolution

### Message Types Backend Sends:
- `guide` - AI guidance and stage info
- `information` - Customer information updates
- `interest` - Customer interest updates
- `products` - Filtered product recommendations
- `checklist` - Agent checklist status
- `stage_change` - Automatic stage transitions
- `objection` - Objection detection
- `objection_resolved` - Objection resolution confirmation
- `error` - Error messages

---

## Done! 🎉

Your frontend is now connected to the backend. All features should work:
- ✅ Real-time customer data sync
- ✅ AI-powered stage guidance
- ✅ Dynamic product filtering
- ✅ Objection detection and handling
- ✅ Automatic stage transitions
