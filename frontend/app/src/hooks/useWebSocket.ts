'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { TranscriptionResult, CustomerInfo, CustomerInterest } from '../types';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({});
  const [customerInterest, setCustomerInterest] = useState<CustomerInterest>({});
  const [currentStage, setCurrentStage] = useState<string>('Greet');
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log('Attempting WebSocket connection to ws://localhost:8000/ws');
    wsRef.current = new WebSocket('ws://localhost:8000/ws');
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
    };
    
    wsRef.current.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'transcription' && data.transcription) {
        setTranscriptions(prev => [...prev, {
          text: data.transcription,
          timestamp: data.timestamp || Date.now(),
          chunkId: data.chunkId || prev.length + 1
        }]);
      } else if (data.type === 'information' && data.customer_information) {
        setCustomerInfo(data.customer_information);
      } else if (data.type === 'interest' && data.customer_interest) {
        setCustomerInterest(data.customer_interest);
      }
    };
  }, []);

  const sendAudio = useCallback((audioData: Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(audioData);
    }
  }, []);

  const sendStageUpdate = useCallback((stage: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'stage_update',
        stage: stage
      });
      wsRef.current.send(message);
    }
  }, []);

  const sendChecklistUpdate = useCallback((completedItems: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'checklist_update',
        completed_items: completedItems
      });
      wsRef.current.send(message);
    }
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    setTranscriptions([]);
  }, []);

  useEffect(() => {
    return () => wsRef.current?.close();
  }, []);

  return { isConnected, transcriptions, customerInfo, customerInterest, currentStage, setCurrentStage, connect, sendAudio, sendStageUpdate, sendChecklistUpdate, disconnect };
}