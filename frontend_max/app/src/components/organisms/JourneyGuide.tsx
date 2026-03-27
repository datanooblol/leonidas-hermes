// import React from 'react';
// import { Check, Info, Lightbulb, Sparkles } from 'lucide-react';
// import { Stage } from '@/types';
// import { STAGE_CONTENT } from '@/data/mock';
// import { Card } from '../atoms';

// interface JourneyGuideProps {
//   currentStage: Stage;
//   progress: number;
//   stages: Stage[];
//   onStageChange: (stage: Stage) => void;
// }

// export const JourneyGuide = ({ currentStage, progress, stages, onStageChange }: JourneyGuideProps) => {
//   return (
//     <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden pb-2">
//       {/* Main Container Card */}
//       <Card className="flex-1 flex flex-col relative overflow-hidden h-full shadow-md border-gray-200 dark:border-[#444746] bg-white dark:bg-[#131314]">
        
//         {/* Header */}
//         <div className="px-6 py-4 border-b border-gray-200 dark:border-[#444746] flex justify-between items-center bg-gray-50/80 dark:bg-[#1E1F20] backdrop-blur-sm shrink-0">
//           <div className="flex items-center gap-2">
//             <div className="w-1 h-4 bg-[#0B57D0] dark:bg-[#A8C7FA] rounded-full"></div>
//             <h2 className="font-bold text-base text-gray-900 dark:text-gray-100 tracking-tight">Journey Guide</h2>
//           </div>
//           <div className="text-[10px] text-gray-400 font-mono bg-gray-100 dark:bg-[#2D2E30] px-2 py-1 rounded">ID: REF-2024-X99</div>
//         </div>

//         {/* Content Wrapper */}
//         <div className="flex-1 flex flex-col overflow-hidden">
          
//           {/* Progress Bar Section (Fixed Top) */}
//           <div className="px-8 py-8 bg-white dark:bg-[#1E1F20] z-20 shadow-sm border-b border-gray-100 dark:border-[#2D2E30] shrink-0">
//             <div className="relative max-w-4xl mx-auto">
//                {/* Background Line */}
//                <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 dark:bg-[#444746] -translate-y-1/2 rounded-full" style={{ left: '16px', width: 'calc(100% - 32px)' }}></div>
               
//                {/* Active Progress Line */}
//                <div 
//                  className="absolute top-4 left-0 h-1 bg-green-500 -translate-y-1/2 transition-all duration-300 ease-out rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"
//                  style={{ left: '16px', width: `calc(${progress}% - ${32 * (progress / 100)}px)` }}
//                ></div>

//                {/* Stage Nodes */}
//                <div className="relative flex justify-between items-center z-10">
//                  {stages.map((stage, idx) => {
//                    const isActive = stage === currentStage;
//                    const stageThreshold = (idx / (stages.length - 1)) * 100;
//                    const isPast = progress >= stageThreshold;

//                    return (
//                      <button 
//                        key={stage}
//                        onClick={() => onStageChange(stage)}
//                        className="flex flex-col items-center gap-3 group focus:outline-none transition-all duration-300"
//                      >
//                        <div 
//                          className={`w-8 h-8 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 ${isActive ? 'border-yellow-400 bg-[#1E1F20] scale-125 shadow-[0_0_15px_rgba(250,204,21,0.5)] z-20' : isPast ? 'border-green-500 bg-green-500 z-10' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2D2E30] group-hover:border-gray-400'}`}
//                        >
//                           {isPast && !isActive && <Check size={14} className="text-white stroke-3" />}
//                           {isActive && <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse"></div>}
//                        </div>
//                        {/* ✅ แก้ className เป็นบรรทัดเดียว */}
//                        <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 ${isActive ? 'text-yellow-600 dark:text-yellow-400 translate-y-0' : 'text-gray-400 dark:text-gray-500 translate-y-1'}`}>
//                          {stage}
//                        </span>
//                      </button>
//                    )
//                  })}
//                </div>
//             </div>
//           </div>

//           {/* Dynamic Content Panel (Flex Column Layout) */}
//           <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50 dark:bg-[#131314]/50 relative">
            
//             {/* 1. Scrollable Content Area (Action + Lines) */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
//               {/* Current Action Banner */}
//               <div className="bg-white dark:bg-[#1E1F20] rounded-xl border-l-4 border-l-[#0B57D0] border-y border-r border-gray-200 dark:border-[#444746] p-6 shadow-sm relative overflow-hidden group">
//                  <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
//                     <Lightbulb size={120} />
//                  </div>
                 
