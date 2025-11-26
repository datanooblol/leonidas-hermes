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
    <div className="min-h-screen bg-gray-100 p-4 text-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="border-4 border-gray-800 bg-white p-4">
          <div className="text-center font-bold text-lg mb-4 border-b-2 border-gray-800 pb-2">
            AGENT ASSIST DASHBOARD
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Panel */}
            <div className="space-y-4">
              <div className="border-2 border-gray-800 p-2">
                <div className="font-bold text-sm mb-2 text-center">LEFT PANEL</div>
                <CustomerInfoCard customerInfo={customerInfo} />
              </div>
              
              <InterestDetectionCard customerInterest={customerInterest} />
              <SalesChecklistCard />
            </div>
            
            {/* Center Panel */}
            <div className="border-2 border-gray-800 p-2">
              <div className="font-bold text-sm mb-2 text-center">JOURNEY / GUIDE</div>
              <JourneyStageCard />
            </div>
            
            {/* Right Panel */}
            <div className="border-2 border-gray-800 p-2">
              <div className="font-bold text-sm mb-2 text-center">PRODUCT MATCH</div>
              <ProductMatchCard />
            </div>
          </div>
        </div>
        
        {/* Audio Recording Section - Outside Frame */}
        <div className="mt-4">
          <AudioRecorder />
        </div>
      </div>
    </div>
  );
}