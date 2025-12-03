'use client';

import { CustomerInterest } from '../../types';

interface InterestDetectionCardProps {
  customerInterest?: CustomerInterest;
  sendManualInterestUpdate?: (data: Partial<CustomerInterest>) => void;
}

export default function InterestDetectionCard({ customerInterest, sendManualInterestUpdate }: InterestDetectionCardProps) {
  const interests = [
    { name: 'Life Insurance', field: 'life_insurance', detected: customerInterest?.life_insurance || false },
    { name: 'Health Insurance', field: 'health_insurance', detected: customerInterest?.health_insurance || false },
    { name: 'Critical Illness', field: 'critical_illness', detected: customerInterest?.critical_illness || false },
    { name: 'Accident Insurance', field: 'accident_insurance', detected: customerInterest?.accident_insurance || false },
    { name: 'Retirement Planning', field: 'retirement_planning', detected: customerInterest?.retirement_planning || false },
    { name: 'Tax Benefits', field: 'tax_benefits', detected: customerInterest?.tax_benefits || false }
  ];

  const handleToggle = (field: string, currentValue: boolean) => {
    if (sendManualInterestUpdate) {
      sendManualInterestUpdate({ [field]: !currentValue });
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-2 flex-shrink-0">
        {!customerInterest || Object.keys(customerInterest).length === 0 ? (
          <span className="text-xs text-red-500">No data from backend</span>
        ) : (
          <span className="text-xs text-green-500">Data received</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1 text-xs flex-1 overflow-y-auto">
        {interests.map((interest, index) => (
          <div
            key={index}
            onClick={() => handleToggle(interest.field, interest.detected)}
            className={`flex items-center gap-1 p-1 rounded transition-all cursor-pointer hover:opacity-80 ${interest.detected ? 'bg-green-100 border-l-2 border-green-500' : 'bg-gray-50 border-l-2 border-gray-300'
              }`}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${interest.detected ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            <span className={`font-medium truncate text-xs ${interest.detected ? 'text-green-700' : 'text-gray-500'}`}>
              {interest.name}
            </span>
          </div>
        ))}
      </div>
      
    </div>
  );
}