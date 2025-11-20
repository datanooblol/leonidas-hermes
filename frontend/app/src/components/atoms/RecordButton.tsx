interface RecordButtonProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function RecordButton({ isRecording, onStart, onStop }: RecordButtonProps) {
  return (
    <button
      onClick={isRecording ? onStop : onStart}
      className={`px-6 py-3 rounded-lg font-semibold ${
        isRecording 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-gray-500 hover:bg-gray-800 text-white'
      }`}
    >
      {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
    </button>
  );
}