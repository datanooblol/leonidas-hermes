import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#444746] shadow-sm transition-colors duration-300 ${className}`}>
    {children}
  </div>
);