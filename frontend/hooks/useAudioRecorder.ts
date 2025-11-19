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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const uploadChunkWithFormat = async (audioBlob: Blob, chunkId: number, fileExt: string) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, `chunk_${chunkId}${fileExt}`);
      
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
      // Use WebM since WAV is not supported in most browsers
      let mimeType = 'audio/webm;codecs=opus';
      let fileExt = '.webm';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      let currentChunkId = 0;

      let chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        uploadChunkWithFormat(blob, currentChunkId, fileExt);
        currentChunkId++;
        setChunkCount(currentChunkId);
        chunks = [];
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      // Start first recording
      mediaRecorder.start();
      setIsRecording(true);
      setChunkCount(0);
      
      // Auto stop/start every 2 seconds
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
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  }, [onNewKey]);

  const stopRecording = useCallback(() => {
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
  }, [isRecording]);

  return {
    isRecording,
    chunkCount,
    startRecording,
    stopRecording,
  };
};