import React from 'react';

export const Badge = ({ children, color = 'blue' }: { children: React.ReactNode, color?: 'blue' | 'green' | 'gray' }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-100 dark:border-blue-800/30",
    green: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200 border border-green-100 dark:border-green-800/30",
    gray: "bg-gray-100 text-gray-700 dark:bg-[#2D2E30] dark:text-gray-300 border border-gray-200 dark:border-gray-600"
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${colors[color]}`}>
      {children}
    </span>
  );
};