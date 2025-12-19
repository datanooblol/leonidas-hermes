"use client";

import { useState, useEffect } from "react";

interface CustomerInfoPanelProps {
  information: any;
  interest: any;
  websocket?: WebSocket | null;
}

export default function CustomerInfoPanel({ information, interest, websocket }: CustomerInfoPanelProps) {
  const [localInfo, setLocalInfo] = useState(information || {});
  const [localInterest, setLocalInterest] = useState(interest || {});

  useEffect(() => {
    setLocalInfo(information || {});
  }, [information]);

  useEffect(() => {
    setLocalInterest(interest || {});
  }, [interest]);

  const handleInfoChange = (field: string, value: any) => {
    setLocalInfo(prev => ({ ...prev, [field]: value }));
    
    // Send manual update to backend
    if (websocket?.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: "manual_information_update",
        data: { [field]: value }
      }));
    }
  };

  const handleInterestChange = (field: string, checked: boolean) => {
    setLocalInterest(prev => ({ ...prev, [field]: checked }));
    
    // Send manual update to backend
    if (websocket?.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: "manual_interest_update",
        data: { [field]: checked }
      }));
    }
  };
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border h-full overflow-auto">
      <h3 className="font-semibold text-lg mb-4 text-gray-800">Customer Information & Interest</h3>
      
      <div className="space-y-6">
        {/* Customer Information */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Information</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-gray-600 mb-1">Age</label>
              <input
                type="number"
                min="0"
                max="99"
                value={localInfo.age || ''}
                onChange={(e) => handleInfoChange('age', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Enter age (18-99)"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Income/Month</label>
              <input
                type="number"
                min="0"
                value={localInfo.income_per_month || ''}
                onChange={(e) => handleInfoChange('income_per_month', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Enter monthly income"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Marital Status</label>
              <select 
                value={localInfo.marital_status || ''} 
                onChange={(e) => handleInfoChange('marital_status', e.target.value || null)}
                className="w-full p-2 border rounded"
              >
                <option value="">-</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Children</label>
              <input
                type="number"
                min="0"
                value={localInfo.number_of_children ?? 0}
                onChange={(e) => handleInfoChange('number_of_children', e.target.value ? parseInt(e.target.value) : 0)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
        
        {/* Customer Interest */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Interest</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localInterest.life_insurance === true}
                onChange={(e) => handleInterestChange('life_insurance', e.target.checked)}
                className="rounded"
              />
              <span>Life Insurance</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localInterest.health_insurance === true}
                onChange={(e) => handleInterestChange('health_insurance', e.target.checked)}
                className="rounded"
              />
              <span>Health Insurance</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localInterest.critical_illness === true}
                onChange={(e) => handleInterestChange('critical_illness', e.target.checked)}
                className="rounded"
              />
              <span>Critical Illness</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localInterest.accident_insurance === true}
                onChange={(e) => handleInterestChange('accident_insurance', e.target.checked)}
                className="rounded"
              />
              <span>Accident Insurance</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localInterest.retirement_planning === true}
                onChange={(e) => handleInterestChange('retirement_planning', e.target.checked)}
                className="rounded"
              />
              <span>Retirement Planning</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localInterest.tax_benefits === true}
                onChange={(e) => handleInterestChange('tax_benefits', e.target.checked)}
                className="rounded"
              />
              <span>Tax Benefits</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}