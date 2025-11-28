'use client';

import { useEffect, useMemo } from 'react';
import CustomerInfoCard from '../molecules/CustomerInfoCard';
import JourneyStageCard from '../molecules/JourneyStageCard';
import SalesChecklistCard from '../molecules/SalesChecklistCard';
import InterestDetectionCard from '../molecules/InterestDetectionCard';
import ProductMatchCard from '../molecules/ProductMatchCard';
import AudioRecorder from './AudioRecorder';

interface SalesDashboardProps {
  webSocketData: any;
}

export default function SalesDashboard({ webSocketData }: SalesDashboardProps) {
  console.log('🏠 SalesDashboard component loaded');
  
  const {
    customerInfo,
    customerInterest,
    agentChecklist,
    currentStage,
    currentGuide,
    products,
    forceUpdate
  } = webSocketData;

  console.log('📊 SalesDashboard render - customerInfo:', customerInfo);
  console.log('📊 SalesDashboard render - forceUpdate:', forceUpdate);

  useEffect(() => {
    console.log('📊 CustomerInfo changed:', customerInfo);
  }, [customerInfo]);

  const memoizedCustomerInfo = useMemo(() => {
    console.log('CustomerInfo memo update:', customerInfo);
    return customerInfo;
  }, [customerInfo]);

  const journeyStage = currentGuide ? {
    stage: currentStage as 'Greeting' | 'Discovery' | 'Pitch',
    action: currentGuide.action,
    explanation: [currentGuide.explanation],
    signals: currentGuide.signals,
    lines: currentGuide.lines_to_say
  } : undefined;

  return (
    <div className="h-screen bg-gray-100 p-1 text-gray-800 overflow-hidden text-xs">
      <div className="h-full flex flex-col w-full">
        <div className="border-2 border-gray-800 bg-white p-1 flex-1 flex flex-col">
          <div className="text-center font-bold text-xs mb-1 border-b border-gray-800 pb-1">
            AGENT ASSIST DASHBOARD - Update: {forceUpdate}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 flex-1 overflow-hidden">
            <div className="flex flex-col space-y-1 overflow-hidden">
              <div className="border border-gray-800 p-1 flex-shrink-0">
                <div className="font-bold text-xs mb-1 text-center">Customer</div>
                <CustomerInfoCard key={forceUpdate} customerInfo={memoizedCustomerInfo} />
              </div>
              
              <div className="flex-1 overflow-hidden">
                <InterestDetectionCard key={forceUpdate} customerInterest={customerInterest} />
              </div>
              <div className="flex-1 overflow-hidden">
                <SalesChecklistCard key={forceUpdate} completedItems={Object.keys(agentChecklist).filter(key => agentChecklist[key])} />
              </div>
            </div>
            
            <div className="border border-gray-800 p-1 overflow-hidden">
              <div className="font-bold text-xs mb-1 text-center">JOURNEY / GUIDE</div>
              <div className="h-full overflow-auto">
                <JourneyStageCard key={forceUpdate} journeyStage={journeyStage} />
              </div>
            </div>
            
            <div className="border border-gray-800 p-1 overflow-hidden">
              <div className="font-bold text-xs mb-1 text-center">PRODUCT MATCH</div>
              <div className="h-full overflow-auto">
                <ProductMatchCard key={forceUpdate} products={products} />
              </div>
            </div>
          </div>
        </div>
        
        <AudioRecorder webSocketData={webSocketData} />
      </div>
    </div>
  );
}