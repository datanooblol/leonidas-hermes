"use client";

import { useState } from "react";
import WebSocketAudioRecorder from "../../components/WebSocketAudioRecorder";
import WebSocketTranscriptionDisplay from "../../components/WebSocketTranscriptionDisplay";
import WebSocketSummaryDisplay from "../../components/WebSocketSummaryDisplay";
import CustomerInfoDisplay from "../../components/CustomerInfoDisplay";

interface WebSocketMessage {
  type?: "transcription" | "summary" | "information";
  timestamp?: string;
  transcription?: string;
  summary?: string;
  customer_information?: any;
  status?: string;
  error?: string;
}

export default function WebSocketPage() {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  const handleNewMessage = (message: WebSocketMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const transcriptions = messages.filter((m) => m.type === "transcription");
  const summaries = messages.filter((m) => m.type === "summary");
  // const customerInfo =
  //   messages.find((m) => m.type === "information")?.customer_information || {};
  const customerInfo =
    messages.filter((m) => m.type === "information").pop()
      ?.customer_information || {};
  // Add this to see what messages are being received:
  // console.log("All messages:", messages);
  // console.log("Customer info:", customerInfo);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            WebSocket Real-time Transcription
          </h1>
          <p className="text-gray-600">
            Stream audio continuously and see transcriptions in real-time via
            WebSocket
          </p>
        </header>

        {/* Floating Microphone */}
        <WebSocketAudioRecorder onNewTranscription={handleNewMessage} />

        {/* Main Layout - Full Width */}
        <div className="w-full px-4">
          <div className="grid grid-cols-2 gap-6 w-full">
            {/* Left Column - Transcription & Summary */}
            <div className="space-y-6">
              <WebSocketTranscriptionDisplay transcriptions={transcriptions} />
              <WebSocketSummaryDisplay summaries={summaries} />
            </div>

            {/* Right Column - Customer Information */}
            <div>
              <CustomerInfoDisplay customerInfo={customerInfo} />
            </div>
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
