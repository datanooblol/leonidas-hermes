'use client';

export default function JourneyStageCard() {
  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4">
      <div className="border-b border-gray-800 pb-2 mb-3">
        <h3 className="font-bold text-sm">JOURNEY / GUIDE</h3>
      </div>
      
      <div className="space-y-4 text-sm">
        <div>
          <div className="font-medium mb-1">Stage: Greeting / Discovery / Pitch</div>
          <hr className="border-gray-300" />
        </div>
        
        <div>
          <div className="font-medium mb-2">Action: Ask Need</div>
          <div className="mb-2">
            <span className="font-medium">Explanation:</span>
            <ul className="ml-4 mt-1 space-y-1">
              <li>- Understand pain point</li>
              <li>- Ask clarifying questions</li>
            </ul>
          </div>
        </div>
        
        <div>
          <div className="font-medium mb-2">Signals:</div>
          <ul className="ml-4 space-y-1">
            <li>- hesitation</li>
            <li>- curiosity</li>
          </ul>
        </div>
        
        <div>
          <div className="font-medium mb-2">Lines to say:</div>
          <ul className="ml-4 space-y-1">
            <li>• "ขอทราบความต้องการเพิ่มเติม…"</li>
            <li>• "ตอนนี้ลูกค้ามีประกันตัวไหนอยู่?"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}