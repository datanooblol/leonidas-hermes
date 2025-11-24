'use client';

export default function SalesChecklistCard() {
  const checklistItems = [
    'Q1 - Greeting',
    'Q2 - Needs Ask', 
    'Q3 - Objection Check',
    'Q4 - Closing'
  ];

  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4 text-gray-800">
      <div className="border-b border-gray-800 pb-2 mb-3">
        <h3 className="font-bold text-sm">Sale Script Checklist</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        {checklistItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input 
              type="checkbox" 
              className="w-4 h-4 border border-gray-400"
              disabled
            />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}