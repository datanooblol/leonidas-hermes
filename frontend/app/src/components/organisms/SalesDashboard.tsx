'use client';

import { useEffect, useMemo } from 'react';
import CustomerInfoCard from '../molecules/CustomerInfoCard';
import JourneyStageCard from '../molecules/JourneyStageCard';
import SalesChecklistCard from '../molecules/SalesChecklistCard';
import InterestDetectionCard from '../molecules/InterestDetectionCard';
import ProductMatchCard from '../molecules/ProductMatchCard';
import AudioRecorder from './AudioRecorder';
import NavBar from './NavBar';

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
    <div className="fixed inset-0 bg-gray-100 text-gray-800 overflow-hidden flex flex-col">
      {/* NavBar */}
      <NavBar />
      
      {/* Main Content */}
      <div className="flex-1 p-2 pb-4 min-h-0">
        <div className="w-full h-full flex flex-col gap-2 max-w-7xl mx-auto">
          
          {/* TOP 70% - COMPONENT 1 + 2 */}
          <div className="h-[70%] flex gap-2 min-h-0">
            
            {/* LEFT 25% - Customer Info + Interest */}
            <div className="w-1/4 flex flex-col gap-2 min-h-0">
              <div className="flex-1 min-h-0">
                <div className="bg-white border border-gray-800 p-2 h-full flex flex-col rounded">
                  <div className="font-bold text-sm mb-2 text-center border-b border-gray-800 pb-1 flex-shrink-0">
                    CUSTOMER INFO
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <CustomerInfoCard key={forceUpdate} customerInfo={memoizedCustomerInfo} sendManualInfoUpdate={webSocketData.sendManualInfoUpdate} />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-h-0">
                <div className="bg-white border border-gray-800 p-2 h-full flex flex-col rounded">
                  <div className="font-bold text-sm mb-2 text-center border-b border-gray-800 pb-1 flex-shrink-0">
                    INTEREST
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <InterestDetectionCard key={forceUpdate} customerInterest={customerInterest} sendManualInterestUpdate={webSocketData.sendManualInterestUpdate} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* RIGHT 75% - Stage/Guide */}
            <div className="w-3/4 min-h-0">
              <div className="bg-white border border-gray-800 p-2 h-full flex flex-col rounded">
                <div className="font-bold text-sm mb-2 text-center border-b border-gray-800 pb-1 flex-shrink-0">
                  STAGE / GUIDE - Update: {forceUpdate}
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <JourneyStageCard key={forceUpdate} journeyStage={journeyStage} webSocketData={webSocketData} />
                </div>
              </div>
            </div>
          </div>
          
          {/* BOTTOM 30% - Products */}
          <div className="h-[30%] min-h-0">
            <div className="bg-white border border-gray-800 p-2 h-full flex flex-col rounded">
              <div className="font-bold text-sm mb-2 text-center border-b border-gray-800 pb-1 flex-shrink-0">
                PRODUCT ZONE
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ProductMatchCard key={forceUpdate} products={products} />
              </div>
            </div>
          </div>
          
          <AudioRecorder webSocketData={webSocketData} />
        </div>
      </div>
    </div>
  );
}