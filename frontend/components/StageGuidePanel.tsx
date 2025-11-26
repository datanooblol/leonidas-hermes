"use client";

import { useState, useEffect } from "react";

interface StageGuidePanelProps {
  websocket: WebSocket | null;
  messages: any[];
  selectedStage?: string;
  onStageChange?: (stage: string) => void;
  inObjection?: boolean;
  objectionData?: any;
  onObjectionResolved?: () => void;
}

export default function StageGuidePanel({ websocket, messages, selectedStage: propSelectedStage, onStageChange, inObjection, objectionData, onObjectionResolved }: StageGuidePanelProps) {
  const [selectedStage, setSelectedStage] = useState<string>(propSelectedStage || "greeting");

  // Sync with parent state when prop changes
  useEffect(() => {
    if (propSelectedStage) {
      setSelectedStage(propSelectedStage);
    }
  }, [propSelectedStage]);
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
    if (inObjection) return; // Prevent stage changes during objection
    
    setSelectedStage(stage);
    onStageChange?.(stage);
    
    if (websocket?.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: "guide",
        stage_name: stage
      }));
      console.log(`Sent stage: ${stage}`);
    }
  };

  // Get latest guide data or objection data
  const latestGuide = messages.filter((m) => m.type === "guide").pop();
  const shouldShowGuide = latestGuide?.stage_name === selectedStage;
  
  // Use objection data if in objection, otherwise use regular guide
  const displayGuide = inObjection ? objectionData?.guide : latestGuide?.guide;
  const shouldShowContent = inObjection || shouldShowGuide;

  return (
    <div className={`p-4 rounded-lg shadow-sm border ${
      inObjection ? 'bg-red-50 border-red-200' : 'bg-white'
    }`}>
      {/* Stage Selector Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3 text-gray-800">
          {inObjection ? '🚨 OBJECTION DETECTED' : 'Stage Selector'}
        </h3>
        {!inObjection && (
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
        )}
        
        {inObjection && (
          <div className="mb-3">
            <button
              onClick={onObjectionResolved}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Mark Resolved
            </button>
            <p className="text-sm text-red-700 mt-2">
              Will return to: {objectionData?.previous_stage}
            </p>
          </div>
        )}
        {backendMessage && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            Backend: {backendMessage}
          </div>
        )}
      </div>

      {/* Guide Section */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-lg mb-3 capitalize text-gray-800">
          {inObjection ? 'Objection Handling' : 'Guide'}
          {!inObjection && shouldShowGuide && latestGuide?.stage_name && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Stage: {latestGuide.stage_name}
            </span>
          )}
        </h3>
        
        {shouldShowContent && displayGuide ? (
          <div className="space-y-4">
            {/* Action */}
            {displayGuide.action && (
              <div className={`p-3 rounded ${
                inObjection ? 'bg-red-100' : 'bg-blue-50'
              }`}>
                <h4 className={`font-medium mb-1 ${
                  inObjection ? 'text-red-900' : 'text-blue-900'
                }`}>Action</h4>
                <p className={inObjection ? 'text-red-800' : 'text-blue-800'}>
                  {displayGuide.action}
                </p>
              </div>
            )}
            
            {/* Explanation */}
            {displayGuide.explanation && (
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-gray-900 mb-1">Explanation</h4>
                <p className="text-gray-700">{displayGuide.explanation}</p>
              </div>
            )}
            
            {/* Lines to Say */}
            {displayGuide.lines_to_say && displayGuide.lines_to_say.length > 0 && (
              <div className="bg-green-50 p-3 rounded">
                <h4 className="font-medium text-green-900 mb-2">Suggested Lines</h4>
                <ul className="space-y-1">
                  {displayGuide.lines_to_say.map((line: string, index: number) => (
                    <li key={index} className="text-green-800 text-sm">
                      • {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Signals */}
            {displayGuide.signals && displayGuide.signals.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded">
                <h4 className="font-medium text-yellow-900 mb-2">Signals Detected</h4>
                <div className="flex flex-wrap gap-1">
                  {displayGuide.signals.map((signal: string, index: number) => (
                    <span key={index} className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 p-3 rounded text-sm text-gray-500">
            {inObjection ? 'No objection guidance available' : 'No guide available'}
          </div>
        )}
      </div>
    </div>
  );
}