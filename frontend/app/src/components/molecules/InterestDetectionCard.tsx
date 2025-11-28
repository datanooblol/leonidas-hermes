'use client';

import { CustomerInterest } from '../../types';

interface InterestDetectionCardProps {
  customerInterest?: CustomerInterest;
}

export default function InterestDetectionCard({ customerInterest }: InterestDetectionCardProps) {
  const interests = [
    { name: 'Life Insurance', detected: customerInterest?.life_insurance || false },
    { name: 'Health Insurance', detected: customerInterest?.health_insurance || false },
    { name: 'Critical Illness', detected: customerInterest?.critical_illness || false },
    { name: 'Accident Insurance', detected: customerInterest?.accident_insurance || false },
    { name: 'Retirement Planning', detected: customerInterest?.retirement_planning || false },
    { name: 'Tax Benefits', detected: customerInterest?.tax_benefits || false }
  ];

  return (
    <div className="bg-white border border-gray-600 rounded p-1 h-full flex flex-col">
      <div className="border-b border-gray-600 pb-1 mb-1 flex-shrink-0">
        <h3 className="font-bold text-xs">INTEREST DETECTED</h3>
        {!customerInterest || Object.keys(customerInterest).length === 0 ? (
          <span className="text-xs text-red-500">No data from backend</span>
        ) : (
          <span className="text-xs text-green-500">Data received</span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-1 text-xs flex-1 overflow-auto">
        {interests.map((interest, index) => (
          <div key={index} className={`flex items-center gap-1 p-1 rounded transition-all ${
            interest.detected ? 'bg-green-100 border border-green-300' : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              interest.detected ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className={interest.detected ? 'text-green-700 font-medium' : 'text-gray-500'}>
              {interest.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}