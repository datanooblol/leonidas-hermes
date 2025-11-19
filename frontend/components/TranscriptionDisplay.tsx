'use client'

import { useState, useEffect } from 'react';

interface TranscriptionKey {
  key: string;
  chunkId: number;
  timestamp: number;
}

interface Transcription {
  key: string;
  chunkId: number;
  text: string;
  timestamp: number;
}

interface TranscriptionDisplayProps {
  transcriptionKeys: TranscriptionKey[];
}

export default function TranscriptionDisplay({ transcriptionKeys }: TranscriptionDisplayProps) {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [processedKeys, setProcessedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Poll for new transcriptions
    const pollTranscriptions = async () => {
      for (const keyData of transcriptionKeys) {
        if (!processedKeys.has(keyData.key)) {
          setProcessedKeys(prev => new Set(prev).add(keyData.key));
          pollForTranscription(keyData);
        }
      }
    };

    pollTranscriptions();
  }, [transcriptionKeys, processedKeys]);

  const pollForTranscription = async (keyData: TranscriptionKey) => {
    const maxAttempts = 30; // 30 attempts * 200ms = 6 seconds max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:8000/get_transcription/${keyData.key}`);
        const data = await response.json();

        if (data.status === 'ready') {
          setTranscriptions(prev => [...prev, {
            key: keyData.key,
            chunkId: keyData.chunkId,
            text: data.text,
            timestamp: keyData.timestamp,
          }]);
          console.log(`Got transcription for chunk ${keyData.chunkId}: ${data.text}`);
          return; // Stop polling for this key
        } else if (data.status === 'processing' && attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 200); // Poll every 200ms
        } else {
          // Timeout or error
          console.log(`Transcription timeout for chunk ${keyData.chunkId}`);
          return; // Stop polling for this key
        }
      } catch (error) {
        console.error('Error polling transcription:', error);
        return; // Stop polling for this key
      }
    };

    poll();
  };

  const clearTranscriptions = () => {
    setTranscriptions([]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Transcriptions</h2>
        {transcriptions.length > 0 && (
          <button
            onClick={clearTranscriptions}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transcriptions.length === 0 && processedKeys.size === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No transcriptions yet. Start recording to see results here.
          </div>
        ) : (
          <>
            {transcriptions
              .sort((a, b) => a.chunkId - b.chunkId)
              .map((transcription) => (
                <div key={transcription.key} className="bg-gray-50 p-3 rounded border-l-4 border-green-400">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-500 font-medium">
                      Chunk {transcription.chunkId}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(transcription.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-800">{transcription.text}</div>
                </div>
              ))}
            
            {processedKeys.size > transcriptions.length && (
              <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-yellow-700 text-sm">
                    Processing {processedKeys.size - transcriptions.length} chunk{processedKeys.size - transcriptions.length > 1 ? 's' : ''}...
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Total: {transcriptions.length} transcription{transcriptions.length !== 1 ? 's' : ''}
        {processedKeys.size > transcriptions.length && ` • ${processedKeys.size - transcriptions.length} processing`}
      </div>
    </div>
  );
}