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
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
          // Map backend stage names to frontend
          const stageMap: Record<string, Stage> = {
            'greeting': 'Greet',
            'discovery': 'Discover', 
            'pitch': 'Pitch',
            'closing': 'Closing'
          };
          if (data.stage_name) {
            setCurrentStage(stageMap[data.stage_name] || 'Greet');
          }
          setGuide(data.guide);
          break;
        case 'products':
          setProducts(data.products);
          break;
        case 'objection':
          console.log('🚨 Objection detected:', data);
          setShowWarning(true);
          // Set objection guide even if empty, with fallback data
          const objectionGuide = data.guide || {
            action: 'Handle customer objection',
            explanation: 'Customer has raised a concern that needs to be addressed',
            lines_to_say: ['I understand your concern', 'Let me address that for you'],
            signals: ['objection_detected']
          };
          setGuide(objectionGuide);
          break;
        case 'objection_resolved':
          console.log('✅ Objection resolved');
          setShowWarning(false);
          setGuide(null);
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
      // Stop recording
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (mediaRecorder.current) {
        mediaRecorder.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    } else {
      // Start recording
      setIsRecording(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { sampleRate: 44100, channelCount: 1 } 
        });
        streamRef.current = stream;
        
        mediaRecorder.current = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        let chunks: Blob[] = [];
        
        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        
        mediaRecorder.current.onstop = () => {
          if (chunks.length > 0 && ws.current?.readyState === WebSocket.OPEN) {
            const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
            ws.current.send(blob);
            chunks = [];
          }
        };
        
        mediaRecorder.current.start();
        
        // Send audio chunks every 2 seconds
        intervalRef.current = setInterval(() => {
          if (mediaRecorder.current?.state === 'recording') {
            mediaRecorder.current.stop();
            setTimeout(() => {
              if (mediaRecorder.current?.state === 'inactive') {
                mediaRecorder.current.start();
              }
            }, 100);
          }
        }, 2000);
        
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setIsRecording(false);
      }
    }
  }, [isRecording]);

  const handleStageChange = useCallback((stage: Stage) => {
    // Map frontend stage names to backend
    const stageMap: Record<Stage, string> = {
      'Greet': 'greeting',
      'Discover': 'discovery',
      'Pitch': 'pitch', 
      'Closing': 'closing'
    };
    sendMessage({
      type: 'guide',
      data: { stage_name: stageMap[stage] }
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
    
    // Clean up recording
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
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
    sendMessage
  };
};