import React from 'react';
import { Check, Lightbulb, Sparkles, SkipForward, ShieldAlert, Siren } from 'lucide-react';
import { Button } from '../atoms';
import { WarningData } from '@/types';

interface WarningModalProps {
  content: WarningData;
  onClose: () => void;
}

export const WarningModal = ({ content, onClose }: WarningModalProps) => (
  <div className="fixed inset-0 z-90 flex items-center justify-center p-4 overflow-hidden">
    {/* 🔒 Locked Backdrop with Red Tint */}
    <div className="absolute inset-0 bg-[#2a0a0a]/90 backdrop-blur-md cursor-not-allowed animate-in fade-in duration-300" />

    <div className="relative z-10 w-full max-w-2xl bg-linear-to-b from-[#2a0a0a] to-[#131314] rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.4)] border border-red-900 overflow-hidden flex flex-col max-h-[90vh] animate-[bounce-in_0.3s_ease-out]">
      
      {/* 1. Header: Red Alert Bar */}
      <div className="px-6 py-4 bg-red-900 border-b border-red-700 flex justify-between items-center shrink-0 shadow-lg relative z-20">
         <div className="flex items-center gap-3 text-white">
            <ShieldAlert className="animate-pulse" size={24} />
            <h2 className="font-bold text-lg tracking-tight uppercase">Critical Objection Detected</h2>
         </div>
         <div className="px-3 py-1 bg-black/20 rounded-full text-[10px] font-mono text-white/80 border border-white/10">
            CODE: RED
         </div>
      </div>

      {/* 2. Hero Warning Section (Customer Concern) */}
      <div className="p-8 text-center shrink-0 relative overflow-hidden bg-[#1a0505]">
          {/* Background Pulse Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/20 rounded-full blur-[80px] animate-pulse pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-500/50 rounded-full text-red-400 text-[10px] font-bold uppercase tracking-widest mb-4 shadow-sm">
                <Siren size={12} className="animate-bounce" /> Immediate Action Required
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]">
              &quot;{content.concern}&quot;
            </h2>
          </div>
      </div>

      {/* 3. Content: Strategy & Script */}
      <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-[#131314]">
          {/* Strategy Box: High Contrast */}
          <div className="bg-[#1E1F20] p-6 rounded-xl border-l-4 border-yellow-500 shadow-lg mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Lightbulb size={100} className="text-white"/></div>
            
            <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className="p-1.5 bg-yellow-500/10 rounded-md text-yellow-500">
                  <Sparkles size={16} />
                </div>
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Winning Strategy</h4>
            </div>
            <p className="text-xl text-white font-medium relative z-10">
              {content.action}
            </p>
          </div>

          {/* Script Lines */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Suggested Script</h4>
            <div className="space-y-3">
                {content.lines.map((line, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-default">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-red-900/50 text-red-400 border border-red-800 flex items-center justify-center text-xs font-bold">{i+1}</span>
                    <p className="text-gray-200 leading-relaxed font-light text-base">{line}</p>
                  </div>
                ))}
            </div>
          </div>
      </div>

      {/* 4. Footer Actions (Dark Theme) */}
      <div className="p-5 bg-[#0a0a0a] border-t border-white/10 grid grid-cols-2 gap-4 shrink-0 relative z-20">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="h-14 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-800"
          >
            <SkipForward size={20} /> Ignore Risk
          </Button>
          <Button 
            variant="success" 
            onClick={onClose} 
            className="h-14 bg-red-600 hover:bg-red-700 text-white border-none shadow-[0_0_20px_rgba(220,38,38,0.4)] text-lg font-bold"
          >
            <Check size={20} /> RESOLVE NOW
          </Button>
      </div>

    </div>
  </div>
);