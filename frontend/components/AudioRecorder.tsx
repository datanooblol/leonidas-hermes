'use client'

import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface TranscriptionKey {
  key: string;
  chunkId: number;
  timestamp: number;
}

interface AudioRecorderProps {
  onNewTranscriptionKey: (keyData: TranscriptionKey) => void;
}

export default function AudioRecorder({ onNewTranscriptionKey }: AudioRecorderProps) {
  const { isRecording, chunkCount, startRecording, stopRecording } = useAudioRecorder(onNewTranscriptionKey);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Audio Recorder</h2>
      
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRecording ? '🛑 Stop Recording' : '🎤 Start Recording'}
        </button>
        
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-600 font-medium">Recording...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600">Status</div>
          <div className="font-semibold">
            {isRecording ? 'Recording' : 'Ready'}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600">Chunks Uploaded</div>
          <div className="font-semibold">{chunkCount}</div>
        </div>
      </div>

      {!isRecording && chunkCount === 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
          💡 Click "Start Recording" to begin. Audio will be processed in 2-second chunks automatically.
        </div>
      )}
    </div>
  );
}