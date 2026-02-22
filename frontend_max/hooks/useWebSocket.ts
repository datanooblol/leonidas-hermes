import { useState, useEffect, useRef, useCallback } from 'react';
import { Stage } from '@/types';

function convertToWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, sample * 0x7FFF, true);
    offset += 2;
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingFile, setIsPlayingFile] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentStage, setCurrentStage] = useState<Stage>('Greet');
  const [showWarning, setShowWarning] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [customerInfo, setCustomerInfo] = useState<any>({});
  const [interests, setInterests] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  const [guide, setGuide] = useState<any>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileAudioContextRef = useRef<AudioContext | null>(null);
  const fileSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
      setIsRecording(false);
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    } else {
      setIsRecording(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { channelCount: 1 } 
        });
        streamRef.current = stream;
        
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        const buffer: Float32Array[] = [];
        const requiredSamples = audioContext.sampleRate * 2;
        
        processor.onaudioprocess = (event) => {
          const samples = event.inputBuffer.getChannelData(0);
          buffer.push(new Float32Array(samples));
          
          const totalSamples = buffer.reduce((sum, arr) => sum + arr.length, 0);
          
          if (totalSamples >= requiredSamples) {
            // ส่งเฉพาะส่วนที่ครบ requiredSamples
            let samplesUsed = 0;
            let usedChunks = 0;
            
            for (let i = 0; i < buffer.length; i++) {
              if (samplesUsed + buffer[i].length <= requiredSamples) {
                samplesUsed += buffer[i].length;
                usedChunks++;
              } else {
                break;
              }
            }
            
            const combined = new Float32Array(samplesUsed);
            let offset = 0;
            for (let i = 0; i < usedChunks; i++) {
              combined.set(buffer[i], offset);
              offset += buffer[i].length;
            }
            
            if (ws.current?.readyState === WebSocket.OPEN) {
              const wavBlob = convertToWav(combined, audioContext.sampleRate);
              ws.current.send(wavBlob);
            }
            
            // เอาส่วนที่ใช้แล้วออกจาก buffer
            buffer.splice(0, usedChunks);
          }
        };
        
        source.connect(processor);
        processor.connect(audioContext.destination);
        
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

  const playAudioFile = useCallback(async (file: File) => {
    setIsPlayingFile(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      fileAudioContextRef.current = audioContext;
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setAudioDuration(audioBuffer.duration);
      
      const source = audioContext.createBufferSource();
      fileSourceRef.current = source;
      source.buffer = audioBuffer;
      
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      
      const splitter = audioContext.createChannelSplitter(1);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const sampleRate = audioContext.sampleRate;
      const buffer: Float32Array[] = [];
      const requiredSamples = sampleRate * 2;
      let lastSendTime = 0;
      
      processor.onaudioprocess = (event) => {
        const samples = event.inputBuffer.getChannelData(0);
        const output = event.outputBuffer.getChannelData(0);
        output.set(samples);
        buffer.push(new Float32Array(samples));
        
        const totalSamples = buffer.reduce((sum, arr) => sum + arr.length, 0);
        const now = audioContext.currentTime;
        
        if (totalSamples >= requiredSamples && now - lastSendTime >= 2) {
          let samplesUsed = 0;
          let usedChunks = 0;
          
          for (let i = 0; i < buffer.length; i++) {
            if (samplesUsed + buffer[i].length <= requiredSamples) {
              samplesUsed += buffer[i].length;
              usedChunks++;
            } else {
              break;
            }
          }
          
          const combined = new Float32Array(samplesUsed);
          let offset = 0;
          for (let i = 0; i < usedChunks; i++) {
            combined.set(buffer[i], offset);
            offset += buffer[i].length;
          }
          
          if (ws.current?.readyState === WebSocket.OPEN) {
            const wavBlob = convertToWav(combined, sampleRate);
            ws.current.send(wavBlob);
          }
          
          buffer.splice(0, usedChunks);
          lastSendTime = now;
        }
      };
      
      source.connect(processor);
      processor.connect(analyser);
      analyser.connect(audioContext.destination);
      source.start(0);
      
      const updateProgress = () => {
        if (fileSourceRef.current && fileAudioContextRef.current) {
          const progress = (fileAudioContextRef.current.currentTime / audioBuffer.duration) * 100;
          setAudioProgress(Math.min(progress, 100));
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };
      animationFrameRef.current = requestAnimationFrame(updateProgress);
      
      source.onended = () => {
        setIsPlayingFile(false);
        setAudioProgress(0);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (fileAudioContextRef.current) {
          fileAudioContextRef.current.close();
          fileAudioContextRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error playing audio file:', error);
      setIsPlayingFile(false);
    }
  }, []);

  const uploadAudioFile = useCallback(async (file: File) => {
    // ไม่ต้องส่งเพราะ playAudioFile จะส่ง batch แล้ว
    console.log('Audio file ready to play and send in batches');
  }, []);

  const stopAudioFile = useCallback(() => {
    if (fileSourceRef.current) {
      fileSourceRef.current.stop();
      fileSourceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlayingFile(false);
    setAudioProgress(0);
  }, []);

  const resetSession = useCallback(() => {
    setIsRecording(false);
    setIsPlayingFile(false);
    setAudioProgress(0);
    setAudioDuration(0);
    setCurrentStage('Greet');
    setShowWarning(false);
    setTranscription('');
    setCustomerInfo({});
    setInterests({});
    setProducts([]);
    setGuide(null);
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (fileSourceRef.current) {
      fileSourceRef.current.stop();
      fileSourceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (fileAudioContextRef.current) {
      fileAudioContextRef.current.close();
      fileAudioContextRef.current = null;
    }
  }, []);

  return {
    isConnected,
    currentStage,
    isRecording,
    isPlayingFile,
    audioProgress,
    audioDuration,
    showWarning,
    setShowWarning,
    transcription,
    customerInfo,
    interests,
    products,
    guide,
    analyserNode: analyserRef.current,
    toggleRecording,
    playAudioFile,
    uploadAudioFile,
    stopAudioFile,
    handleStageChange,
    resetSession,
    sendMessage
  };
};