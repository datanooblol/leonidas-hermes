'use client';

import { useState } from 'react';
import { JourneyStage } from '../../types';

interface JourneyStageCardProps {
  journeyStage?: JourneyStage;
  webSocketData?: any;
}

export default function JourneyStageCard({ journeyStage, webSocketData }: JourneyStageCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const stages = ['greeting', 'discovery', 'pitch', 'closing'];
  const stageLabels = ['Greet', 'Discover', 'Pitch', 'Closing'];
  
  const currentStage = webSocketData?.currentStage || 'greeting';
  const objectionDetected = webSocketData?.objectionDetected || false;
  const sendStageUpdate = webSocketData?.sendStageUpdate;
  const resolveObjection = webSocketData?.resolveObjection;
  const currentStageIndex = stages.indexOf(currentStage);

  const handleStageClick = (stage: string) => {
    if (objectionDetected && resolveObjection) {
      resolveObjection();
    }
    if (sendStageUpdate) {
      sendStageUpdate(stage);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 h-full flex flex-col">
      <div className="border-b border-gray-200 pb-2 mb-3 flex-shrink-0">
        <h3 className="font-medium text-xs text-gray-900">Journey Guide</h3>
      </div>
      
      <div className="space-y-3 flex-1 overflow-auto">
        <div className="relative mb-3 px-4">
          <div className="absolute top-3 left-6 right-6 h-0.5 bg-gray-300"></div>
          <div className="flex justify-between">
            {stages.map((stage, index) => (
              <div key={stage} className="flex flex-col items-center relative">
                <button 
                  onClick={() => handleStageClick(stage)}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer z-10 ${
                    objectionDetected && index === currentStageIndex
                      ? 'bg-red-500 border-red-500'
                      : index === currentStageIndex 
                      ? 'bg-yellow-500 border-yellow-500' 
                      : index < currentStageIndex 
                      ? 'bg-green-500 border-green-500'
                      : 'bg-gray-200 border-gray-300'
                  }`}
                />
                <span className={`text-xs mt-1 ${
                  index === currentStageIndex ? 'font-bold text-yellow-600' : 'text-gray-600'
                }`}>{stageLabels[index]}</span>
              </div>
            ))}
          </div>
          <div 
            className="absolute top-3 left-6 h-0.5 bg-green-500 transition-all duration-500"
            style={{ width: `calc((100% - 48px) * ${currentStageIndex / (stages.length - 1)})` }}
          />
        </div>
        
        <div className="bg-gray-100 border border-gray-200 p-3 rounded">
          <div className="text-xs font-medium mb-1 text-gray-600">Action</div>
          <div className="text-sm font-semibold mb-1 text-gray-900">
            {journeyStage?.action || 'Ask Need'}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>🚢</span>
            <div className="flex gap-1">
              {journeyStage?.signals?.slice(0, 2).map((signal, index) => (
                <span key={index}>
                  {signal}{index < (journeyStage?.signals?.length || 2) - 1 ? ',' : ''}
                </span>
              )) || [
                <span key="1">hesitation,</span>,
                <span key="2">curiosity</span>
              ]}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-3 rounded">
          <div className="text-xs font-medium mb-2 text-gray-700">Lines to say</div>
          <div className="space-y-1">
            {journeyStage?.lines?.slice(0, 2).map((line, index) => (
              <div key={index} className="text-xs text-gray-800 bg-white p-2 rounded border">
                "{line}"
              </div>
            )) || [
              <div key="1" className="text-xs text-gray-800 bg-white p-2 rounded border">
                "ขอทราบความต้องการเพิ่มเติม…"
              </div>,
              <div key="2" className="text-xs text-gray-800 bg-white p-2 rounded border">
                "ตอนนี้ลูกค้ามีประกันตัวไหนอยู่?"
              </div>
            ]}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between text-left text-xs text-gray-600 hover:text-gray-800"
          >
            <span>Explanation</span>
            <span className={`text-xs transition-transform ${showExplanation ? 'rotate-90' : ''}`}>
              ▶
            </span>
          </button>
          {showExplanation && (
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              {journeyStage?.explanation?.map((item, index) => (
                <div key={index}>• {item}</div>
              )) || [
                <div key="1">• Understand pain point</div>,
                <div key="2">• Ask clarifying questions</div>
              ]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}