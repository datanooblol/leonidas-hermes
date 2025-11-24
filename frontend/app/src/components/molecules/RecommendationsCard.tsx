'use client';

export default function RecommendationsCard() {
  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4 text-gray-800">
      <div className="border-b border-gray-800 pb-2 mb-3">
        <h3 className="font-bold text-sm">Recommendations / Insurance Cards</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-gray-300 rounded p-3 text-xs">
          <div className="font-medium mb-2">Plan A</div>
          <div className="space-y-1 text-gray-600">
            <div>Age: xx - xx</div>
            <div>Benefit ...</div>
          </div>
        </div>
        
        <div className="border border-gray-300 rounded p-3 text-xs">
          <div className="font-medium mb-2">Plan B</div>
          <div className="space-y-1 text-gray-600">
            <div>Age: xx - xx</div>
            <div>Benefit ...</div>
          </div>
        </div>
      </div>
    </div>
  );
}