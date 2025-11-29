'use client';

import { Product } from '../../types';
import { useState } from 'react';

interface ProductMatchCardProps {
  products?: Product[];
}

export default function ProductMatchCard({ products = [] }: ProductMatchCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  const currentProducts = products.slice(currentIndex, currentIndex + itemsPerPage);
  
  const nextPage = () => {
    if (currentIndex + itemsPerPage < products.length) {
      setCurrentIndex(currentIndex + itemsPerPage);
    }
  };
  
  const prevPage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - itemsPerPage);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3 flex justify-between items-center">
        <div>
          {!products || products.length === 0 ? (
            <span className="text-sm text-red-500">No products yet</span>
          ) : (
            <span className="text-sm text-green-500">{products.length} products available</span>
          )}
        </div>
        
        {products.length > itemsPerPage && (
          <div className="flex items-center gap-2">
            <button 
              onClick={prevPage}
              disabled={currentIndex === 0}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs disabled:bg-gray-300"
            >
              ←
            </button>
            <span className="text-xs">
              {Math.floor(currentIndex / itemsPerPage) + 1} / {totalPages}
            </span>
            <button 
              onClick={nextPage}
              disabled={currentIndex + itemsPerPage >= products.length}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs disabled:bg-gray-300"
            >
              →
            </button>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <div>No products recommended yet...</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 h-full">
            {currentProducts.map((product, index) => (
              <div key={index} className="bg-white border-2 border-blue-200 rounded-lg p-2 hover:shadow-lg transition-shadow overflow-hidden">
                <div className="font-bold text-sm mb-2 text-blue-700 truncate">{product.product_name}</div>
                <div className="space-y-1 text-xs">
                  <div className="bg-blue-50 p-1 rounded">
                    <strong>Premium:</strong><br />
                    {product.premium_min_month_thb.toLocaleString()}-{product.premium_max_month_thb.toLocaleString()} THB/month
                  </div>
                  <div className="bg-gray-50 p-1 rounded">
                    <strong>Age:</strong> {product.age_min}-{product.age_max} years
                  </div>
                  <div className="text-gray-600 text-xs">
                    <strong>Objective:</strong> {product.objective}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}