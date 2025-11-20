import AudioRecorder from '../organisms/AudioRecorder';

export default function RecordingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Audio Recording
        </h1>
        <AudioRecorder />
      </div>
    </div>
  );
}