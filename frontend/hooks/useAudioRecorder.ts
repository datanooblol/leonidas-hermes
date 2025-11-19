'use client'

import { useState, useRef, useCallback } from 'react';

interface TranscriptionKey {
  key: string;
  chunkId: number;
  timestamp: number;
}

export const useAudioRecorder = (onNewKey: (keyData: TranscriptionKey) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const uploadChunk = async (audioBlob: Blob, chunkId: number) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, `chunk_${chunkId}.wav`);
      
      const response = await fetch('http://localhost:8000/upload_chunk', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Uploaded chunk ${chunkId}, got key: ${data.transcription_key.slice(0, 8)}...`);
        
        // Pass key to transcription display component
        onNewKey({
          key: data.transcription_key,
          chunkId,
          timestamp: Date.now(),
        });
      } else {
        console.error('Upload failed:', response.statusText);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      streamRef.current = stream;
      // Try WAV first, fallback to WebM
      let mimeType = 'audio/wav';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm;codecs=opus';
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      let currentChunkId = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          uploadChunk(event.data, currentChunkId);
          currentChunkId++;
          setChunkCount(currentChunkId);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      // Start recording with 2-second chunks
      mediaRecorder.start(2000);
      setIsRecording(true);
      setChunkCount(0);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  }, [onNewKey]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [isRecording]);

  return {
    isRecording,
    chunkCount,
    startRecording,
    stopRecording,
  };
};