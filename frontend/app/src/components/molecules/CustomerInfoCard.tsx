'use client';

import { CustomerInfo } from '../../types';

interface CustomerInfoCardProps {
  customerInfo?: CustomerInfo;
}

export default function CustomerInfoCard({ customerInfo }: CustomerInfoCardProps) {
  console.log('CustomerInfo received:', customerInfo);
  console.log('CustomerInfo keys:', Object.keys(customerInfo || {}));
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-2">
        {!customerInfo || Object.keys(customerInfo).length === 0 ? (
          <span className="text-xs text-red-500">No data from backend</span>
        ) : (
          <span className="text-xs text-green-500">Data: {JSON.stringify(customerInfo)}</span>
        )}
      </div>
      
      <div className="space-y-2 text-sm flex-1">
        <div className="flex items-center gap-2">
          <span>🎂</span>
          <span className="font-medium">Age:</span>
          <span className="font-bold text-blue-600">{customerInfo?.age || 'XX'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>💰</span>
          <span className="font-medium">Income:</span>
          <span className="font-bold text-green-600">{customerInfo?.income_per_month ? `${customerInfo.income_per_month.toLocaleString()}` : 'XXXX'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>💍</span>
          <span className="font-medium">Status:</span>
          <span className="font-bold">{customerInfo?.marital_status || 'Unknown'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>👶</span>
          <span className="font-medium">Children:</span>
          <span className="font-bold">{customerInfo?.number_of_children ?? 0}</span>
        </div>
      </div>
    </div>
  );
}