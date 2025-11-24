'use client';

export default function SentimentCard() {
  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4 text-gray-800">
      <div className="border-b border-gray-800 pb-2 mb-3">
        <h3 className="font-bold text-sm">Sentiment</h3>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <span className="text-xl">😀</span>
        <span className="font-medium">XX%</span>
      </div>
    </div>
  );
}