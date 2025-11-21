# Real-Time Sales Analysis Implementation Guide

## Architecture Overview

This document outlines the implementation of real-time speech analysis for telesales representatives using FastAPI WebSocket backend and Next.js frontend.

## WebSocket Architecture Comparison

### Option 1: Single WebSocket (Recommended)

**Pros:**
- **Simplified Connection Management**: One connection to maintain
- **Message Ordering**: Guaranteed sequential delivery
- **Lower Latency**: Direct communication channel
- **Reduced Complexity**: Single state management
- **Resource Efficient**: Lower connection overhead
- **Atomic Operations**: Transcription and analysis in sync

**Cons:**
- **Potential Bottleneck**: Heavy analysis might block transcription
- **Mixed Message Types**: Need message type handling
- **Error Propagation**: One connection failure affects everything

### Option 2: Multiple WebSockets

**Pros:**
- **Separation of Concerns**: Independent channels for different data
- **Parallel Processing**: Analysis won't block transcription
- **Fault Isolation**: Failure in one channel doesn't affect others
- **Scalability**: Can scale different services independently

**Cons:**
- **Complex State Management**: Synchronizing multiple connections
- **Connection Overhead**: Multiple TCP connections
- **Message Ordering Issues**: Race conditions between channels
- **Increased Complexity**: More error handling and reconnection logic

## Recommended Implementation: Single WebSocket

Based on the analysis, **Single WebSocket** is recommended for the following reasons:
1. Real-time sales coaching requires immediate feedback
2. Transcription and analysis are tightly coupled
3. Simpler development and maintenance
4. Better user experience with synchronized updates

## Backend Implementation

### 1. Core Components

```python
# backend/sales_analysis/engine.py
import asyncio
import time
from typing import Dict, Any, List
from dataclasses import dataclass

@dataclass
class AnalysisResult:
    intent: str
    sentiment: str
    confidence: float
    alerts: List[str]
    recommendations: List[str]
    metrics: Dict[str, Any]

class ConversationBuffer:
    def __init__(self, window_size: int = 30):
        self.window_size = window_size
        self.chunks = []
    
    def add_chunk(self, text: str, timestamp: float):
        self.chunks.append((text, timestamp))
        # Remove old chunks
        cutoff = timestamp - self.window_size
        self.chunks = [(t, ts) for t, ts in self.chunks if ts > cutoff]
    
    def get_context(self) -> str:
        return " ".join([text for text, _ in self.chunks])

class SalesAnalysisEngine:
    def __init__(self):
        self.conversation_buffer = ConversationBuffer()
        self.sales_triggers = self._load_sales_triggers()
    
    def _load_sales_triggers(self) -> Dict[str, Dict]:
        return {
            "objection_price": {
                "keywords": ["expensive", "costly", "budget", "afford", "price"],
                "action": "emphasize_value",
                "urgency": "high"
            },
            "buying_signal": {
                "keywords": ["ready", "let's do it", "sign up", "when start", "how much"],
                "action": "close_now",
                "urgency": "critical"
            },
            "competitor": {
                "keywords": ["already use", "comparing", "other option"],
                "action": "differentiate",
                "urgency": "medium"
            },
            "confusion": {
                "keywords": ["don't understand", "confused", "what do you mean"],
                "action": "clarify_slow",
                "urgency": "medium"
            }
        }
    
    async def analyze_chunk(self, text: str, timestamp: float) -> AnalysisResult:
        # Add to conversation buffer
        self.conversation_buffer.add_chunk(text, timestamp)
        context = self.conversation_buffer.get_context()
        
        # Quick rule-based analysis
        alerts = self._detect_triggers(text)
        intent = self._classify_intent(text, context)
        sentiment = self._analyze_sentiment(text)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(intent, alerts)
        
        # Calculate metrics
        metrics = self._calculate_metrics(context)
        
        return AnalysisResult(
            intent=intent,
            sentiment=sentiment,
            confidence=0.85,  # Placeholder
            alerts=alerts,
            recommendations=recommendations,
            metrics=metrics
        )
    
    def _detect_triggers(self, text: str) -> List[str]:
        alerts = []
        text_lower = text.lower()
        
        for trigger_name, trigger_data in self.sales_triggers.items():
            if any(keyword in text_lower for keyword in trigger_data["keywords"]):
                alerts.append(f"{trigger_data['action']} - {trigger_data['urgency']} priority")
        
        return alerts
    
    def _classify_intent(self, text: str, context: str) -> str:
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["yes", "sure", "okay", "sounds good"]):
            return "agreement"
        elif any(word in text_lower for word in ["no", "not interested", "maybe later"]):
            return "rejection"
        elif any(word in text_lower for word in ["tell me more", "how does", "what about"]):
            return "interest"
        elif any(word in text_lower for word in ["expensive", "cost", "price"]):
            return "price_concern"
        else:
            return "neutral"
    
    def _analyze_sentiment(self, text: str) -> str:
        # Simple sentiment analysis (replace with proper model)
        positive_words = ["great", "excellent", "love", "perfect", "amazing"]
        negative_words = ["bad", "terrible", "hate", "awful", "disappointed"]
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    def _generate_recommendations(self, intent: str, alerts: List[str]) -> List[str]:
        recommendations = []
        
        if intent == "price_concern":
            recommendations.append("Focus on value proposition and ROI")
        elif intent == "interest":
            recommendations.append("Ask discovery questions to understand needs")
        elif intent == "rejection":
            recommendations.append("Acknowledge concern and ask clarifying questions")
        
        if alerts:
            recommendations.append("Address the detected concerns immediately")
        
        return recommendations
    
    def _calculate_metrics(self, context: str) -> Dict[str, Any]:
        words = context.split()
        return {
            "word_count": len(words),
            "conversation_length": len(context),
            "question_count": context.count("?"),
            "engagement_score": min(len(words) / 100, 1.0)  # Simple engagement metric
        }
```

