'use client';

import { useWebSocket } from '../../hooks/useWebSocket';
import { useEffect, useState, useRef } from 'react';

export default function TestPage() {
  const {
    isConnected,
    transcriptions,
    customerInfo,
    customerInterest,
    agentChecklist,
    currentStage,
    currentGuide,
    products,
    objectionDetected,
    connect,
    sendAudio
  } = useWebSocket();

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  useEffect(() => {
    connect();
  }, [connect]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      streamRef.current = stream;
      
      const startChunkRecording = () => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          if (chunks.length > 0) {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            sendAudio(audioBlob);
          }
        };

        mediaRecorder.start();
        
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            if (isRecordingRef.current) {
              startChunkRecording();
            }
          }
        }, 2000);
      };

      startChunkRecording();
      setIsRecording(true);
      isRecordingRef.current = true;

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">WebSocket Test Page</h1>
          
          {/* Record Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isRecording ? '🛑 Stop Recording' : '🎤 Start Recording'}
          </button>
        </div>
        
        {/* Connection Status */}
        <div className={`p-3 rounded mb-4 ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <strong>Connection Status:</strong> {isConnected ? 'Connected ✅' : 'Disconnected ❌'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Transcriptions */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3">🎤 Transcriptions ({transcriptions.length})</h2>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {transcriptions.length === 0 ? (
                <p className="text-gray-500">No transcriptions yet...</p>
              ) : (
                transcriptions.map((t, i) => (
                  <div key={i} className="bg-gray-50 p-2 rounded border-l-4 border-blue-400">
                    <div className="text-sm text-gray-600">#{i+1} - {new Date(t.timestamp).toLocaleTimeString()}</div>
                    <div className="font-medium">{t.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3">👤 Customer Information</h2>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(customerInfo, null, 2)}
            </pre>
          </div>

          {/* Customer Interest */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3">💡 Customer Interest</h2>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(customerInterest, null, 2)}
            </pre>
          </div>

          {/* Agent Checklist */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3">✅ Agent Checklist</h2>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(agentChecklist, null, 2)}
            </pre>
          </div>

          {/* Current Stage & Guide */}
          <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-3">🗺️ Current Stage & Guide</h2>
            <div className="mb-3">
              <strong>Stage:</strong> <span className="bg-blue-100 px-2 py-1 rounded">{currentStage}</span>
            </div>
            {currentGuide && (
              <div className="bg-gray-50 p-3 rounded">
                <div className="mb-2"><strong>Action:</strong> {currentGuide.action}</div>
                <div className="mb-2"><strong>Explanation:</strong> {currentGuide.explanation}</div>
                <div className="mb-2">
                  <strong>Signals:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {currentGuide.signals.map((signal, i) => (
                      <li key={i}>{signal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Lines to say:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {currentGuide.lines_to_say.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Products */}
          <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-3">🛍️ Recommended Products ({products.length})</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">No products recommended yet...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product, i) => (
                  <div key={i} className="border p-3 rounded">
                    <h4 className="font-medium">{product.product_name}</h4>
                    <p className="text-sm text-gray-600">{product.objective}</p>
                    <p className="text-sm">Premium: {product.premium_min_month_thb.toLocaleString()}-{product.premium_max_month_thb.toLocaleString()} THB/month</p>
                    <p className="text-sm">Age: {product.age_min}-{product.age_max} years</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Objection Alert */}
          {objectionDetected && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded md:col-span-2">
              <strong>⚠️ Objection Detected!</strong>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}