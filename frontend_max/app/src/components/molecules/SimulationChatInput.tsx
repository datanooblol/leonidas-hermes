import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface SimulationChatInputProps {
  placeholder: string;
  onSend: (text: string) => void;
}

export const SimulationChatInput = ({ placeholder, onSend }: SimulationChatInputProps) => {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue(''); // เคลียร์ข้อความตัวเองหลังจากส่ง
  };

  return (
    <div className="flex gap-2 items-center mt-1 pt-2 border-t border-gray-200 dark:border-[#444746]">
      <input 
        type="text" 
        placeholder={placeholder}
        className="flex-1 w-full p-2 text-xs bg-white dark:bg-[#131314] border border-gray-200 dark:border-[#444746] rounded-lg text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button 
        onClick={handleSend}
        disabled={!value.trim()}
        className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center shadow-sm shrink-0 cursor-pointer"
      >
        <Send size={14} />
      </button>
    </div>
  );
};