### 2. WebSocket Handler

```python
# backend/websocket/sales_handler.py
import asyncio
import json
import time
from fastapi import WebSocket, WebSocketDisconnect
from backend.audio_processing.overlatp_to_transcribe import Overlap2Transcribe
from backend.sales_analysis.engine import SalesAnalysisEngine

class SalesWebSocketHandler:
    def __init__(self):
        self.transcriber = Overlap2Transcribe()
        self.analysis_engine = SalesAnalysisEngine()
        self.active_connections = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = {
            "websocket": websocket,
            "connected_at": time.time()
        }
        
        # Send connection confirmation
        await self.send_message(websocket, {
            "type": "connection",
            "status": "connected",
            "session_id": session_id,
            "timestamp": time.time()
        })
    
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
    
    async def send_message(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            print(f"Error sending message: {e}")
    
    async def handle_audio_chunk(self, websocket: WebSocket, audio_data: bytes, session_id: str):
        timestamp = time.time()
        
        try:
            # 1. Fast transcription (priority: speed)
            transcription = await self._transcribe_audio(audio_data)
            
            if transcription.strip():  # Only process non-empty transcriptions
                # Send transcription immediately
                await self.send_message(websocket, {
                    "type": "transcription",
                    "data": {
                        "text": transcription,
                        "timestamp": timestamp,
                        "session_id": session_id
                    }
                })
                
                # 2. Quick analysis (non-blocking)
                analysis_task = asyncio.create_task(
                    self._analyze_and_send(websocket, transcription, timestamp, session_id)
                )
                
                # Don't await - let it run in background
                # This ensures transcription is never blocked by analysis
        
        except Exception as e:
            await self.send_message(websocket, {
                "type": "error",
                "data": {
                    "message": f"Processing error: {str(e)}",
                    "timestamp": timestamp
                }
            })
    
    async def _transcribe_audio(self, audio_data: bytes) -> str:
        # Use your existing transcription logic
        # This should be optimized for speed
        try:
            # Save audio temporarily and transcribe
            # Replace with your actual transcription logic
            result = self.transcriber.transcribe(audio_data)
            return result if result else ""
        except Exception as e:
            print(f"Transcription error: {e}")
            return ""
    
    async def _analyze_and_send(self, websocket: WebSocket, text: str, timestamp: float, session_id: str):
        try:
            # Perform analysis
            analysis_result = await self.analysis_engine.analyze_chunk(text, timestamp)
            
            # Send analysis results
            await self.send_message(websocket, {
                "type": "analysis",
                "data": {
                    "intent": analysis_result.intent,
                    "sentiment": analysis_result.sentiment,
                    "confidence": analysis_result.confidence,
                    "alerts": analysis_result.alerts,
                    "recommendations": analysis_result.recommendations,
                    "metrics": analysis_result.metrics,
                    "timestamp": timestamp,
                    "session_id": session_id
                }
            })
            
            # Send alerts if any
            if analysis_result.alerts:
                await self.send_message(websocket, {
                    "type": "alert",
                    "data": {
                        "alerts": analysis_result.alerts,
                        "urgency": "high" if "critical" in str(analysis_result.alerts) else "medium",
                        "timestamp": timestamp
                    }
                })
        
        except Exception as e:
            await self.send_message(websocket, {
                "type": "error",
                "data": {
                    "message": f"Analysis error: {str(e)}",
                    "timestamp": timestamp
                }
            })
```

