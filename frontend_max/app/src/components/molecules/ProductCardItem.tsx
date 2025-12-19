import React from 'react';
import { Product } from '@/types';

export const ProductCardItem = ({ product, onClick }: { product: Product; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#444746] p-4 hover:shadow-md hover:border-[#A8C7FA] dark:hover:border-[#A8C7FA]/50 transition-all cursor-pointer group flex flex-col mb-3"
  >
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-semibold text-gray-900 dark:text-[#E3E3E3] group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors">
        {product.name}
      </h3>
    </div>
    <span className="text-[10px] font-mono text-gray-500 bg-gray-100 dark:bg-[#2D2E30] dark:text-gray-400 px-2 py-0.5 rounded w-fit mb-2">
      {product.ageRange}
    </span>
    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
      {product.description}
    </p>
    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-[#2D2E30] flex justify-between items-center">
      <span className="text-sm font-bold text-[#0B57D0] dark:text-[#A8C7FA]">{product.price}</span>
    </div>
  </div>
);