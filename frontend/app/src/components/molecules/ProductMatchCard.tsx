'use client';

export default function ProductMatchCard() {
  const plans = [
    { name: 'Plan A', age: 'xx–xx', premium: 'XXX', benefit: 'Benefit...' },
    { name: 'Plan B', age: 'xx–xx', premium: 'XXX', benefit: 'Benefit...' },
    { name: 'Plan C', age: 'xx–xx', premium: 'XXX', benefit: 'Benefit...' },
    { name: 'Plan D', age: 'xx–xx', premium: 'XXX', benefit: 'Benefit...' }
  ];

  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4">
      <div className="border-b border-gray-800 pb-2 mb-3">
        <h3 className="font-bold text-sm">PRODUCT MATCH</h3>
      </div>
      
      <div className="space-y-3">
        {plans.map((plan, index) => (
          <div key={index} className="border border-gray-300 rounded p-3">
            <div className="font-bold text-sm mb-2">{plan.name}</div>
            <div className="text-xs space-y-1">
              <div>Age: {plan.age}</div>
              <div>Premium: {plan.premium}</div>
              <div>{plan.benefit}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}