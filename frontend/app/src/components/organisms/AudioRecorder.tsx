'use client';

import { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import RecordButton from '../atoms/RecordButton';
import StatusDisplay from '../atoms/StatusDisplay';
import TranscriptionDisplay from '../atoms/TranscriptionDisplay';

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const { isConnected, transcriptions, connect, sendAudio, disconnect } = useWebSocket();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);

  const CHUNK_DURATION = 2000; // 2 seconds per chunk

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);



  const startRecording = async () => {
    try {
      connect();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const startChunkRecording = () => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          if (chunks.length > 0) {
            const audioBlob = new Blob(chunks, { type: 'audio/wav' });
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
        }, CHUNK_DURATION);
      };

      startChunkRecording();
      setIsRecording(true);
      isRecordingRef.current = true;
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      disconnect();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      {/* Transcription Display */}
      <StatusDisplay 
        isRecording={isRecording} 
        duration={duration} 
        sessionId={isConnected ? 'Connected' : 'Disconnected'}
      />
      <RecordButton 
        isRecording={isRecording}
        onStart={startRecording}
        onStop={stopRecording}
      />
      <div className="text-sm text-gray-500">
        {isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
      </div>
      <TranscriptionDisplay transcriptions={transcriptions} />
    </div>
  );
}