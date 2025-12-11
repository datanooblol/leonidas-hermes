import React, { useState } from 'react';
import { X, FileText, Copy, Check } from 'lucide-react';
import { Button } from '../atoms';
import { MOCK_RAW_TRANSCRIPT } from '@/data/mock'; // ✅ Import ตัวใหม่

export const TranscriptModal = ({ onClose }: { onClose: () => void }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_RAW_TRANSCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-[#444746] flex flex-col h-[80vh] relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-[#444746] flex justify-between items-center bg-gray-50 dark:bg-[#1E1F20] rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-[#2D2E30] rounded-lg text-gray-600 dark:text-gray-300">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">Live Transcription</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Raw text stream</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-[#2D2E30] rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content: Raw Text Area */}
        <div className="flex-1 overflow-hidden p-0 relative group">
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
               onClick={handleCopy}
               className="flex items-center gap-2 px-3 py-1.5 bg-black/80 text-white text-xs rounded-lg backdrop-blur-md hover:bg-black transition-colors shadow-sm"
             >
               {copied ? <Check size={12} /> : <Copy size={12} />}
               {copied ? 'Copied' : 'Copy'}
             </button>
          </div>
          
          <textarea 
            readOnly
            className="w-full h-full p-6 resize-none bg-white dark:bg-[#131314] text-gray-600 dark:text-gray-300 font-mono text-sm leading-relaxed focus:outline-none custom-scrollbar"
            value={MOCK_RAW_TRANSCRIPT}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#444746] bg-gray-50 dark:bg-[#1E1F20] flex justify-end rounded-b-2xl shrink-0">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};