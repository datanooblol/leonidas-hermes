import React from 'react';
import { X, DollarSign, User, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';
import { Badge, Button } from '../atoms';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductModal = ({ product, onClose }: ProductModalProps) => (
  <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div 
      className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
      onClick={onClose}
    />
    
    {/* Modal Container */}
    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 dark:border-[#444746] animate-in fade-in zoom-in-95 duration-200 relative z-10 flex flex-col max-h-[90vh]">
      
      {/* Header */}
      <div className="p-6 pb-2 flex justify-between items-start">
        <div>
           <Badge color="blue">{product.category}</Badge>
           <h2 className="text-2xl font-bold mt-3 text-gray-900 dark:text-white leading-tight">{product.name}</h2>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 -mr-2 -mt-2 hover:bg-gray-100 dark:hover:bg-[#2D2E30] rounded-full text-gray-500 dark:text-gray-400 transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Scrollable Content */}
      <div className="p-6 pt-2 overflow-y-auto">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#2D2E30] rounded-lg font-medium">
            <DollarSign size={16} className="text-green-600 dark:text-green-400"/> {product.price}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#2D2E30] rounded-lg font-medium">
            <User size={16} className="text-blue-600 dark:text-blue-400"/> {product.ageRange}
          </div>
        </div>
        
        <div className="p-5 bg-gray-50 dark:bg-[#131314] border border-gray-100 dark:border-[#2D2E30] rounded-xl">
           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
             <ShieldCheck size={14} /> Plan Details
           </h4>
           <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed text-base">
             {product.fullDetail}
           </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pt-2 mt-auto flex justify-end gap-3 bg-white dark:bg-[#1E1F20]">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={onClose}>Select Plan</Button>
      </div>
    </div>
  </div>
);