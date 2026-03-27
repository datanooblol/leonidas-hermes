import React, { useState } from 'react';
import { Play, ChevronRight, ChevronLeft, ChevronDown, MessageSquare, AlertCircle, CheckCircle2, User, Heart } from 'lucide-react';
import simulationActions from '@/data/simulationActions.json';
// ✅ Import Components ที่เราแยกไว้
import { SimulationChatInput, SimulationActionBtn } from '../molecules';

// --- Types ---
interface SimulationAction {
  label: string;
  text: string;
  type: string;
}

interface DiscoverStageData {
  INFO: SimulationAction[];
  INTERESTS: SimulationAction[];
}

type StageData = SimulationAction[] | DiscoverStageData;

interface SimulationSidebarProps {
  isOpen: boolean;
  toggle: () => void;
  onSendText?: (text: string, stageId: string) => void;
}

export const SimulationSidebar = ({ isOpen, toggle, onSendText }: SimulationSidebarProps) => {
  const [expandedStage, setExpandedStage] = useState<string | null>('DISCOVER');
  
  // ❌ ลบ State inputText, infoInput, interestsInput ออกไปได้เลย! (ตัวลูกจัดการเองแล้ว)

  const stages = [
    { id: 'GREET', title: 'บทสนทนา GREET', icon: MessageSquare },
    { id: 'DISCOVER', title: 'บทสนทนา DISCOVERY', icon: MessageSquare },
    { id: 'PITCH', title: 'บทสนทนา PITCH', icon: MessageSquare },
    { id: 'OBJECTION', title: 'บทสนทนา OBJECTION', icon: AlertCircle },
    { id: 'CLOSING', title: 'บทสนทนา CLOSING', icon: CheckCircle2 },
  ];

  const handleSendText = (text: string, stageId: string) => {
    if (onSendText) onSendText(text, stageId);
    else console.log(`[Mock Send Text] Stage: ${stageId} | Text: ${text}`);
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-[#F0F4F9] dark:bg-[#131314] border-r border-gray-200 dark:border-[#444746] transform transition-transform duration-300 ease-in-out flex flex-col pt-16 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#444746] bg-white dark:bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-2">
          <Play className="text-purple-600 dark:text-purple-500" size={18} fill="currentColor" />
          <h2 className="font-bold text-gray-800 dark:text-[#E3E3E3] text-sm tracking-wide">SIMULATION CONTROLLER</h2>
        </div>
      </div>

      {/* Accordion Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
         {stages.map((stage) => {
           const stageData = simulationActions[stage.id as keyof typeof simulationActions] as StageData;

           return (
             <div key={stage.id} className="border border-gray-200 dark:border-[#444746] rounded-xl overflow-hidden bg-white dark:bg-[#1E1F20] shadow-sm flex flex-col">
               
               <button 
                 onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                 className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-[#131314] hover:bg-gray-100 dark:hover:bg-[#2D2E30] transition-colors"
               >
                 <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 text-sm font-bold">
                   <stage.icon size={16} className="text-gray-400 dark:text-gray-500" />
                   {stage.title}
                 </div>
                 {expandedStage === stage.id ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
               </button>

               {expandedStage === stage.id && (
                 <div className="p-3 space-y-4 bg-white dark:bg-[#1E1F20] flex-1 flex flex-col">
                   
                   {/* 🌟 DISCOVER Case */}
                   {stage.id === 'DISCOVER' ? (() => {
                     const discoverData = stageData as DiscoverStageData;
                     
                     return (
                       <div className="space-y-4">
                         {/* 1. Customer Info */}
                         <div className="p-2.5 bg-gray-50 dark:bg-[#0a0a0a]/50 rounded-xl border border-gray-200 dark:border-[#444746] flex flex-col gap-2">
                           <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 px-1 mb-1">
                             <User size={14} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
                             <span className="text-[10px] font-bold uppercase tracking-wider">Customer Info</span>
                           </div>
                           
                           <div className="space-y-2">
                              {/* ✅ ใช้ SimulationActionBtn ที่แยกไว้ */}
                              {discoverData.INFO?.map((action, idx) => (
                                <SimulationActionBtn key={`info-${idx}`} action={action} onClick={() => handleSendText(action.text, stage.id)} />
                              ))}
                           </div>

                           {/* ✅ ใช้ SimulationChatInput แทนโค้ดยาวๆ */}
                           <SimulationChatInput placeholder="พิมพ์ข้อมูลลูกค้า..." onSend={(text) => handleSendText(text, stage.id)} />
                         </div>

                         {/* 2. Interests */}
                         <div className="p-2.5 bg-gray-50 dark:bg-[#0a0a0a]/50 rounded-xl border border-gray-200 dark:border-[#444746] flex flex-col gap-2">
                           <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 px-1 mb-1">
                             <Heart size={14} className="text-red-500 dark:text-red-400" />
                             <span className="text-[10px] font-bold uppercase tracking-wider">Interests</span>
                           </div>
                           
                           <div className="space-y-2">
                              {discoverData.INTERESTS?.map((action, idx) => (
                                <SimulationActionBtn key={`interest-${idx}`} action={action} onClick={() => handleSendText(action.text, stage.id)} />
                              ))}
                           </div>

                           <SimulationChatInput placeholder="พิมพ์ความสนใจ..." onSend={(text) => handleSendText(text, stage.id)} />
                         </div>
                       </div>
                     );
                   })() : (() => {
                     // 🌟 Normal Case (Stage อื่นๆ)
                     const regularData = stageData as SimulationAction[];
                     return (
                       <>
                         <div className="space-y-2">
                            {regularData.map((action, idx) => (
                              <SimulationActionBtn key={idx} action={action} onClick={() => handleSendText(action.text, stage.id)} />
                            ))}
                         </div>
                         <SimulationChatInput placeholder="จำลองสิ่งที่ลูกค้าพูด..." onSend={(text) => handleSendText(text, stage.id)} />
                       </>
                     );
                   })()}
                 </div>
               )}
             </div>
           );
         })}
      </div>

      {/* 🟣 แท็บดึง Simulation Sidebar (สีม่วง) */}
      <button 
        onClick={toggle}
        className="absolute -right-8 top-24 w-8 h-16 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-r-xl shadow-[4px_0_15px_-3px_rgba(147,51,234,0.3)] transition-all cursor-pointer border border-l-0 border-purple-700 dark:border-purple-500"
        title="Simulation Panel"
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </div>
  );
};