### 3. FastAPI WebSocket Endpoint

```python
# backend/main.py (add to existing file)
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from backend.websocket.sales_handler import SalesWebSocketHandler
import uuid

app = FastAPI()
sales_handler = SalesWebSocketHandler()

@app.websocket("/ws/sales/{session_id}")
async def sales_websocket_endpoint(websocket: WebSocket, session_id: str = None):
    if not session_id:
        session_id = str(uuid.uuid4())
    
    await sales_handler.connect(websocket, session_id)
    
    try:
        while True:
            # Receive audio data
            audio_data = await websocket.receive_bytes()
            
            # Process audio chunk
            await sales_handler.handle_audio_chunk(websocket, audio_data, session_id)
            
    except WebSocketDisconnect:
        sales_handler.disconnect(session_id)
        print(f"Client {session_id} disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        sales_handler.disconnect(session_id)
```

## Frontend Implementation

### 1. WebSocket Hook

```typescript
// frontend/hooks/useSalesWebSocket.ts
import { useEffect, useState, useCallback, useRef } from 'react';

interface TranscriptionData {
  text: string;
  timestamp: number;
  session_id: string;
}

interface AnalysisData {
  intent: string;
  sentiment: string;
  confidence: number;
  alerts: string[];
  recommendations: string[];
  metrics: Record<string, any>;
  timestamp: number;
  session_id: string;
}

interface AlertData {
  alerts: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

interface WebSocketMessage {
  type: 'connection' | 'transcription' | 'analysis' | 'alert' | 'error';
  data: any;
}

export const useSalesWebSocket = (sessionId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisData | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(`ws://localhost:8000/ws/sales/${sessionId}`);
      
      ws.onopen = () => {
        console.log('Sales WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connection':
              console.log('Connection confirmed:', message.data);
              break;
              
            case 'transcription':
              const transcriptionData = message.data as TranscriptionData;
              setTranscription(prev => prev + ' ' + transcriptionData.text);
              break;
              
            case 'analysis':
              const analysisData = message.data as AnalysisData;
              setCurrentAnalysis(analysisData);
              break;
              
            case 'alert':
              const alertData = message.data as AlertData;
              setAlerts(prev => [...prev.slice(-4), alertData]); // Keep last 5 alerts
              break;
              
            case 'error':
              console.error('WebSocket error:', message.data);
              setConnectionError(message.data.message);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Sales WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnection attempt ${reconnectAttempts.current}`);
            connect();
          }, delay);
        } else {
          setConnectionError('Failed to reconnect after multiple attempts');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('WebSocket connection error');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create connection');
    }
  }, [sessionId]);

  const sendAudioChunk = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(audioData);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const clearTranscription = useCallback(() => {
    setTranscription('');
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    transcription,
    currentAnalysis,
    alerts,
    connectionError,
    sendAudioChunk,
    disconnect,
    reconnect: connect,
    clearAlerts,
    clearTranscription
  };
};
```

### 2. Sales Dashboard Component

```typescript
// frontend/components/SalesDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useSalesWebSocket } from '../hooks/useSalesWebSocket';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface SalesDashboardProps {
  sessionId: string;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ sessionId }) => {
  const {
    isConnected,
    transcription,
    currentAnalysis,
    alerts,
    connectionError,
    sendAudioChunk,
    clearAlerts,
    clearTranscription
  } = useSalesWebSocket(sessionId);

  const {
    isRecording,
    startRecording,
    stopRecording,
    audioLevel
  } = useAudioRecorder({
    onAudioChunk: sendAudioChunk,
    chunkSize: 1024 // Adjust based on your needs
  });

  const getAlertColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Connection Status & Controls */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {connectionError && (
                <span className="text-red-500 text-sm">{connectionError}</span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              
              <button
                onClick={clearTranscription}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Real-time Alerts */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Live Alerts</h3>
            <button
              onClick={clearAlerts}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-sm">No alerts</p>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-white text-sm ${getAlertColor(alert.urgency)}`}
                >
                  <div className="font-medium">{alert.urgency.toUpperCase()}</div>
                  {alert.alerts.map((alertText, i) => (
                    <div key={i}>{alertText}</div>
                  ))}
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Current Analysis</h3>
          
          {currentAnalysis ? (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Intent:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {currentAnalysis.intent}
                </span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Sentiment:</span>
                <span className={`ml-2 font-medium ${getSentimentColor(currentAnalysis.sentiment)}`}>
                  {currentAnalysis.sentiment}
                </span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Confidence:</span>
                <span className="ml-2">{(currentAnalysis.confidence * 100).toFixed(1)}%</span>
              </div>
              
              {currentAnalysis.recommendations.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Recommendations:</span>
                  <ul className="mt-1 space-y-1">
                    {currentAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700 ml-2">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No analysis data yet</p>
          )}
        </div>

        {/* Conversation Metrics */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Metrics</h3>
          
          {currentAnalysis?.metrics ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Words:</span>
                <span className="text-sm font-medium">{currentAnalysis.metrics.word_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Questions:</span>
                <span className="text-sm font-medium">{currentAnalysis.metrics.question_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Engagement:</span>
                <span className="text-sm font-medium">
                  {(currentAnalysis.metrics.engagement_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No metrics available</p>
          )}
        </div>

        {/* Transcription Display */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Live Transcription</h3>
          
          <div className="bg-gray-50 rounded-lg p-4 min-h-32 max-h-64 overflow-y-auto">
            {transcription ? (
              <p className="text-gray-800 whitespace-pre-wrap">{transcription}</p>
            ) : (
              <p className="text-gray-500 italic">Start recording to see transcription...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
```

### 3. Main Page Integration

```typescript
// frontend/app/sales/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import SalesDashboard from '../../components/SalesDashboard';
import { v4 as uuidv4 } from 'uuid';

export default function SalesPage() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Generate or retrieve session ID
    const storedSessionId = localStorage.getItem('sales_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      localStorage.setItem('sales_session_id', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  if (!sessionId) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Sales Assistant</h1>
          <p className="text-gray-600">Real-time conversation analysis and coaching</p>
        </div>
      </header>
      
      <main className="py-6">
        <SalesDashboard sessionId={sessionId} />
      </main>
    </div>
  );
}
```

## Performance Considerations

### Backend Optimizations

1. **Async Processing**: Use `asyncio.create_task()` for non-blocking analysis
2. **Connection Pooling**: Implement connection pooling for database operations
3. **Caching**: Cache frequently used analysis models and rules
4. **Rate Limiting**: Implement rate limiting to prevent abuse

### Frontend Optimizations

1. **Message Batching**: Batch UI updates to prevent excessive re-renders
2. **Virtual Scrolling**: For long transcription displays
3. **Debouncing**: Debounce audio chunk sending if needed
4. **Memory Management**: Clear old transcription data periodically

## Testing Strategy

### Backend Testing

```python
# tests/test_sales_websocket.py
import pytest
import asyncio
from fastapi.testclient import TestClient
from backend.main import app

@pytest.mark.asyncio
async def test_sales_websocket_connection():
    with TestClient(app) as client:
        with client.websocket_connect("/ws/sales/test-session") as websocket:
            # Test connection
            data = websocket.receive_json()
            assert data["type"] == "connection"
            assert data["status"] == "connected"

@pytest.mark.asyncio
async def test_audio_processing():
    # Test audio chunk processing
    # Mock audio data and verify transcription/analysis flow
    pass
```

### Frontend Testing

```typescript
// __tests__/SalesDashboard.test.tsx
import { render, screen } from '@testing-library/react';
import SalesDashboard from '../components/SalesDashboard';

// Mock WebSocket
global.WebSocket = jest.fn();

test('renders sales dashboard', () => {
  render(<SalesDashboard sessionId="test-session" />);
  expect(screen.getByText('Live Alerts')).toBeInTheDocument();
  expect(screen.getByText('Current Analysis')).toBeInTheDocument();
});
```

## Deployment Considerations

### Backend Deployment

1. **Environment Variables**: Configure WebSocket URLs, model paths
2. **Health Checks**: Implement health check endpoints
3. **Monitoring**: Add logging and metrics collection
4. **Scaling**: Consider horizontal scaling for multiple concurrent sessions

### Frontend Deployment

1. **Environment Configuration**: WebSocket URLs for different environments
2. **Error Boundaries**: Implement React error boundaries
3. **Progressive Web App**: Consider PWA features for mobile usage
4. **Analytics**: Add user interaction tracking

## Next Steps

1. **Implement Basic Version**: Start with single WebSocket and basic analysis
2. **Add Advanced Features**: Integrate LLM analysis, ML models
3. **Performance Testing**: Load test with multiple concurrent connections
4. **User Testing**: Gather feedback from actual sales representatives
5. **Iterate and Improve**: Refine based on real-world usage

This implementation provides a solid foundation for real-time sales analysis while maintaining simplicity and performance.