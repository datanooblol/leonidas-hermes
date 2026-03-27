# ✅ Deployment Checklist

## Pre-Deployment Verification

### Backend Setup
- [ ] Python 3.8+ installed
- [ ] All dependencies installed (`pip install fastapi uvicorn pandas pydantic boto3`)
- [ ] AWS credentials configured (for Bedrock LLM)
- [ ] Product CSV file exists: `prototype-mindai/dataset/mock_life_insurance_products.csv`
- [ ] Port 8000 is available

### Frontend Setup
- [ ] Node.js 18+ installed
- [ ] All dependencies installed (`npm install`)
- [ ] Port 3000 is available

---

## Files Modified (Review Changes)

### ✅ Modified Files:
1. **`frontend_max/hooks/useWebSocket.ts`**
   - Added handlers for all backend message types
   - Added comprehensive logging
   - Fixed stage name mapping

2. **`frontend_max/app/src/components/pages/DashboardPage.tsx`**
   - Fixed message format (data vs text)
   - Added logging to all send functions
   - Added connection checks

### ✅ Created Files:
1. **`FRONTEND_BACKEND_CONNECTION_PLAN.md`** - Detailed connection plan
2. **`QUICK_START_GUIDE.md`** - Step-by-step startup guide
3. **`CONNECTION_STATUS.md`** - Visual connection status
4. **`SUMMARY.md`** - Summary of changes
5. **`ARCHITECTURE.md`** - Complete system architecture
6. **`DEPLOYMENT_CHECKLIST.md`** - This file

---

## Startup Procedure

### Step 1: Start Backend
```bash
cd C:\work\mick\ฝึกงาน\leonidas-hermes\prototype-mindai
python main_clean.py
```

