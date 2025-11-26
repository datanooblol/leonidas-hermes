"use client";

interface Product {
  product_id: string;
  product_name: string;
  objective: string;
  premium_min_month_thb: number;
  premium_max_month_thb: number;
  age_min: number;
  age_max: number;
  notes: string;
}

interface ProductCardProps {
  products: Product[] | null;
}

export default function ProductCard({ products }: ProductCardProps) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="font-semibold text-lg mb-3 text-gray-800">Products</h3>
        <p className="text-gray-500">No products available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Products</h3>
      <div className="flex flex-wrap gap-4">
        {products.map((product) => (
          <div key={product.product_id} className="border rounded-lg p-4 bg-gray-50 flex-1 min-w-64">
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              {product.product_name}
            </h4>
            <p className="text-gray-700 mb-3">
              {product.objective} - {product.notes}
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Premium:</span> ฿{product.premium_min_month_thb} - ฿{product.premium_max_month_thb}
              </div>
              <div>
                <span className="font-medium">Purchase Age:</span> {product.age_min} - {product.age_max}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}