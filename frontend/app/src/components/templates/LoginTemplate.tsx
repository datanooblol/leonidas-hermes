import React from 'react';
import { LoginPage } from '../organisms';

export const LoginTemplate = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#131314] transition-colors duration-300">
       <LoginPage onLogin={onLogin} />
    </div>
  );
};