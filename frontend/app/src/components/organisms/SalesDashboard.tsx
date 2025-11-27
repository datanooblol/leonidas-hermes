'use client';

import CustomerInfoCard from '../molecules/CustomerInfoCard';
import JourneyStageCard from '../molecules/JourneyStageCard';
import SalesChecklistCard from '../molecules/SalesChecklistCard';
import InterestDetectionCard from '../molecules/InterestDetectionCard';
import ProductMatchCard from '../molecules/ProductMatchCard';
import AudioRecorder from './AudioRecorder';
import { CustomerInfo, CustomerInterest } from '../../types';

interface SalesDashboardProps {
  customerInfo?: CustomerInfo;
  customerInterest?: CustomerInterest;
}

export default function SalesDashboard({ customerInfo, customerInterest }: SalesDashboardProps) {
  return (
    <div className="h-screen bg-gray-100 p-1 text-gray-800 overflow-hidden text-xs">
      <div className="h-full flex flex-col w-full">
        <div className="border-2 border-gray-800 bg-white p-1 flex-1 flex flex-col">
          <div className="text-center font-bold text-xs mb-1 border-b border-gray-800 pb-1">
            AGENT ASSIST DASHBOARD
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 flex-1 overflow-hidden">
            {/* Left Panel */}
            <div className="flex flex-col space-y-1 overflow-hidden">
              <div className="border border-gray-800 p-1 flex-shrink-0">
                <div className="font-bold text-xs mb-1 text-center">Customer</div>
                <CustomerInfoCard customerInfo={customerInfo} />
              </div>
              
              <div className="flex-1 overflow-hidden">
                <InterestDetectionCard customerInterest={customerInterest} />
              </div>
              <div className="flex-1 overflow-hidden">
                <SalesChecklistCard />
              </div>
            </div>
            
            {/* Center Panel */}
            <div className="border border-gray-800 p-1 overflow-hidden">
              <div className="font-bold text-xs mb-1 text-center">JOURNEY / GUIDE</div>
              <div className="h-full overflow-auto">
                <JourneyStageCard />
              </div>
            </div>
            
            {/* Right Panel */}
            <div className="border border-gray-800 p-1 overflow-hidden">
              <div className="font-bold text-xs mb-1 text-center">PRODUCT MATCH</div>
              <div className="h-full overflow-auto">
                <ProductMatchCard />
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Audio Recorder */}
        <AudioRecorder />
      </div>
    </div>
  );
}