**Expected Output:**
```
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**Verify:**
- [ ] No errors in terminal
- [ ] Can access http://localhost:8000/docs
- [ ] Swagger UI loads

### Step 2: Start Frontend
```bash
cd C:\work\mick\ฝึกงาน\leonidas-hermes\frontend_max
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in X.Xs
```

**Verify:**
- [ ] No errors in terminal
- [ ] Can access http://localhost:3000
- [ ] Login page loads

### Step 3: Access Dashboard
```
http://localhost:3000/dashboard
```

**Verify:**
- [ ] Dashboard loads
- [ ] No console errors
- [ ] WebSocket connects (check console)

---

## Connection Verification

### Browser Console Checks

**Open Console (F12) and verify:**

1. **Initial Connection:**
   ```
   ✅ WebSocket connected
   📨 Received message: guide
   🎯 Stage changed to: greeting
   📋 Guide received
   ```
   - [ ] All 4 messages appear
   - [ ] No errors

2. **Customer Info Update:**
   - [ ] Change age to "35"
   - [ ] Console shows: `📝 Sent customer info update`
   - [ ] Console shows: `📨 Received message: information`
   - [ ] Console shows: `📨 Received message: products`

3. **Interest Toggle:**
   - [ ] Click "Life Insurance"
   - [ ] Console shows: `❤️ Sent interest update`
   - [ ] Console shows: `📨 Received message: interest`
   - [ ] Console shows: `📨 Received message: products`

4. **Stage Change:**
   - [ ] Click "Discover" button
   - [ ] Console shows: `📨 Received message: guide (processing)`
   - [ ] Console shows multiple async responses
   - [ ] Journey Guide updates with AI suggestions

### Backend Terminal Checks

**Verify backend logs show:**
```
🔍 Starting extraction...
🎯 Starting strategy generation...
🛍️ Starting product filtering...
✅ Sent updated information response
✅ Sent updated interest response
✅ Sent updated product list
```

- [ ] Extraction logs appear
- [ ] Strategy logs appear
- [ ] Product filtering logs appear
- [ ] No errors or exceptions

---

## Feature Testing

### 1. Customer Information Management
- [ ] Age field updates
- [ ] Income field updates
- [ ] Marital status dropdown works
- [ ] Children count updates
- [ ] Changes sync to backend
- [ ] Products filter after update

### 2. Interest Management
- [ ] All 8 interest checkboxes work
- [ ] Toggle on/off works
- [ ] Changes sync to backend
- [ ] Products filter after toggle
- [ ] Multiple interests work together

### 3. Stage Management
- [ ] All 4 stage buttons clickable
- [ ] Stage indicator updates
- [ ] AI guidance appears
- [ ] Suggested lines display
- [ ] Tags/signals show
- [ ] Progress bar updates

### 4. Product Filtering
- [ ] Products appear in right sidebar
- [ ] Search box works
- [ ] Products filter by age
- [ ] Products filter by income
- [ ] Product count updates
- [ ] Click product shows modal

### 5. AI Guidance
- [ ] Initial greeting guide appears
- [ ] Stage-specific guidance shows
- [ ] Action banner displays
- [ ] Suggested lines appear
- [ ] Explanation panel shows
- [ ] Guidance updates on stage change

### 6. Objection Handling
- [ ] Objection modal appears (if triggered)
- [ ] Warning displays correctly
- [ ] Suggested responses show
- [ ] "RESOLVE NOW" button works
- [ ] Modal closes after resolution
- [ ] Backend receives resolution

### 7. WebSocket Connection
- [ ] Connects automatically on load
- [ ] Stays connected during use
- [ ] Reconnects after disconnect
- [ ] Connection status shows in UI
- [ ] All messages send/receive correctly

---

## Performance Checks

### Response Times
- [ ] Customer info update < 500ms
- [ ] Interest toggle < 500ms
- [ ] Stage change < 2s (includes LLM calls)
- [ ] Product filtering < 300ms
- [ ] UI updates feel instant

### Memory Usage
- [ ] Frontend memory stable
- [ ] Backend memory stable
- [ ] No memory leaks after extended use
- [ ] WebSocket connection stable

### Error Handling
- [ ] Backend errors show in console
- [ ] Frontend errors don't crash app
- [ ] Invalid data handled gracefully
- [ ] Network errors handled

---

## Browser Compatibility

Test in multiple browsers:

### Chrome/Edge
- [ ] Dashboard loads
- [ ] WebSocket connects
- [ ] All features work
- [ ] No console errors

### Firefox
- [ ] Dashboard loads
- [ ] WebSocket connects
- [ ] All features work
- [ ] No console errors

### Safari (if available)
- [ ] Dashboard loads
- [ ] WebSocket connects
- [ ] All features work
- [ ] No console errors

---

## Security Checks

### Backend
- [ ] CORS configured correctly
- [ ] No sensitive data in logs
- [ ] AWS credentials not exposed
- [ ] WebSocket connection secure

### Frontend
- [ ] No API keys in code
- [ ] No sensitive data in console
- [ ] WebSocket URL configurable
- [ ] Error messages don't expose internals

---

## Documentation Review

### User Documentation
- [ ] QUICK_START_GUIDE.md is clear
- [ ] All steps are accurate
- [ ] Screenshots/examples helpful
- [ ] Troubleshooting section complete

### Developer Documentation
- [ ] ARCHITECTURE.md is accurate
- [ ] CONNECTION_STATUS.md is up-to-date
- [ ] Code comments are clear
- [ ] API documentation complete

---

## Known Issues & Limitations

### ❌ Not Implemented:
1. **Audio/Transcription**
   - Frontend has audio recording
   - Backend doesn't process audio
   - No transcription service integrated

2. **Checklist Display**
   - Backend sends checklist messages
   - Frontend logs but doesn't display
   - No UI component for checklist

3. **Stage Change Notifications**
   - Backend sends stage_change messages
   - Frontend logs but no visual feedback
   - No toast/notification component

### ⚠️ Known Limitations:
1. **Single Session**
   - No multi-user support
   - No session persistence
   - Memory resets on restart

2. **LLM Dependency**
   - Requires AWS Bedrock access
   - Requires internet connection
   - LLM calls can be slow

3. **Product Data**
   - Uses mock CSV data
   - No database integration
   - Limited filtering options

---

## Production Readiness

### Before Production:
- [ ] Add authentication
- [ ] Add session management
- [ ] Add database integration
- [ ] Add error tracking (Sentry)
- [ ] Add analytics
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Add data encryption
- [ ] Add backup system
- [ ] Add monitoring/alerting

### Environment Variables:
- [ ] Backend port configurable
- [ ] Frontend API URL configurable
- [ ] AWS credentials from env
- [ ] Database URL from env
- [ ] Log level configurable

### Deployment:
- [ ] Docker containers ready
- [ ] CI/CD pipeline configured
- [ ] Health checks implemented
- [ ] Load balancing configured
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] CDN configured (frontend)

---

## Final Verification

### ✅ All Systems Go When:

**Backend:**
```
✅ Server running on port 8000
✅ WebSocket endpoint accessible
✅ LLM integration working
✅ Product filtering working
✅ Memory management working
✅ No errors in logs
```

**Frontend:**
```
✅ App running on port 3000
✅ WebSocket connected
✅ All components rendering
✅ All features working
✅ No console errors
✅ Performance acceptable
```

**Integration:**
```
✅ Messages send/receive correctly
✅ Data syncs bidirectionally
✅ Real-time updates working
✅ Error handling working
✅ All flows tested
✅ Documentation complete
```

---

## Sign-Off

### Development Team:
- [ ] Code reviewed
- [ ] Tests passed
- [ ] Documentation complete
- [ ] Known issues documented

### QA Team:
- [ ] All features tested
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Browser compatibility verified

### Product Owner:
- [ ] Features meet requirements
- [ ] User experience acceptable
- [ ] Ready for deployment

---

## Post-Deployment

### Monitoring:
- [ ] Set up error tracking
- [ ] Set up performance monitoring
- [ ] Set up uptime monitoring
- [ ] Set up log aggregation

### Support:
- [ ] Support documentation ready
- [ ] Known issues documented
- [ ] Escalation process defined
- [ ] Contact information updated

### Maintenance:
- [ ] Backup schedule defined
- [ ] Update schedule defined
- [ ] Security patch process defined
- [ ] Incident response plan ready

---

## 🎉 Deployment Complete!

Once all items are checked, your system is ready for use!

**Quick Reference:**
- Backend: http://localhost:8000
- Frontend: http://localhost:3000/dashboard
- Docs: http://localhost:8000/docs
- WebSocket: ws://localhost:8000/ws

**Support Documents:**
- QUICK_START_GUIDE.md - How to start
- ARCHITECTURE.md - System overview
- CONNECTION_STATUS.md - Connection details
- SUMMARY.md - What was done
