'use client';

import { useState } from 'react';
import { CustomerInfo } from '../../types';

interface CustomerInfoCardProps {
  customerInfo?: CustomerInfo;
  websocket?: WebSocket;
}

export default function CustomerInfoCard({ customerInfo, websocket }: CustomerInfoCardProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [values, setValues] = useState({
    age: customerInfo?.age || '',
    income_per_month: customerInfo?.income_per_month || '',
    marital_status: customerInfo?.marital_status || 'Unknown',
    number_of_children: customerInfo?.number_of_children || 0,
  });

  const handleSave = (field: string, value: any) => {
    if (websocket?.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: "manual_information_update",
        data: { [field]: value }
      }));
    }
    setEditing(null);
  };

  const EditableField = ({ field, value, type = 'text', options }: any) => {
    if (editing === field) {
      if (options) {
        return (
          <select
            value={values[field as keyof typeof values]}
            onChange={(e) => setValues(prev => ({ ...prev, [field]: e.target.value }))}
            onBlur={() => handleSave(field, values[field as keyof typeof values])}
            onKeyDown={(e) => e.key === 'Enter' && handleSave(field, values[field as keyof typeof values])}
            className="bg-blue-50 border rounded px-1 text-sm"
            autoFocus
          >
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        );
      }
      return (
        <input
          type={type}
          value={values[field as keyof typeof values]}
          onChange={(e) => setValues(prev => ({ ...prev, [field]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))}
          onBlur={() => handleSave(field, values[field as keyof typeof values])}
          onKeyDown={(e) => e.key === 'Enter' && handleSave(field, values[field as keyof typeof values])}
          className="bg-blue-50 border rounded px-1 text-sm w-16"
          autoFocus
        />
      );
    }
    return (
      <span 
        className="font-bold cursor-pointer hover:bg-gray-100 px-1 rounded"
        onDoubleClick={() => setEditing(field)}
      >
        {value}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-2">
        <span className="text-xs text-gray-500">ข้อมูลลูกค้า (double click เพื่อแก้ไข)</span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span>🎂Age:</span>
          <EditableField 
            field="age" 
            value={customerInfo?.age || 'XX'} 
            type="number"
          />
        </div>
        <div className="flex items-center gap-2">
          <span>💰Income:</span>
          <EditableField 
            field="income_per_month" 
            value={customerInfo?.income_per_month || 'XXXX'} 
            type="number"
          />
        </div>
        <div className="flex items-center gap-2">
          <span>💍Status:</span>
          <EditableField 
            field="marital_status" 
            value={customerInfo?.marital_status || 'Unknown'}
            options={[
              { value: 'Unknown', label: 'Unknown' },
              { value: 'Single', label: 'โสด' },
              { value: 'Married', label: 'แต่งงาน' }
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <span>👶Children:</span>
          <EditableField 
            field="number_of_children" 
            value={customerInfo?.number_of_children ?? 0} 
            type="number"
          />
        </div>
      </div>
    </div>
  );
}