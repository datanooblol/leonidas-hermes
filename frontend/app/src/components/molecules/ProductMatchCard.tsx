'use client';

import { Product } from '../../types';

interface ProductMatchCardProps {
  products?: Product[];
}

export default function ProductMatchCard({ products = [] }: ProductMatchCardProps) {
  return (
    <div className="bg-white border border-gray-600 rounded p-1 h-full flex flex-col">
      <div className="border-b border-gray-600 pb-1 mb-1 flex-shrink-0">
        <h3 className="font-bold text-xs">PRODUCT MATCH</h3>
        {!products || products.length === 0 ? (
          <span className="text-xs text-red-500">No products yet</span>
        ) : (
          <span className="text-xs text-green-500">{products.length} products</span>
        )}
      </div>
      
      <div className="space-y-1 flex-1 overflow-auto">
        {products.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-4">
            No products recommended yet...
          </div>
        ) : (
          products.map((product, index) => (
            <div key={index} className="border border-gray-300 rounded p-1">
              <div className="font-bold text-xs mb-1">{product.product_name}</div>
              <div className="text-xs space-y-1">
                <div>Premium: {product.premium_min_month_thb.toLocaleString()}-{product.premium_max_month_thb.toLocaleString()} THB/month</div>
                <div>Age: {product.age_min}-{product.age_max} years</div>
                <div>{product.objective}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}