//                  <div className="flex items-center justify-between mb-4 relative z-10">
//                    <h3 className="text-xs font-bold text-[#0B57D0] dark:text-[#A8C7FA] uppercase tracking-widest flex items-center gap-2">
//                      <span className="w-2 h-2 bg-[#0B57D0] dark:bg-[#A8C7FA] rounded-full animate-pulse"></span>
//                      Current Action
//                    </h3>
//                    <div className="flex gap-2">
//                        {STAGE_CONTENT[currentStage].tags.map(tag => (
//                          <span key={tag} className="px-2.5 py-1 bg-gray-100 dark:bg-[#2D2E30] border border-gray-200 dark:border-[#444746] rounded-md text-[10px] font-semibold text-gray-600 dark:text-gray-300">
//                            {tag}
//                          </span>
//                        ))}
//                    </div>
//                  </div>
                 
//                  <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight relative z-10">
//                    {STAGE_CONTENT[currentStage].action}
//                  </p>
//               </div>

//               {/* Suggested Lines List */}
//               <div className="flex flex-col">
//                   <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 pl-1">
//                     <Sparkles size={12} /> Suggested Lines
//                   </h3>
//                   <div className="space-y-3">
//                     {STAGE_CONTENT[currentStage].lines.map((line, idx) => (
//                       // ✅ แก้ className เป็นบรรทัดเดียว
//                       <div 
//                         key={idx} 
//                         className="p-5 bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#444746] rounded-xl shadow-sm hover:border-[#0B57D0] dark:hover:border-[#A8C7FA] hover:shadow-md transition-all duration-200 cursor-pointer group flex items-start gap-4"
//                       >
//                          <div className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-[#0B57D0] dark:group-hover:bg-[#A8C7FA] group-hover:scale-150 transition-all shrink-0"></div>
//                          <p className="text-lg font-medium text-gray-700 dark:text-[#E3E3E3] group-hover:text-black dark:group-hover:text-white leading-relaxed">
//                           &quot;{line}&quot;
//                          </p>
//                       </div>
//                     ))}
//                   </div>
//               </div>
//             </div>

//             {/* 2. Guidance Section (Pinned to Bottom) */}
//             <div className="shrink-0 p-4 border-t border-gray-200 dark:border-[#444746] bg-blue-50/80 dark:bg-[#1E1F20]/90 backdrop-blur-md">
//                <div className="flex items-start gap-3 max-w-4xl mx-auto">
//                   <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0 mt-0.5">
//                     <Info size={18} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
//                   </div>
//                   <div>
//                     <h3 className="text-xs font-bold text-[#0B57D0] dark:text-[#A8C7FA] uppercase tracking-wide mb-1">
//                       Guidance & Explanation
//                     </h3>
//                     <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
//                        {STAGE_CONTENT[currentStage].explanation}
//                     </p>
//                   </div>
//                </div>
//             </div>

//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

