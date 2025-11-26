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
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4">
      <div className="border-b border-gray-800 pb-2 mb-3">
        <h3 className="font-bold text-sm">INTEREST DETECTED</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        {interests.map((interest, index) => (
          <div key={index} className={`flex items-center gap-2 p-2 rounded transition-all ${
            interest.detected ? 'bg-green-100 border border-green-300' : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
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