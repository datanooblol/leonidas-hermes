import React from 'react';
import { Bot, User } from 'lucide-react';
import { TranscriptMsg } from '@/types';

interface TranscriptMessageProps {
  message: TranscriptMsg;
}

export const TranscriptMessage: React.FC<TranscriptMessageProps> = ({ message }) => {
  const isAgent = message.role === 'Agent';

  return (
    <div className={`flex gap-3 ${isAgent ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAgent ? 'bg-[#0B57D0] text-white' : 'bg-gray-200 dark:bg-[#2D2E30] text-gray-600 dark:text-gray-300'}`}>
        {isAgent ? <Bot size={16} /> : <User size={16} />}
      </div>
      <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isAgent ? 'bg-blue-50 dark:bg-[#0B1D3F]/60 text-gray-800 dark:text-gray-200 rounded-tr-none' : 'bg-white dark:bg-[#1E1F20] text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-[#444746] rounded-tl-none'}`}>
        <p>{message.text}</p>
        <span className="text-[10px] text-gray-400 mt-1 block text-right">{message.timestamp}</span>
      </div>
    </div>
  );
};