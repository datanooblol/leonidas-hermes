// "use client";

// import { useState } from "react";
// import WebSocketAudioRecorder from "../../components/WebSocketAudioRecorder";
// import WebSocketTranscriptionDisplay from "../../components/WebSocketTranscriptionDisplay";
// import DebugComponent from "../../components/DebugComponent";

// interface WebSocketMessage {
//   type?:
//     | "transcription"
//     | "information"
//     | "interest"
//     | "checklist"
//     | "guide"
//     | "products";
//   timestamp?: string;
//   transcription?: string;
//   customer_information?: any;
//   customer_interest?: any;
//   agent_checklist?: any;
//   guide?: any;
//   products?: any;
// }

// export default function WebSocketPage() {
//   const [messages, setMessages] = useState<WebSocketMessage[]>([]);

//   const handleNewMessage = (message: WebSocketMessage) => {
//     setMessages((prev) => [...prev, message]);
//   };

//   const transcriptions = messages.filter((m) => m.type === "transcription");
//   const latestInfo = messages.filter((m) => m.type === "information").pop();
//   const latestInterest = messages.filter((m) => m.type === "interest").pop();
//   const latestChecklist = messages.filter((m) => m.type === "checklist").pop();
//   const latestGuide = messages.filter((m) => m.type === "guide").pop();
//   const latestProducts = messages.filter((m) => m.type === "products").pop();

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="px-4 py-8">
//         <header className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">
//             WebSocket Debug Page
//           </h1>
//         </header>

//         <WebSocketAudioRecorder onNewTranscription={handleNewMessage} />

//         <div className="grid grid-cols-2 gap-6">
//           {/* Left Column - Transcription */}
//           <div>
//             <WebSocketTranscriptionDisplay transcriptions={transcriptions} />
//           </div>

//           {/* Right Column - Debug Data */}
//           <div className="space-y-4">
//             {latestInfo && (
//               <DebugComponent
//                 type="information"
//                 data={latestInfo.customer_information}
//               />
//             )}
//             {latestInterest && (
//               <DebugComponent
//                 type="interest"
//                 data={latestInterest.customer_interest}
//               />
//             )}
//             {latestChecklist && (
//               <DebugComponent
//                 type="checklist"
//                 data={latestChecklist.agent_checklist}
//               />
//             )}
//             {latestGuide && (
//               <DebugComponent type="guide" data={latestGuide.guide} />
//             )}
//             {latestProducts && (
//               <DebugComponent type="products" data={latestProducts.products} />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import WebSocketAudioRecorder from "../../components/WebSocketAudioRecorder";
import WebSocketTranscriptionDisplay from "../../components/WebSocketTranscriptionDisplay";
import DebugComponent from "../../components/DebugComponent";
import StageSelector from "../../components/StageSelector";

interface WebSocketMessage {
  type?:
    | "transcription"
    | "information"
    | "interest"
    | "checklist"
    | "guide"
    | "products";
  timestamp?: string;
  transcription?: string;
  customer_information?: any;
  customer_interest?: any;
  agent_checklist?: any;
  guide?: any;
  products?: any;
}

export default function WebSocketPage() {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [websocket, setWebSocket] = useState<WebSocket | null>(null);

  const handleNewMessage = (message: WebSocketMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleWebSocketReady = (ws: WebSocket) => {
    setWebSocket(ws);
  };

  const transcriptions = messages.filter((m) => m.type === "transcription");
  const latestInfo = messages.filter((m) => m.type === "information").pop();
  const latestInterest = messages.filter((m) => m.type === "interest").pop();
  const latestChecklist = messages.filter((m) => m.type === "checklist").pop();
  const latestGuide = messages.filter((m) => m.type === "guide").pop();
  const latestProducts = messages.filter((m) => m.type === "products").pop();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            WebSocket Debug Page
          </h1>
        </header>

        <WebSocketAudioRecorder 
          onNewTranscription={handleNewMessage}
          onWebSocketReady={handleWebSocketReady}
        />

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Transcription */}
          <div>
            <WebSocketTranscriptionDisplay transcriptions={transcriptions} />
          </div>

          {/* Right Column - Stage Selector + Debug Data */}
          <div className="space-y-4">
            <StageSelector websocket={websocket} messages={messages} />
            <DebugComponent
              type="information"
              data={latestInfo?.customer_information || null}
            />
            <DebugComponent
              type="interest"
              data={latestInterest?.customer_interest || null}
            />
            <DebugComponent
              type="checklist"
              data={latestChecklist?.agent_checklist || null}
            />
            <DebugComponent type="guide" data={latestGuide?.guide || null} />
            <DebugComponent
              type="products"
              data={latestProducts?.products || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
