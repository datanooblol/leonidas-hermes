'use client';

export default function JourneyStageCard() {
  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4 text-gray-800">
      <div className="border-b border-gray-800 pb-2 mb-3">
        <h3 className="font-bold text-sm">Journey Stage</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>
            <div className="w-4 h-0.5 bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>
            <div className="w-4 h-0.5 bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>
          </div>
        </div>
        
        <div>
          <span className="font-medium">Stage:</span>
          <span className="ml-2">Act 1/2/3</span>
        </div>
      </div>
    </div>
  );
}