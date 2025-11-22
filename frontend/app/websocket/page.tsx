"use client";

import { useState } from "react";
import WebSocketAudioRecorder from "../../components/WebSocketAudioRecorder";
import WebSocketTranscriptionDisplay from "../../components/WebSocketTranscriptionDisplay";
import WebSocketSummaryDisplay from "../../components/WebSocketSummaryDisplay";

interface WebSocketMessage {
  type?: "transcription" | "summary";
  timestamp?: string;
  transcription?: string;
  summary?: string;
  status?: string;
  error?: string;
}

export default function WebSocketPage() {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  const handleNewMessage = (message: WebSocketMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const transcriptions = messages.filter(m => m.type === "transcription");
  const summaries = messages.filter(m => m.type === "summary");

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            WebSocket Real-time Transcription
          </h1>
          <p className="text-gray-600">
            Stream audio continuously and see transcriptions in real-time via
            WebSocket
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* WebSocket Audio Recorder Component */}
          <div>
            <WebSocketAudioRecorder
              onNewTranscription={handleNewMessage}
            />
          </div>

          {/* WebSocket Transcription Display Component */}
          <div>
            <WebSocketTranscriptionDisplay transcriptions={transcriptions} />
          </div>

          {/* WebSocket Summary Display Component */}
          <div>
            <WebSocketSummaryDisplay summaries={summaries} />
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">How WebSocket works:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <strong>1. Connection:</strong> Establishes WebSocket connection
                to backend
              </div>
              <div>
                <strong>2. Streaming:</strong> Audio data is sent continuously
                in real-time
              </div>
              <div>
                <strong>3. Processing:</strong> Backend processes audio and
                responds immediately
              </div>
              <div>
                <strong>4. Display:</strong> Transcriptions appear instantly as
                they arrive
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
