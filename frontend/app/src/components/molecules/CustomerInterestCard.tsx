'use client';

import { CustomerInterest } from '../../types';

interface CustomerInterestCardProps {
  customerInterest?: CustomerInterest;
}

export default function CustomerInterestCard({ customerInterest }: CustomerInterestCardProps) {
  const interests = [
    { key: 'life_insurance', label: 'Life Insurance', icon: '🛡️' },
    { key: 'health_insurance', label: 'Health Insurance', icon: '🏥' },
    { key: 'critical_illness', label: 'Critical Illness', icon: '⚕️' },
    { key: 'accident_insurance', label: 'Accident Insurance', icon: '🚑' },
    { key: 'retirement_planning', label: 'Retirement Planning', icon: '🏖️' },
    { key: 'tax_benefits', label: 'Tax Benefits', icon: '💰' }
  ];

  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4 text-gray-800">
      <div className="border-b border-gray-800 pb-2 mb-3">
        <h3 className="font-bold text-sm text-gray-800">Customer Interest</h3>
        {!customerInterest ? (
          <span className="text-xs text-red-500">No data from backend</span>
        ) : (
          <span className="text-xs text-green-500">Data received</span>
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        {interests.map(({ key, label, icon }) => (
          <div key={key} className="flex items-center gap-2">
            <span>{icon}</span>
            <span className="font-medium">{label}:</span>
            <span className={customerInterest?.[key as keyof CustomerInterest] ? 'text-green-600' : 'text-gray-400'}>
              {customerInterest?.[key as keyof CustomerInterest] ? '✓' : '✗'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}