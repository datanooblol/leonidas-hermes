'use client';

import { useState, useRef, useEffect } from 'react';
import RecordButton from '../atoms/RecordButton';
import StatusDisplay from '../atoms/StatusDisplay';

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionFiles, setSessionFiles] = useState<any[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);

  const CHUNK_DURATION = 2000; // 2 seconds per chunk

  useEffect(() => {
    loadSessions();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      
      // Group files by session
      const sessionMap = new Map();
      data.files.forEach((file: any) => {
        if (!sessionMap.has(file.session)) {
          sessionMap.set(file.session, {
            name: file.session,
            fileCount: 0,
            files: []
          });
        }
        sessionMap.get(file.session).fileCount++;
        sessionMap.get(file.session).files.push(file);
      });
      
      setSessions(Array.from(sessionMap.values()));
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const selectSession = (sessionName: string) => {
    const session = sessions.find(s => s.name === sessionName);
    setSelectedSession(sessionName);
    setSessionFiles(session ? session.files : []);
  };

  const saveChunk = async (chunks: Blob[]) => {
    const audioBlob = new Blob(chunks, { type: 'audio/wav' });
    
    // แปลงเป็น bytes
    const arrayBuffer = await audioBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('bytes', new Blob([bytes], { type: 'application/octet-stream' }));
    formData.append('sessionId', sessionIdRef.current);

    await fetch('/api/recording/save', {
      method: 'POST',
      body: formData,
    });
    
    // Reload sessions after saving
    loadSessions();
  };

  const startRecording = async () => {
    try {
      // Create session
      const sessionResponse = await fetch('/api/recording/start', {
        method: 'POST',
      });
      const { sessionId: newSessionId } = await sessionResponse.json();
      setSessionId(newSessionId);
      sessionIdRef.current = newSessionId;

      // Start recording
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
            saveChunk(chunks);
          }
        };

        mediaRecorder.start();
        
        // Stop and restart every CHUNK_DURATION
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            if (isRecordingRef.current) {
              startChunkRecording(); // Start next chunk
            }
          }
        }, CHUNK_DURATION);
      };

      startChunkRecording();
      setIsRecording(true);
      isRecordingRef.current = true;
      setDuration(0);

      // Start timer
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
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      <StatusDisplay 
        isRecording={isRecording} 
        duration={duration} 
        sessionId={sessionId}
      />
      <RecordButton 
        isRecording={isRecording}
        onStart={startRecording}
        onStop={stopRecording}
      />
      <div className="text-sm text-gray-500">
        Recording in 2-second WAV chunks
      </div>
      
      {/* Sessions List */}
      <div className="w-full max-w-md mt-8">
        {!selectedSession ? (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-500">Recording Sessions</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-sm text-gray-500">No sessions yet</p>
              ) : (
                sessions.map((session, index) => (
                  <div 
                    key={index} 
                    onClick={() => selectSession(session.name)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-500">{session.name}</p>
                      <p className="text-xs text-gray-500">{session.fileCount} files</p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <button 
                onClick={() => setSelectedSession(null)}
                className="text-gray-500 hover:text-blue-700 mr-3"
              >
                ← Back
              </button>
              <h3 className="text-lg font-semibold text-gray-500">{selectedSession}</h3>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sessionFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm font-medium flex-1 text-gray-500">{file.fileName}</p>
                  <audio controls className="w-32 h-6 ml-3" style={{transform: 'scale(0.8)'}}>
                    <source src={file.filePath} type="audio/wav" />
                  </audio>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}