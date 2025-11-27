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
      console.log('Starting recording...');
      connect();
      console.log('WebSocket connected:', isConnected);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      streamRef.current = stream;
      
      const startChunkRecording = () => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          if (chunks.length > 0) {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            
            try {
              // Convert to mono WAV
              const arrayBuffer = await audioBlob.arrayBuffer();
              const audioContext = new AudioContext({ sampleRate: 16000 });
              const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
              
              // Create mono buffer
              const monoBuffer = audioContext.createBuffer(1, audioBuffer.length, 16000);
              const monoData = monoBuffer.getChannelData(0);
              
              if (audioBuffer.numberOfChannels === 1) {
                monoData.set(audioBuffer.getChannelData(0));
              } else {
                // Mix stereo to mono
                const leftChannel = audioBuffer.getChannelData(0);
                const rightChannel = audioBuffer.getChannelData(1);
                for (let i = 0; i < audioBuffer.length; i++) {
                  monoData[i] = (leftChannel[i] + rightChannel[i]) / 2;
                }
              }
              
              // Convert to WAV
              const wav = audioBufferToWav(monoBuffer);
              const monoBlob = new Blob([wav], { type: 'audio/wav' });
              console.log('Sending mono audio blob, size:', monoBlob.size);
              sendAudio(monoBlob);
            } catch (error) {
              console.error('Audio conversion error:', error);
              console.log('Sending original blob as fallback, size:', audioBlob.size);
              sendAudio(audioBlob); // Fallback
            }
          }
        };
        
        // WAV conversion helper
        const audioBufferToWav = (buffer: AudioBuffer) => {
          const length = buffer.length;
          const arrayBuffer = new ArrayBuffer(44 + length * 2);
          const view = new DataView(arrayBuffer);
          
          // WAV header
          const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
              view.setUint8(offset + i, string.charCodeAt(i));
            }
          };
          
          writeString(0, 'RIFF');
          view.setUint32(4, 36 + length * 2, true);
          writeString(8, 'WAVE');
          writeString(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, 1, true);
          view.setUint32(24, 16000, true);
          view.setUint32(28, 32000, true);
          view.setUint16(32, 2, true);
          view.setUint16(34, 16, true);
          writeString(36, 'data');
          view.setUint32(40, length * 2, true);
          
          // Convert float32 to int16
          const channelData = buffer.getChannelData(0);
          let offset = 44;
          for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
          }
          
          return arrayBuffer;
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

  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <>
      {/* Floating Record Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isRecording ? (
            <div className="w-6 h-6 bg-white rounded-sm mx-auto"></div>
          ) : (
            <div className="w-0 h-0 border-l-8 border-l-white border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
          )}
        </button>
      </div>

      {/* Debug Info */}
      <div className="fixed top-4 left-4 z-50 bg-black text-white p-2 rounded text-xs">
        <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
        <div>Recording: {isRecording ? 'Yes' : 'No'}</div>
        <div>Transcriptions: {transcriptions.length}</div>
      </div>

      {/* Transcript Toggle Button */}
      {transcriptions.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="px-3 py-2 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 text-xs"
          >
            📝 {showTranscript ? 'Hide' : 'Show'} Transcript
          </button>
        </div>
      )}

      {/* Transcription Modal */}
      {showTranscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="text-sm font-semibold">🎤 Live Transcription</h3>
              <button
                onClick={() => setShowTranscript(false)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ×
              </button>
            </div>
            <div className="p-3 max-h-80 overflow-y-auto">
              {transcriptions.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">No transcriptions yet...</p>
              ) : (
                <div className="space-y-2">
                  {transcriptions.map((item) => (
                    <div key={`${item.timestamp}_${item.chunkId}`} className="bg-gray-50 p-2 rounded border-l-2 border-blue-400">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs text-gray-500">Chunk {item.chunkId}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-800 text-sm">{item.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}