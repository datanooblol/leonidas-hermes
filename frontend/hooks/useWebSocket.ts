import { useState, useEffect, useRef, useCallback } from 'react';
import { Stage } from '@/types';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage>('Greet');
  const [showWarning, setShowWarning] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [customerInfo, setCustomerInfo] = useState<any>({});
  const [interests, setInterests] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  const [guide, setGuide] = useState<any>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/ws');
    
    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'transcription':
          setTranscription(data.transcription);
          break;
        case 'information':
          setCustomerInfo(data.customer_information);
          break;
        case 'interest':
          setInterests(data.customer_interest);
          break;
        case 'guide':
          setCurrentStage(data.stage_name as Stage);
          setGuide(data.guide);
          break;
        case 'products':
          setProducts(data.products);
          break;
        case 'objection':
          setShowWarning(true);
          setGuide(data.guide);
          break;
        case 'objection_resolved':
          setShowWarning(false);
          break;
      }
    };

    return () => ws.current?.close();
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      setIsRecording(false);
      mediaRecorder.current?.stop();
    } else {
      setIsRecording(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        
        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0 && ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(event.data);
          }
        };
        
        mediaRecorder.current.start(2000);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setIsRecording(false);
      }
    }
  }, [isRecording]);

  const handleStageChange = useCallback((stage: Stage) => {
    sendMessage({
      type: 'guide',
      data: { stage_name: stage.toLowerCase() }
    });
  }, [sendMessage]);

  const resetSession = useCallback(() => {
    setIsRecording(false);
    setCurrentStage('Greet');
    setShowWarning(false);
    setTranscription('');
    setCustomerInfo({});
    setInterests({});
    setProducts([]);
    setGuide(null);
    mediaRecorder.current?.stop();
  }, []);

  return {
    isConnected,
    currentStage,
    isRecording,
    showWarning,
    setShowWarning,
    transcription,
    customerInfo,
    interests,
    products,
    guide,
    toggleRecording,
    handleStageChange,
    resetSession,
    sendMessage,
    progress: 0
  };
};