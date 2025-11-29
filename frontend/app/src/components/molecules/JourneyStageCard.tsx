'use client';

import { useState, useEffect } from 'react';
import { JourneyStage } from '../../types';

interface JourneyStageCardProps {
  journeyStage?: JourneyStage;
  webSocketData?: any;
}

export default function JourneyStageCard({ journeyStage, webSocketData }: JourneyStageCardProps) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const stages = ['greeting', 'discovery', 'pitch', 'closing'];
  const stageLabels = ['Greet', 'Discover', 'Pitch', 'Closing'];
  
  const currentStage = webSocketData?.currentStage || 'greeting';
  const sendStageUpdate = webSocketData?.sendStageUpdate;
  const currentStageIndex = stages.indexOf(currentStage);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleStageClick = (stage: string) => {
    if (sendStageUpdate) {
      sendStageUpdate(stage);
      console.log(`Stage changed to: ${stage}`);
    }
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
                  }`}>{stageLabels[index]}</span>
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
        
        <div className="border-l-4 border-blue-400 bg-blue-50 p-2 rounded">
          <div className="font-bold text-blue-700 mb-1">Action</div>
          <div className="text-gray-800">{journeyStage?.action || 'Ask Need'}</div>
        </div>
        
        <div className="border-l-4 border-green-400 bg-green-50 p-2 rounded">
          <div className="font-bold text-green-700 mb-1">Explanation</div>
          <div className="space-y-1">
            {journeyStage?.explanation?.map((item, index) => (
              <div key={index} className="text-gray-800">• {item}</div>
            )) || [
              <div key="1" className="text-gray-800">• Understand pain point</div>,
              <div key="2" className="text-gray-800">• Ask clarifying questions</div>
            ]}
          </div>
        </div>
        
        <div className="border-l-4 border-orange-400 bg-orange-50 p-2 rounded">
          <div className="font-bold text-orange-700 mb-1">Signals</div>
          <div className="space-y-1">
            {journeyStage?.signals?.map((signal, index) => (
              <div key={index} className="text-gray-800">• {signal}</div>
            )) || [
              <div key="1" className="text-gray-800">• hesitation</div>,
              <div key="2" className="text-gray-800">• curiosity</div>
            ]}
          </div>
        </div>
        
        <div className="border-l-4 border-purple-400 bg-purple-50 p-2 rounded">
          <div className="font-bold text-purple-700 mb-1">Lines to say</div>
          <div className="space-y-1">
            {journeyStage?.lines?.map((line, index) => (
              <div key={index} className="text-gray-800 italic">"{line}"</div>
            )) || [
              <div key="1" className="text-gray-800 italic">"ขอทราบความต้องการเพิ่มเติม…"</div>,
              <div key="2" className="text-gray-800 italic">"ตอนนี้ลูกค้ามีประกันตัวไหนอยู่?"</div>
            ]}
          </div>
        </div>
      </div>
    </div>
  );
}