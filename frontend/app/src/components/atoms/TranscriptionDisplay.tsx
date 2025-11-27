interface TranscriptionItem {
  text: string;
  timestamp: number;
  chunkId: number;
}

interface TranscriptionDisplayProps {
  transcriptions: TranscriptionItem[];
}

export default function TranscriptionDisplay({ transcriptions }: TranscriptionDisplayProps) {
  return (
    <div className="w-full bg-white rounded shadow p-1">
      <h3 className="text-xs font-semibold mb-1 text-gray-700">🎤 Live Transcription</h3>
      <div className="space-y-1 max-h-24 overflow-y-auto">
        {transcriptions.length === 0 ? (
          <p className="text-gray-500 text-center py-2 text-xs">Start recording...</p>
        ) : (
          transcriptions.map((item) => (
            <div key={`${item.timestamp}_${item.chunkId}`} className="bg-gray-50 p-1 rounded border-l-2 border-blue-400">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-gray-500">Chunk {item.chunkId}</span>
                <span className="text-xs text-gray-400">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-gray-800 text-xs">{item.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export type { TranscriptionItem };