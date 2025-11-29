"use client";

import { useState } from "react";
import WebSocketAudioRecorder from "../../components/WebSocketAudioRecorder";
import WebSocketTranscriptionDisplay from "../../components/WebSocketTranscriptionDisplay";
import CustomerInfoPanel from "../../components/CustomerInfoPanel";
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
    | "products"
    | "stage_change"
    | "objection";
  timestamp?: string;
  transcription?: string;
  customer_information?: any;
  customer_interest?: any;
  agent_checklist?: any;
  guide?: any;
  products?: any;
  stage_name?: string;
  status?: string;
  stage?: string;
  reason?: string;
  previous_stage?: string;
}

export default function WebSocketPage() {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [websocket, setWebSocket] = useState<WebSocket | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>("greeting");
  const [inObjection, setInObjection] = useState<boolean>(false);
  const [objectionData, setObjectionData] = useState<any>(null);

  const handleNewMessage = (message: WebSocketMessage) => {
    if (message.type === "stage_change") {
      setSelectedStage(message.stage!);
      if (message.reason === "objection_resolved") {
        setInObjection(false);
        setObjectionData(null);
      }
    } else if (message.type === "objection") {
      setInObjection(true);
      setObjectionData(message);
    }
    setMessages((prev) => [...prev, message]);
  };

  const handleWebSocketReady = (ws: WebSocket) => {
    setWebSocket(ws);
  };

  const handleStageChange = (stage: string) => {
    if (!inObjection) {
      setSelectedStage(stage);
    }
  };

  const handleObjectionResolved = () => {
    if (websocket?.readyState === WebSocket.OPEN) {
      websocket.send(
        JSON.stringify({
          type: "objection_resolved",
        })
      );
    }
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

        <div className="flex flex-col h-[80vh] gap-6">
          {/* Top Row */}
          <div className="flex gap-6 h-1/2">
            {/* Left Top - Customer Info & Interest */}
            <div className="flex-1">
              <CustomerInfoPanel
                information={latestInfo?.customer_information || null}
                interest={latestInterest?.customer_interest || null}
                websocket={websocket}
              />
            </div>

            {/* Right Top - Stage Guide Panel */}
            <div className="flex-1">
              <StageGuidePanel
                websocket={websocket}
                messages={messages}
                selectedStage={selectedStage}
                onStageChange={handleStageChange}
                inObjection={inObjection}
                objectionData={objectionData}
                onObjectionResolved={handleObjectionResolved}
              />
            </div>
          </div>

          {/* Bottom - Product Cards */}
          <div className="h-1/2">
            <ProductCard products={latestProducts?.products || null} />
          </div>
        </div>
      </div>
    </div>
  );
}
