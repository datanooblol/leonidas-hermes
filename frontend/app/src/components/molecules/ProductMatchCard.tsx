'use client';

interface Product {
  product_name: string;
  product_code: string;
  description: string;
  premium: number;
}

interface ProductMatchCardProps {
  products?: Product[];
}

export default function ProductMatchCard({ products }: ProductMatchCardProps) {
  const defaultProducts: Product[] = [
    { product_name: 'Plan A', product_code: 'PA001', description: 'Benefit...', premium: 1000 },
    { product_name: 'Plan B', product_code: 'PB002', description: 'Benefit...', premium: 1500 },
    { product_name: 'Plan C', product_code: 'PC003', description: 'Benefit...', premium: 2000 },
    { product_name: 'Plan D', product_code: 'PD004', description: 'Benefit...', premium: 2500 }
  ];
  
  const displayProducts = products || defaultProducts;

  return (
    <div className="bg-white border border-gray-600 rounded p-1 h-full flex flex-col">
      <div className="border-b border-gray-600 pb-1 mb-1 flex-shrink-0">
        <h3 className="font-bold text-xs">PRODUCT MATCH</h3>
        {!products || products.length === 0 ? (
          <span className="text-xs text-red-500">No data from backend</span>
        ) : (
          <span className="text-xs text-green-500">Data received</span>
        )}
      </div>
      
      <div className="space-y-1 flex-1 overflow-auto">
        {displayProducts.map((product, index) => (
          <div key={index} className="border border-gray-300 rounded p-1">
            <div className="font-bold text-xs mb-1">{product.product_name}</div>
            <div className="text-xs space-y-1">
              <div>Code: {product.product_code}</div>
              <div>Premium: {product.premium}</div>
              <div>{product.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}