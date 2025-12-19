import React from 'react';

interface InterestToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const InterestToggle = ({ label, checked, onChange }: InterestToggleProps) => (
  <div 
    onClick={() => onChange(!checked)}
    className={`
      cursor-pointer flex items-center gap-3 p-2.5 rounded-lg border text-xs font-medium transition-all duration-200 select-none
      ${checked 
        ? 'bg-[#E8F0FE] border-[#A8C7FA] text-[#0B57D0] dark:bg-[#004A77]/40 dark:border-[#A8C7FA]/50 dark:text-[#A8C7FA]' 
        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 dark:bg-[#1E1F20] dark:border-[#444746] dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-[#2D2E30]'}
    `}
  >
    <div 
      className={`
        w-2.5 h-2.5 rounded-full shrink-0 transition-colors
        ${checked ? 'bg-[#0B57D0] dark:bg-[#A8C7FA]' : 'bg-gray-300 dark:bg-gray-600'}
      `} 
    />
    <span className="truncate">{label}</span>
  </div>
);