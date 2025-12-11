import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
}

export const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    // Light: สีน้ำเงินเข้ม ตัวขาว / Dark: สีฟ้าอ่อน ตัวน้ำเงินเข้ม (High Contrast)
    primary: "bg-[#0B57D0] text-white hover:bg-[#0B57D0]/90 dark:bg-[#A8C7FA] dark:text-[#0B1D3F] dark:hover:bg-[#8AB4F8]",
    
    // Light: สีเทาอ่อน / Dark: สีเทาเข้ม
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#2D2E30] dark:text-[#E3E3E3] dark:hover:bg-[#38393A]",
    
    // Danger
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50",
    
    // Success
    success: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 dark:text-white",
    
    // Ghost (ไม่มีพื้นหลัง)
    ghost: "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#2D2E30]",
    
    // Outline (มีขอบ)
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-[#2D2E30]"
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};