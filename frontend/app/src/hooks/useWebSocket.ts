'use client';

import { useState, useRef, useCallback } from 'react';
import { TranscriptionResult, CustomerInfo, CustomerInterest, AgentChecklist, Guide, Product } from '../types';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({});
  const [customerInterest, setCustomerInterest] = useState<CustomerInterest>({});
  const [agentChecklist, setAgentChecklist] = useState<AgentChecklist>({});
  const [currentStage, setCurrentStage] = useState<string>('greeting');
  const [currentGuide, setCurrentGuide] = useState<Guide | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [objectionDetected, setObjectionDetected] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    wsRef.current = new WebSocket('ws://localhost:8000/ws');
    
    wsRef.current.onopen = () => {
      setIsConnected(true);
    };
    
    wsRef.current.onclose = () => {
      setIsConnected(false);
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 Received:', data);
      
      switch (data.type) {
        case 'transcription':
          if (data.transcription) {
            console.log('🎤 Transcription:', data.transcription);
            setTranscriptions(prev => [...prev, {
              text: data.transcription,
              timestamp: data.timestamp || Date.now(),
              chunkId: prev.length + 1
            }]);
          }
          break;
          
        case 'information':
          if (data.customer_information) {
            console.log('👤 Customer Info:', data.customer_information);
            console.log('Setting customerInfo state...');
            setCustomerInfo({...data.customer_information});
            setForceUpdate(prev => prev + 1);
            console.log('CustomerInfo state set');
          }
          break;
          
        case 'interest':
          if (data.customer_interest) {
            console.log('💡 Customer Interest:', data.customer_interest);
            setCustomerInterest({...data.customer_interest});
            setForceUpdate(prev => prev + 1);
          }
          break;
          
        case 'checklist':
          if (data.agent_checklist) {
            console.log('✅ Agent Checklist:', data.agent_checklist);
            setAgentChecklist({...data.agent_checklist});
            setForceUpdate(prev => prev + 1);
          }
          break;
          
        case 'guide':
          console.log('🗺️ Guide:', data);
          if (data.stage_name) {
            setCurrentStage(data.stage_name);
          }
          if (data.guide) {
            setCurrentGuide({...data.guide});
          }
          setForceUpdate(prev => prev + 1);
          break;
          
        case 'products':
          if (data.products) {
            console.log('🛍️ Products:', data.products);
            setProducts([...data.products]);
            setForceUpdate(prev => prev + 1);
          }
          break;
          
        case 'objection':
          console.log('⚠️ Objection detected');
          setObjectionDetected(true);
          break;
          
        case 'stage_change':
          if (data.stage) {
            console.log('🔄 Stage change:', data.stage);
            setCurrentStage(data.stage);
            setForceUpdate(prev => prev + 1);
          }
          break;
          
        default:
          console.log('❓ Unknown message:', data);
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
      wsRef.current.send(JSON.stringify({
        type: 'guide',
        stage_name: stage
      }));
    }
  }, []);

  const sendManualInfoUpdate = useCallback((data: Partial<CustomerInfo>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'manual_information_update',
        data
      }));
    }
  }, []);

  const sendManualInterestUpdate = useCallback((data: Partial<CustomerInterest>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'manual_interest_update',
        data
      }));
    }
  }, []);

  const sendChecklistUpdate = useCallback((completedItems: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'checklist_update',
        completed_items: completedItems
      }));
    }
  }, []);

  const resolveObjection = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'objection_resolved'
      }));
      setObjectionDetected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    setTranscriptions([]);
  }, []);

  return {
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
    sendAudio,
    sendStageUpdate,
    sendManualInfoUpdate,
    sendManualInterestUpdate,
    sendChecklistUpdate,
    resolveObjection,
    disconnect,
    forceUpdate
  };
}