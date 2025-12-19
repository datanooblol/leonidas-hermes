import React from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface CompactFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  icon?: LucideIcon;
  type?: string;
  options?: string[];
}

export const CompactField = ({ label, value, onChange, icon: Icon, type = 'text', options = [] }: CompactFieldProps) => (
  <div className="flex flex-col gap-1 min-w-20 flex-1">
    {/* Label */}
    <label className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1 font-bold">
      {Icon && <Icon size={10} />} {label}
    </label>
    
    <div className="relative group">
      {type === 'select' ? (
        <div className="relative w-full">
          <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#2D2E30] border-b border-gray-200 dark:border-gray-600 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] focus:outline-none text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] transition-colors py-1.5 px-2 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-[#38393a] rounded-t-md pr-6"
          >
            {options.map((opt) => (
              <option key={opt} value={opt} className="bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-gray-200">
                {opt}
              </option>
            ))}
          </select>
          <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
            <ChevronDown size={14} />
          </div>
        </div>
      ) : (
        <input
          type={type === 'number' ? 'text' : type}
          inputMode={type === 'number' ? 'numeric' : 'text'}
          value={value}
          onChange={(e) => {
            if (type === 'number' && !/^\d*$/.test(e.target.value)) return;
            onChange(e.target.value);
          }}
          className="w-full bg-gray-50 dark:bg-[#2D2E30] border-b border-gray-200 dark:border-gray-600 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] focus:outline-none text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] transition-colors py-1.5 px-2 hover:bg-gray-100 dark:hover:bg-[#38393a] rounded-t-md"
        />
      )}
    </div>
  </div>
);