'use client';

import { CustomerInterest } from '../../types';

interface InterestDetectionCardProps {
  customerInterest?: CustomerInterest;
}

export default function InterestDetectionCard({ customerInterest }: InterestDetectionCardProps) {
  const interests = [
    { name: 'Health Insurance', detected: customerInterest?.health_coverage || false },
    { name: 'Accident Ins.', detected: customerInterest?.accident_protection || false },
    { name: 'Life Insurance', detected: customerInterest?.family_protection || false },
    { name: 'Funeral Ins.', detected: customerInterest?.legacy_planning || false }
  ];

  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4">
      <div className="border-b border-gray-800 pb-2 mb-3">
        <h3 className="font-bold text-sm">INTEREST DETECTED</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        {interests.map((interest, index) => (
          <div key={index} className="flex items-center gap-2">
            <span>-</span>
            <span>{interest.name}</span>
            <input 
              type="checkbox" 
              checked={interest.detected}
              className="ml-auto w-4 h-4"
              readOnly
            />
          </div>
        ))}
      </div>
    </div>
  );
}