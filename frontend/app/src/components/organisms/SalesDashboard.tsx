'use client';

import CustomerInfoCard from '../molecules/CustomerInfoCard';
import JourneyStageCard from '../molecules/JourneyStageCard';
import SentimentCard from '../molecules/SentimentCard';
import SalesChecklistCard from '../molecules/SalesChecklistCard';
import RecommendationsCard from '../molecules/RecommendationsCard';
import AudioRecorder from './AudioRecorder';
import { CustomerInfo } from '../../types';

interface SalesDashboardProps {
  customerInfo?: CustomerInfo;
}

export default function SalesDashboard({ customerInfo }: SalesDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <CustomerInfoCard customerInfo={customerInfo} />
          <JourneyStageCard />
          <SentimentCard />
        </div>
        
        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SalesChecklistCard />
          <RecommendationsCard />
        </div>
        
        {/* Audio Recording */}
        <div className="mt-4">
          <div className="bg-white border-2 border-gray-800 rounded-lg p-4">
            <h3 className="font-bold text-sm mb-3">Audio Recording</h3>
            <AudioRecorder />
          </div>
        </div>
      </div>
    </div>
  );
}