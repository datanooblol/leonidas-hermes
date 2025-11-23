'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface TranscriptionResult {
  text: string;
  timestamp: number;
  chunkId: number;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    wsRef.current = new WebSocket('ws://localhost:8000/ws');
    
    wsRef.current.onopen = () => setIsConnected(true);
    wsRef.current.onclose = () => setIsConnected(false);
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.transcription) {
        setTranscriptions(prev => [...prev, {
          text: data.transcription,
          timestamp: data.timestamp || Date.now(),
          chunkId: data.chunkId || prev.length + 1
        }]);
      }
    };
  }, []);

  const sendAudio = useCallback((audioData: Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(audioData);
    }
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    setTranscriptions([]);
  }, []);

  useEffect(() => {
    return () => wsRef.current?.close();
  }, []);

  return { isConnected, transcriptions, connect, sendAudio, disconnect };
}