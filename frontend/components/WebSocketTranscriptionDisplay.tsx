'use client'

interface TranscriptionResult {
  timestamp: string;
  transcription: string;
  status: string;
}

interface WebSocketTranscriptionDisplayProps {
  transcriptions: TranscriptionResult[];
}

export default function WebSocketTranscriptionDisplay({ transcriptions }: WebSocketTranscriptionDisplayProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Real-time Transcriptions</h2>
      
      <div className="mb-4 text-sm text-gray-600">
        Total transcriptions: {transcriptions.length}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transcriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎤</div>
            <p>No transcriptions yet</p>
            <p className="text-sm">Start streaming to see real-time results</p>
          </div>
        ) : (
          transcriptions.map((result, index) => (
            <div 
              key={result.timestamp} 
              className={`p-3 rounded-lg border-l-4 ${
                result.status === 'success' 
                  ? 'bg-green-50 border-green-400' 
                  : 'bg-red-50 border-red-400'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500">
                  #{index + 1} • {new Date(parseInt(result.timestamp)).toLocaleTimeString()}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  result.status === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.status}
                </span>
              </div>
              
              <div className="text-gray-800">
                {result.status === 'success' ? result.transcription : `Error: ${result.error || 'Unknown error'}`}
              </div>
            </div>
          ))
        )}
      </div>

      {transcriptions.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
          💡 Transcriptions appear in real-time as audio is processed via WebSocket
        </div>
      )}
    </div>
  );
}