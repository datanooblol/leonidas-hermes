interface StatusDisplayProps {
  isRecording: boolean;
  duration: number;
  sessionId?: string;
}

export default function StatusDisplay({ isRecording, duration, sessionId }: StatusDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center space-y-2">
      <div className={`text-lg font-semibold ${isRecording ? 'text-red-500' : 'text-gray-500'}`}>
        {isRecording ? '🔴 Recording...' : '⏹ Ready'}
      </div>
      <div className="text-2xl font-mono">
        {formatTime(duration)}
      </div>
      {sessionId && (
        <div className="text-sm text-gray-600">
          Session: {sessionId}
        </div>
      )}
    </div>
  );
}