'use client'

import { useState, useRef } from 'react';

interface TranscriptionResult {
  timestamp: string;
  transcription: string;
  status: string;
}

interface WebSocketAudioRecorderProps {
  onNewTranscription: (result: TranscriptionResult) => void;
}

export default function WebSocketAudioRecorder({ onNewTranscription }: WebSocketAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };
    
    ws.onmessage = (event) => {
      const result = JSON.parse(event.data);
      onNewTranscription(result);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    websocketRef.current = ws;
  };

  const startRecording = async () => {
    try {
      // Connect WebSocket first
      if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
        }
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus' 
      });
      
      mediaRecorderRef.current = mediaRecorder;

      let chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (chunks.length > 0 && websocketRef.current?.readyState === WebSocket.OPEN) {
          const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
          websocketRef.current.send(blob);
          chunks = [];
        }
      };

      // Start first recording
      mediaRecorder.start();
      
      // Auto stop/start every 2 seconds for valid chunks
      intervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
              mediaRecorderRef.current.start();
            }
          }, 100);
        }
      }, 2000);
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">WebSocket Audio Recorder</h2>
      
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRecording ? '🛑 Stop Streaming' : '🎤 Start Streaming'}
        </button>
        
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-600 font-medium">Streaming...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600">Connection</div>
          <div className="font-semibold">
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600">Status</div>
          <div className="font-semibold">
            {isRecording ? 'Streaming' : 'Ready'}
          </div>
        </div>
      </div>

      {!isRecording && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
          💡 Click "Start Streaming" to begin real-time audio streaming via WebSocket.
        </div>
      )}
    </div>
  );
}