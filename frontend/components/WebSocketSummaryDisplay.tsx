// "use client";

// interface SummaryResult {
//   type: string;
//   summary: string;
//   timestamp?: string;
// }

// interface WebSocketSummaryDisplayProps {
//   summaries: SummaryResult[];
// }

// export default function WebSocketSummaryDisplay({
//   summaries,
// }: WebSocketSummaryDisplayProps) {
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h2 className="text-xl font-bold mb-4">📋 Summary</h2>

//       <div className="space-y-3 max-h-96 overflow-y-auto">
//         {summaries.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             <div className="text-4xl mb-2">📄</div>
//             <p>No summaries yet</p>
//             <p className="text-sm">Summaries will appear here</p>
//           </div>
//         ) : (
//           summaries.map((summary, index) => (
//             <div
//               key={index}
//               className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg"
//             >
//               <div className="text-blue-800 leading-relaxed">
//                 {summary.summary}
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
// "use client";

// import ReactMarkdown from "react-markdown";

// interface SummaryResult {
//   type: string;
//   summary: string;
//   timestamp?: string;
// }

// interface WebSocketSummaryDisplayProps {
//   summaries: SummaryResult[];
// }

// export default function WebSocketSummaryDisplay({
//   summaries,
// }: WebSocketSummaryDisplayProps) {
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h2 className="text-xl font-bold mb-4">📋 Summary</h2>

//       <div className="space-y-3 max-h-96 overflow-y-auto">
//         {summaries.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             <div className="text-4xl mb-2">📄</div>
//             <p>No summaries yet</p>
//             <p className="text-sm">Summaries will appear here</p>
//           </div>
//         ) : (
//           summaries.map((summary, index) => (
//             <div
//               key={index}
//               className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg"
//             >
//               <div className="text-blue-800 leading-relaxed prose prose-sm max-w-none">
//                 <ReactMarkdown>{summary.summary}</ReactMarkdown>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SummaryResult {
  type: string;
  summary: string;
  timestamp?: string;
}

interface WebSocketSummaryDisplayProps {
  summaries: SummaryResult[];
}

export default function WebSocketSummaryDisplay({
  summaries,
}: WebSocketSummaryDisplayProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">📋 Summary</h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {summaries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <p>No summaries yet</p>
            <p className="text-sm">Summaries will appear here</p>
          </div>
        ) : (
          summaries.map((summary, index) => (
            <div
              key={index}
              className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg"
            >
              <div className="text-blue-800 leading-relaxed prose prose-sm max-w-none prose-table:table-auto prose-th:border prose-th:border-gray-300 prose-th:px-2 prose-th:py-1 prose-th:bg-gray-100 prose-td:border prose-td:border-gray-300 prose-td:px-2 prose-td:py-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summary.summary}
                </ReactMarkdown>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
