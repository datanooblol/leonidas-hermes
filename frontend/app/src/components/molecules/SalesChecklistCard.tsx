'use client';

import { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

interface SalesChecklistCardProps {
  completedItems?: string[];
}

export default function SalesChecklistCard({ completedItems = [] }: SalesChecklistCardProps) {
  const [localCompletedItems, setLocalCompletedItems] = useState<string[]>(completedItems);
  const { sendChecklistUpdate } = useWebSocket();
  const checklistItems = [
    'Introduced agent',
    'Mention company', 
    'Ask permission',
    'Ask Need',
    'Pitch Product',
    'Closing'
  ];

  const currentCompletedItems = completedItems.length > 0 ? completedItems : localCompletedItems;
  const completedCount = currentCompletedItems.length;
  const progressPercentage = (completedCount / checklistItems.length) * 100;

  const handleCheckboxClick = (item: string) => {
    const newCompletedItems = currentCompletedItems.includes(item)
      ? currentCompletedItems.filter(i => i !== item)
      : [...currentCompletedItems, item];
    
    setLocalCompletedItems(newCompletedItems);
    sendChecklistUpdate(newCompletedItems);
  };

  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4">
      <div className="border-b border-gray-800 pb-2 mb-3">
        <h3 className="font-bold text-sm">PROGRESS CHECKLIST</h3>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{completedCount}/{checklistItems.length} completed</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        {checklistItems.map((item, index) => {
          const isCompleted = currentCompletedItems.includes(item);
          return (
            <div key={index} className="flex items-center gap-2">
              <button 
                onClick={() => handleCheckboxClick(item)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 ${
                  isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-400 hover:border-gray-600'
                }`}
              >
                {isCompleted && <span className="text-white text-xs">✓</span>}
              </button>
              <span className={isCompleted ? 'line-through text-gray-500' : ''}>{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}