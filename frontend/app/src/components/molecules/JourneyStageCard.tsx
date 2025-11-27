'use client';

import { useState, useEffect } from 'react';
import { JourneyStage } from '../../types';
import { useWebSocket } from '../../hooks/useWebSocket';

interface JourneyStageCardProps {
  journeyStage?: JourneyStage;
}

export default function JourneyStageCard({ journeyStage }: JourneyStageCardProps) {
  const { sendStageUpdate, currentStage, setCurrentStage } = useWebSocket();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const stages = ['Greet', 'Discover', 'Pitch', 'Closing'];
  const displayStage = journeyStage?.stage || currentStage;
  const currentStageIndex = stages.indexOf(displayStage);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleStageClick = (stage: string) => {
    setCurrentStage(stage);
    sendStageUpdate(stage);
    console.log(`Stage changed to: ${stage}`);
  };

  return (
    <div className="bg-white border border-gray-600 rounded p-1 h-full flex flex-col">
      <div className="border-b border-gray-600 pb-1 mb-1 flex-shrink-0">
        <h3 className="font-bold text-xs">JOURNEY / GUIDE</h3>
        {!journeyStage || Object.keys(journeyStage).length === 0 ? (
          <span className="text-xs text-red-500">No data from backend</span>
        ) : (
          <span className="text-xs text-green-500">Data received</span>
        )}
      </div>
      
      <div className="space-y-2 text-xs flex-1 overflow-auto">
        <div>
          <div className="font-medium mb-3">Stage:</div>
          <div className="relative mb-2 px-4 sm:px-8">
            <div className="absolute top-4 left-8 sm:left-12 right-8 sm:right-12 h-1 bg-gray-300"></div>
            <div className="flex justify-between">
              {stages.map((stage, index) => (
                <div key={stage} className="flex flex-col items-center relative">
                  <button 
                    onClick={() => handleStageClick(stage)}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-300 cursor-pointer hover:scale-110 z-10 ${
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
              className="absolute top-4 left-8 sm:left-12 h-1 bg-green-500 transition-all duration-500"
              style={{ width: `calc((100% - ${isSmallScreen ? '64px' : '96px'}) * ${currentStageIndex / (stages.length - 1)})` }}
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