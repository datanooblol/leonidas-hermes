interface TranscriptionItem {
  id: string;
  text: string;
  timestamp: number;
  chunkId: number;
}

interface TranscriptionDisplayProps {
  transcriptions: TranscriptionItem[];
}

export default function TranscriptionDisplay({ transcriptions }: TranscriptionDisplayProps) {
  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">🎤 Live Transcription</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {transcriptions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Start recording to see transcriptions...</p>
        ) : (
          transcriptions.map((item) => (
            <div key={item.id} className="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-gray-500">Chunk {item.chunkId}</span>
                <span className="text-xs text-gray-400">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-gray-800">{item.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export type { TranscriptionItem };