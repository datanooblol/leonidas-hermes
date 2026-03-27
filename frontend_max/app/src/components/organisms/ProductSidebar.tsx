import React, { useState } from 'react';
import { Package, Search, Umbrella, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCardItem } from '../molecules';
import { Badge } from '../atoms';

interface ProductSidebarProps {
  isOpen: boolean;
  toggle: () => void;
  products: Product[];
  onSelect: (p: Product) => void;
}

export const ProductSidebar = ({ isOpen, toggle, products, onSelect }: ProductSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const displayedProducts = products.filter((p) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-40 w-80 bg-[#F0F4F9] dark:bg-[#131314] border-l border-gray-200 dark:border-[#444746] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'} pt-16`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#444746] bg-white dark:bg-[#1E1F20]">
        <div className="flex items-center gap-2">
          <Package className="text-[#0B57D0] dark:text-[#A8C7FA]" size={18} />
          <h2 className="font-bold text-gray-800 dark:text-[#E3E3E3] text-sm tracking-wide">PRODUCT ZONE</h2>
        </div>
        <Badge color="blue">{displayedProducts.length} Items</Badge>
      </div>

      {/* Search Box */}
      <div className="p-4 pb-2">
        <div className="relative group">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-[#0B57D0] dark:group-focus-within:text-[#A8C7FA]" size={16} />
           {/* ✅ แก้ไข className ให้เป็นบรรทัดเดียว ป้องกัน Hydration Error */}
           <input 
             type="text" 
             placeholder="Search products..." 
             className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#444746] rounded-xl text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B57D0]/20 dark:focus:ring-[#A8C7FA]/20 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] transition-all shadow-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((p) => (
            <ProductCardItem key={p.id} product={p} onClick={() => onSelect(p)} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600 gap-3 text-center">
            <div className="p-4 bg-gray-100 dark:bg-[#1E1F20] rounded-full">
               <Umbrella size={32} className="opacity-50" />
            </div>
            <p className="text-sm font-medium">No products found.</p>
          </div>
        )}
      </div>

      {/* ⚫ แท็บดึง Product Sidebar (สีเข้ม) */}
      <button 
        onClick={toggle}
        className="absolute -left-8 top-24 w-8 h-16 flex items-center justify-center bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-l-xl shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.3)] transition-all cursor-pointer border border-r-0 border-gray-900 dark:border-gray-500"
        title="Products"
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>
  );
};