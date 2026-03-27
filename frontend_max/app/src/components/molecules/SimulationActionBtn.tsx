import React from 'react';

interface SimulationAction {
  label: string;
  text: string;
  type: string;
}

interface SimulationActionBtnProps {
  action: SimulationAction;
  onClick: () => void;
}

export const SimulationActionBtn = ({ action, onClick }: SimulationActionBtnProps) => {
  const isNegative = action.type === 'negative';

  return (
    <button 
      onClick={onClick}
      className={`
        w-full text-left p-2.5 text-xs bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#444746] rounded-lg transition-colors shadow-sm
        ${isNegative 
          ? 'text-red-600 dark:text-red-400 hover:border-red-500 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400' 
          : 'text-gray-600 dark:text-gray-300 hover:border-purple-500 hover:text-purple-600 dark:hover:border-purple-500 dark:hover:text-purple-400'
        }
      `}
    >
      ▶ {action.label}
    </button>
  );
};