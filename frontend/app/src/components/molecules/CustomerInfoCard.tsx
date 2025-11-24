'use client';

import { CustomerInfo } from '../../types';

interface CustomerInfoCardProps {
  customerInfo?: CustomerInfo;
}

export default function CustomerInfoCard({ customerInfo }: CustomerInfoCardProps) {
  console.log('CustomerInfo received:', customerInfo);
  
  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4 text-gray-800">
      <div className="border-b border-gray-800 pb-2 mb-3">
        <h3 className="font-bold text-sm text-gray-800">Customer Info</h3>
        {!customerInfo || Object.keys(customerInfo).length === 0 ? (
          <span className="text-xs text-red-500">No data from backend</span>
        ) : (
          <span className="text-xs text-green-500">Data received</span>
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span>👤</span>
          <span className="font-medium">Name:</span>
          <span>{customerInfo?.name || 'XX'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>🎂</span>
          <span className="font-medium">Age:</span>
          <span>{customerInfo?.age || 'XX'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>☎</span>
          <span className="font-medium">Tel:</span>
          <span>{customerInfo?.tel || 'XXX-XXX'}</span>
        </div>
        
        {customerInfo?.income_per_month && (
          <div className="flex items-center gap-2">
            <span>💰</span>
            <span className="font-medium">Income:</span>
            <span>{customerInfo.income_per_month.toLocaleString()} THB</span>
          </div>
        )}
      </div>
    </div>
  );
}