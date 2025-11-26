"use client";

import { useState, useEffect } from "react";

interface StageGuidePanelProps {
  websocket: WebSocket | null;
  messages: any[];
}

export default function StageGuidePanel({ websocket, messages }: StageGuidePanelProps) {
  const [selectedStage, setSelectedStage] = useState<string>("greeting");
  const [backendMessage, setBackendMessage] = useState<string>("");

  const stages = ["greeting", "discovery", "pitch", "closing"];

  // Listen for backend responses
  useEffect(() => {
    const latestGuideMessage = messages.filter(m => m.type === "guide").pop();
    if (latestGuideMessage?.message) {
      setBackendMessage(latestGuideMessage.message);
    }
  }, [messages]);

  const handleStageChange = (stage: string) => {
    setSelectedStage(stage);
    
    if (websocket?.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: "guide",
        stage_name: stage
      }));
      console.log(`Sent stage: ${stage}`);
    }
  };

  // Get latest guide data
  const latestGuide = messages.filter((m) => m.type === "guide").pop();
  const shouldShowGuide = latestGuide?.stage_name === selectedStage;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      {/* Stage Selector Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3 text-gray-800">Stage Selector</h3>
        <div className="flex gap-4 mb-3">
          {stages.map((stage) => (
            <label key={stage} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="stage"
                value={stage}
                checked={selectedStage === stage}
                onChange={() => handleStageChange(stage)}
                className="mr-2"
              />
              <span className="capitalize">{stage}</span>
            </label>
          ))}
        </div>
        {backendMessage && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            Backend: {backendMessage}
          </div>
        )}
      </div>

      {/* Guide Section */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-lg mb-3 capitalize text-gray-800">
          Guide
          {shouldShowGuide && latestGuide?.stage_name && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Stage: {latestGuide.stage_name}
            </span>
          )}
        </h3>
        <div className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64 text-gray-700">
          <pre>
            {shouldShowGuide && latestGuide?.guide 
              ? JSON.stringify(latestGuide.guide, null, 2)
              : "null"
            }
          </pre>
        </div>
      </div>
    </div>
  );
}