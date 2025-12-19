'use client'

import { useState } from 'react';
import AudioRecorder from '../components/AudioRecorder';
import TranscriptionDisplay from '../components/TranscriptionDisplay';

interface TranscriptionKey {
  key: string;
  chunkId: number;
  timestamp: number;
}

export default function Home() {
  const [transcriptionKeys, setTranscriptionKeys] = useState<TranscriptionKey[]>([]);

  const handleNewTranscriptionKey = (keyData: TranscriptionKey) => {
    setTranscriptionKeys(prev => [...prev, keyData]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Real-time Speech Transcription
          </h1>
          <p className="text-gray-600">
            Record audio in 2-second chunks and see transcriptions in real-time
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Audio Recorder Component */}
          <div>
            <AudioRecorder onNewTranscriptionKey={handleNewTranscriptionKey} />
          </div>

          {/* Transcription Display Component */}
          <div>
            <TranscriptionDisplay transcriptionKeys={transcriptionKeys} />
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <strong>1. Recording:</strong> Audio is captured in 2-second chunks
              </div>
              <div>
                <strong>2. Upload:</strong> Each chunk is sent to the backend immediately
              </div>
              <div>
                <strong>3. Processing:</strong> Backend processes audio asynchronously
              </div>
              <div>
                <strong>4. Display:</strong> Transcriptions appear as they're ready
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}