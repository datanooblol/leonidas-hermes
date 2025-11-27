'use client';

import { CustomerInterest } from '../../types';

interface InterestDetectionCardProps {
  customerInterest?: CustomerInterest;
}

export default function InterestDetectionCard({ customerInterest }: InterestDetectionCardProps) {
  const interests = [
    { name: 'Family Protection', detected: customerInterest?.family_protection || false },
    { name: 'Legacy Planning', detected: customerInterest?.legacy_planning || false },
    { name: 'Savings Goal', detected: customerInterest?.savings_goal || false },
    { name: 'Tax Benefits', detected: customerInterest?.tax_benefits || false },
    { name: 'Retirement Planning', detected: customerInterest?.retirement_planning || false },
    { name: 'Health Coverage', detected: customerInterest?.health_coverage || false },
    { name: 'Accident Protection', detected: customerInterest?.accident_protection || false },
    { name: 'Critical Illness', detected: customerInterest?.critical_illness || false },
    { name: 'Budget Conscious', detected: customerInterest?.budget_conscious || false },
    { name: 'Immediate Need', detected: customerInterest?.immediate_need || false }
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