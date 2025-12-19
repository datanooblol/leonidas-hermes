import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

export const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4F9] dark:bg-[#131314] p-4 transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Decor (Optional) */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white dark:bg-[#1E1F20] p-8 md:p-10 rounded-3xl shadow-2xl dark:shadow-none max-w-md w-full border border-gray-100 dark:border-[#444746] flex flex-col items-center relative z-10 transition-colors duration-300">
        
        {/* Logo */}
        <div className=" rounded-xl mb-2">
             <Image 
              src="/leonidasHermesLogo.png" 
              alt="Leonidas Hermes Logo" 
              width={80} // w-20 ประมาณ 80px
              height={80}
              className="w-20 h-20 object-contain drop-shadow-md" 
              priority // โหลดทันทีเพราะเป็น LCP
            />
          </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Hermes</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center text-sm">TeleSale Assistant Platform</p>
        
        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0B57D0] dark:group-focus-within:text-[#A8C7FA] transition-colors" size={18} />
              <input 
                type="text" 
                defaultValue="telesale_demo"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#2D2E30] border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B57D0]/20 dark:focus:ring-[#A8C7FA]/20 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0B57D0] dark:group-focus-within:text-[#A8C7FA] transition-colors" size={18} />
              <input 
                type="password" 
                defaultValue="password"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#2D2E30] border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B57D0]/20 dark:focus:ring-[#A8C7FA]/20 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`
              w-full py-3.5 bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 
              transition-all flex items-center justify-center gap-2 mt-2
              disabled:opacity-70 disabled:cursor-not-allowed
            `}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Login to Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>
          
          <div className="text-center pt-2">
             <span className="text-xs text-gray-400 dark:text-gray-500">Demo Mode: Click Login to proceed</span>
          </div>
        </form>
      </div>
    </div>
  );
};