import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../atoms';

export const LogoutModal = ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => (
  <div className="fixed inset-0 z-90 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    
    <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-xl p-6 max-w-sm w-full border border-gray-200 dark:border-[#444746] animate-in fade-in zoom-in-95 duration-200 relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
           <LogOut size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Logout</h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
        Are you sure you want to end your session? <br/>
        Unsaved progress in current simulation will be lost.
      </p>
      
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Logout</Button>
      </div>
    </div>
  </div>
);