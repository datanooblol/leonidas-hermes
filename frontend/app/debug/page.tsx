"use client";

import { useState } from "react";
import WebSocketAudioRecorder from "../../components/WebSocketAudioRecorder";
import WebSocketTranscriptionDisplay from "../../components/WebSocketTranscriptionDisplay";
import DebugComponent from "../../components/DebugComponent";
import ProductCard from "../../components/ProductCard";
import StageSelector from "../../components/StageSelector";
import TranscriptionFloatingIcon from "../../components/TranscriptionFloatingIcon";
import StageGuidePanel from "../../components/StageGuidePanel";

interface WebSocketMessage {
  type?:
    | "transcription"
    | "information"
    | "interest"
    | "checklist"
    | "guide"
    | "products";
  timestamp?: string;
  transcription?: string;
  customer_information?: any;
  customer_interest?: any;
  agent_checklist?: any;
  guide?: any;
  products?: any;
  stage_name?: string;
  status?: string; // Add this line
}

export default function WebSocketPage() {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [websocket, setWebSocket] = useState<WebSocket | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>("greeting");

  const handleNewMessage = (message: WebSocketMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleWebSocketReady = (ws: WebSocket) => {
    setWebSocket(ws);
  };

  const handleStageChange = (stage: string) => {
    setSelectedStage(stage);
  };

  const transcriptions = messages.filter((m) => m.type === "transcription");
  const latestInfo = messages.filter((m) => m.type === "information").pop();
  const latestInterest = messages.filter((m) => m.type === "interest").pop();
  const latestChecklist = messages.filter((m) => m.type === "checklist").pop();
  const latestGuide = messages.filter((m) => m.type === "guide").pop();
  const latestProducts = messages.filter((m) => m.type === "products").pop();

  // Only show guide if it matches selected stage
  const shouldShowGuide = latestGuide?.stage_name === selectedStage;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            WebSocket Debug Page
          </h1>
        </header>

        <WebSocketAudioRecorder
          onNewTranscription={handleNewMessage}
          onWebSocketReady={handleWebSocketReady}
        />

        <TranscriptionFloatingIcon transcriptions={transcriptions} />

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Data Components */}
          <div className="space-y-4">
            <DebugComponent
              type="information"
              data={latestInfo?.customer_information || null}
            />
            <DebugComponent
              type="interest"
              data={latestInterest?.customer_interest || null}
            />
            <ProductCard
              products={latestProducts?.products || null}
            />
          </div>
          
          {/* Right Column - Stage Guide Panel */}
          <div>
            <StageGuidePanel
              websocket={websocket}
              messages={messages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
