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

export default function StageGuidePanel({
  websocket,
  messages,
  selectedStage: propSelectedStage,
  onStageChange,
  inObjection,
  objectionData,
  onObjectionResolved,
}: StageGuidePanelProps) {
  const [selectedStage, setSelectedStage] = useState<string>(
    propSelectedStage || "greeting"
  );
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    if (propSelectedStage) {
      setSelectedStage(propSelectedStage);
    }
  }, [propSelectedStage]);

  const [backendMessage, setBackendMessage] = useState<string>("");
  const stages = ["greeting", "discovery", "pitch", "closing"];

  useEffect(() => {
    const latestGuideMessage = messages.filter((m) => m.type === "guide").pop();
    if (latestGuideMessage?.message) {
      setBackendMessage(latestGuideMessage.message);
    }
  }, [messages]);

  const handleStageChange = (stage: string) => {
    if (inObjection) return;
    setSelectedStage(stage);
    onStageChange?.(stage);

    if (websocket?.readyState === WebSocket.OPEN) {
      const message = {
        type: "guide",
        data: { stage_name: stage },
        // stage_name: stage,
      };

      // console.log("Sending to backend:", message);
      websocket.send(JSON.stringify(message));
    }
  };

  const latestGuide = messages.filter((m) => m.type === "guide").pop();
  const shouldShowGuide = latestGuide?.stage_name === selectedStage;
  const displayGuide = inObjection ? objectionData?.guide : latestGuide?.guide;
  const shouldShowContent = inObjection || shouldShowGuide;

  return (
    <div
      className={`p-4 rounded-lg shadow-sm border ${
        inObjection ? "bg-red-50 border-red-200" : "bg-white"
      }`}
    >
      {/* Stage Selector Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center">
          🎯 {inObjection ? "OBJECTION DETECTED" : "STAGE SELECTOR"}
        </h3>

        {!inObjection && (
          <div className="flex gap-3 mb-3">
            {stages.map((stage) => (
              <label
                key={stage}
                className="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
              >
                <input
                  type="radio"
                  name="stage"
                  value={stage}
                  checked={selectedStage === stage}
                  onChange={() => handleStageChange(stage)}
                  className="mr-2 text-blue-600"
                />
                <span className="capitalize font-medium">{stage}</span>
              </label>
            ))}
          </div>
        )}

        {inObjection && (
          <div className="mb-3">
            <button
              onClick={onObjectionResolved}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
            >
              Mark Resolved
            </button>
            <p className="text-sm text-red-700 mt-2">
              Will return to: {objectionData?.previous_stage}
            </p>
          </div>
        )}
      </div>

      {shouldShowContent && displayGuide ? (
        <div className="space-y-4">
          {/* PRIMARY GUIDANCE SECTION */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            {/* Action - Primary Focus */}
            {displayGuide.action && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">🎬</span>
                  <h4 className="text-lg font-bold text-blue-900">ACTION</h4>
                </div>
                <p className="text-blue-800 text-lg font-semibold leading-relaxed">
                  {displayGuide.action}
                </p>
              </div>
            )}

            {/* Suggested Lines - Secondary Focus */}
            {displayGuide.lines_to_say &&
              displayGuide.lines_to_say.length > 0 && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <span className="text-lg mr-2">💬</span>
                    <h4 className="font-bold text-green-900">WHAT TO SAY</h4>
                  </div>
                  <ul className="space-y-2">
                    {displayGuide.lines_to_say.map(
                      (line: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-2 mt-1">▶</span>
                          <span className="text-green-800 font-medium">
                            {line}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </div>

          {/* SUPPORTING DETAILS SECTION */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-3 text-sm font-medium"
            >
              <span className="mr-2">ⓘ</span>
              Supporting Details
              <span
                className={`ml-2 transform transition-transform ${
                  showDetails ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {showDetails && (
              <div className="space-y-3">
                {/* Explanation */}
                {displayGuide.explanation && (
                  <div className="bg-gray-50 p-3 rounded border">
                    <h5 className="font-medium text-gray-700 mb-1 text-sm">
                      Explanation
                    </h5>
                    <p className="text-gray-600 text-sm">
                      {displayGuide.explanation}
                    </p>
                  </div>
                )}

                {/* Signals */}
                {displayGuide.signals && displayGuide.signals.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <div className="flex items-center mb-2">
                      <span className="text-sm mr-1">📊</span>
                      <h5 className="font-medium text-yellow-800 text-sm">
                        Signals Detected
                      </h5>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {displayGuide.signals.map(
                        (signal: string, index: number) => (
                          <span
                            key={index}
                            className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full"
                          >
                            {signal}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded text-center text-gray-500">
          {inObjection
            ? "No objection guidance available"
            : "No guide available for selected stage"}
        </div>
      )}

      {backendMessage && (
        <div className="mt-3 text-xs text-green-600 bg-green-50 p-2 rounded">
          Backend: {backendMessage}
        </div>
      )}
    </div>
  );
}