import { Check, Info, Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '../atoms';
import { Stage } from '@/types';

// ✅ กำหนด Type ของคำแนะนำจาก AI
interface AiSuggestion {
  action: string;
  tags: string[];
  lines: string[];
  explanation: string;
}

interface JourneyGuideProps {
  currentStage: Stage;
  progress: number;
  stages: Stage[];
  onStageChange: (stage: Stage) => void;
  // ✅ รับค่าใหม่มาจากแม่
  aiSuggestion: AiSuggestion;
  isAiProcessing: boolean;
}

export const JourneyGuide = ({ currentStage, progress, stages, onStageChange, aiSuggestion, isAiProcessing }: JourneyGuideProps) => {
  return (
    <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden pb-2">
      <Card className="flex-1 flex flex-col relative overflow-hidden h-full shadow-md border-gray-200 dark:border-[#444746] bg-white dark:bg-[#131314]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#444746] flex justify-between items-center bg-gray-50/80 dark:bg-[#1E1F20] backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#0B57D0] dark:bg-[#A8C7FA] rounded-full"></div>
            <h2 className="font-bold text-base text-gray-900 dark:text-gray-100 tracking-tight">Journey Guide</h2>
          </div>
          <div className="text-[10px] text-gray-400 font-mono bg-gray-100 dark:bg-[#2D2E30] px-2 py-1 rounded flex items-center gap-2">
            {/* โชว์ไฟกระพริบตอน AI กำลังคิด */}
            {isAiProcessing && <span className="flex w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>}
            ID: REF-2024-X99
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Progress Bar (โค้ดเดิม) */}
          <div className="px-8 py-8 bg-white dark:bg-[#1E1F20] z-20 shadow-sm border-b border-gray-100 dark:border-[#2D2E30] shrink-0">
            <div className="relative max-w-4xl mx-auto">
               <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 dark:bg-[#444746] -translate-y-1/2 rounded-full" style={{ left: '16px', width: 'calc(100% - 32px)' }}></div>
               <div className="absolute top-4 left-0 h-1 bg-green-500 -translate-y-1/2 transition-all duration-300 ease-out rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" style={{ left: '16px', width: `calc(${progress}% - ${32 * (progress / 100)}px)` }}></div>
               <div className="relative flex justify-between items-center z-10">
                 {stages.map((stage, idx) => {
                   const isActive = stage === currentStage;
                   const stageThreshold = (idx / (stages.length - 1)) * 100;
                   const isPast = progress >= stageThreshold;
                   return (
                     <button key={stage} onClick={() => onStageChange(stage)} className="flex flex-col items-center gap-3 group focus:outline-none transition-all duration-300">
                       <div className={`w-8 h-8 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 ${isActive ? 'border-yellow-400 bg-[#1E1F20] scale-125 shadow-[0_0_15px_rgba(250,204,21,0.5)] z-20' : isPast ? 'border-green-500 bg-green-500 z-10' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2D2E30] group-hover:border-gray-400'}`}>
                          {isPast && !isActive && <Check size={14} className="text-white stroke-[3]" />}
                          {isActive && <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse"></div>}
                       </div>
                       <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 ${isActive ? 'text-yellow-600 dark:text-yellow-400 translate-y-0' : 'text-gray-400 dark:text-gray-500 translate-y-1'}`}>{stage}</span>
                     </button>
                   )
                 })}
               </div>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50 dark:bg-[#131314]/50 relative">
            
            {/* 🌟 Loading Overlay (แสดงทับตอน AI คิด) */}
            {isAiProcessing && (
              <div className="absolute inset-0 z-30 bg-white/60 dark:bg-[#131314]/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                <Loader2 className="animate-spin text-purple-600 dark:text-purple-400 mb-4" size={48} />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-widest animate-pulse">AI IS ANALYZING...</p>
              </div>
            )}

            {/* 🌟 แสดงข้อมูลจาก aiSuggestion */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar transition-opacity duration-300 ${isAiProcessing ? 'opacity-30' : 'opacity-100'}`}>
              
              <div className="bg-white dark:bg-[#1E1F20] rounded-xl border-l-4 border-l-[#0B57D0] border-y border-r border-gray-200 dark:border-[#444746] p-6 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500"><Lightbulb size={120} /></div>
                 <div className="flex items-center justify-between mb-4 relative z-10">
                   <h3 className="text-xs font-bold text-[#0B57D0] dark:text-[#A8C7FA] uppercase tracking-widest flex items-center gap-2">
                     <span className="w-2 h-2 bg-[#0B57D0] dark:bg-[#A8C7FA] rounded-full animate-pulse"></span> Current Action
                   </h3>
                   <div className="flex gap-2">{aiSuggestion.tags.map(tag => <span key={tag} className="px-2.5 py-1 bg-gray-100 dark:bg-[#2D2E30] border border-gray-200 dark:border-[#444746] rounded-md text-[10px] font-semibold text-gray-600 dark:text-gray-300">{tag}</span>)}</div>
                 </div>
                 <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight relative z-10">{aiSuggestion.action}</p>
              </div>

              <div className="flex flex-col">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 pl-1"><Sparkles size={12} /> Suggested Lines</h3>
                  <div className="space-y-3">
                    {aiSuggestion.lines.map((line, idx) => (
                      <div key={idx} className="p-5 bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#444746] rounded-xl shadow-sm hover:border-[#0B57D0] dark:hover:border-[#A8C7FA] hover:shadow-md transition-all duration-200 cursor-pointer group flex items-start gap-4">
                         <div className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-[#0B57D0] dark:group-hover:bg-[#A8C7FA] group-hover:scale-150 transition-all shrink-0"></div>
                         <p className="text-lg font-medium text-gray-700 dark:text-[#E3E3E3] group-hover:text-black dark:group-hover:text-white leading-relaxed">&quot;{line}&quot;</p>
                      </div>
                    ))}
                  </div>
              </div>
            </div>

            <div className="shrink-0 p-4 border-t border-gray-200 dark:border-[#444746] bg-blue-50/80 dark:bg-[#1E1F20]/90 backdrop-blur-md">
               <div className="flex items-start gap-3 max-w-4xl mx-auto">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0 mt-0.5"><Info size={18} className="text-[#0B57D0] dark:text-[#A8C7FA]" /></div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0B57D0] dark:text-[#A8C7FA] uppercase tracking-wide mb-1">Guidance & Explanation</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{aiSuggestion.explanation}</p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </Card>
    </div>
  );
};