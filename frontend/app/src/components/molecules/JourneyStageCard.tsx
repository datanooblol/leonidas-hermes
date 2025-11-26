'use client';

import { JourneyStage } from '../../types';
import { useWebSocket } from '../../hooks/useWebSocket';

interface JourneyStageCardProps {
  journeyStage?: JourneyStage;
}

export default function JourneyStageCard({ journeyStage }: JourneyStageCardProps) {
  const { sendStageUpdate, currentStage, setCurrentStage } = useWebSocket();
  const stages = ['Greet', 'Discover', 'Pitch', 'Closing'];
  const displayStage = journeyStage?.stage || currentStage;
  const currentStageIndex = stages.indexOf(displayStage);

  const handleStageClick = (stage: string) => {
    setCurrentStage(stage);
    sendStageUpdate(stage);
    console.log(`Stage changed to: ${stage}`);
  };

  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4">
      <div className="border-b border-gray-800 pb-2 mb-3">
        <h3 className="font-bold text-sm">JOURNEY / GUIDE</h3>
      </div>
      
      <div className="space-y-4 text-sm">
        <div>
          <div className="font-medium mb-3">Stage:</div>
          <div className="relative mb-2 px-8">
            <div className="absolute top-4 left-12 right-12 h-1 bg-gray-300"></div>
            <div className="flex justify-between">
              {stages.map((stage, index) => (
                <div key={stage} className="flex flex-col items-center relative">
                  <button 
                    onClick={() => handleStageClick(stage)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-300 cursor-pointer hover:scale-110 z-10 ${
                      index === currentStageIndex 
                        ? 'bg-yellow-500 border-yellow-500' 
                        : index < currentStageIndex 
                        ? 'bg-green-500 border-green-500'
                        : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                    }`}
                  />
                  <span className={`text-xs mt-1 ${
                    index === currentStageIndex ? 'font-bold text-yellow-600' : 'text-gray-600'
                  }`}>{stage}</span>
                </div>
              ))}
            </div>
            <div 
              className="absolute top-4 left-12 h-1 bg-green-500 transition-all duration-500"
              style={{ width: `calc((100% - 96px) * ${currentStageIndex / (stages.length - 1)})` }}
            />
          </div>
          <hr className="border-gray-300 mt-3" />
        </div>
        
        <div>
          <div className="font-medium mb-2">Action: {journeyStage?.action || 'Ask Need'}</div>
          <div className="mb-2">
            <span className="font-medium">Explanation:</span>
            <ul className="ml-4 mt-1 space-y-1">
              {journeyStage?.explanation?.map((item, index) => (
                <li key={index}>- {item}</li>
              )) || [
                <li key="1">- Understand pain point</li>,
                <li key="2">- Ask clarifying questions</li>
              ]}
            </ul>
          </div>
        </div>
        
        <div>
          <div className="font-medium mb-2">Signals:</div>
          <ul className="ml-4 space-y-1">
            {journeyStage?.signals?.map((signal, index) => (
              <li key={index}>- {signal}</li>
            )) || [
              <li key="1">- hesitation</li>,
              <li key="2">- curiosity</li>
            ]}
          </ul>
        </div>
        
        <div>
          <div className="font-medium mb-2">Lines to say:</div>
          <ul className="ml-4 space-y-1">
            {journeyStage?.lines?.map((line, index) => (
              <li key={index}>• "{line}"</li>
            )) || [
              <li key="1">• "ขอทราบความต้องการเพิ่มเติม…"</li>,
              <li key="2">• "ตอนนี้ลูกค้ามีประกันตัวไหนอยู่?"</li>
            ]}
          </ul>
        </div>
      </div>
    </div>
  );
}