// import { useState } from 'react';
// import { Stage } from '@/types';
// import mockAiResponses from '@/data/mockAiResponses.json';

// const DEFAULT_SUGGESTION = {
//   action: "กล่าวทักทายลูกค้าด้วยความสุภาพ และแนะนำตัวพร้อมแจ้งวัตถุประสงค์",
//   tags: ["Greeting", "Polite"],
//   lines: [
//     "สวัสดีครับ เรียนสายคุณลูกค้าสมชาย ใจดี ใช่ไหมครับ?",
//     "ผมชื่อ [ชื่อคุณ] ติดต่อจากบริษัท... ขออนุญาตรบกวนเวลาสัก 2 นาทีเพื่อนำเสนอสิทธิประโยชน์นะครับ"
//   ],
//   explanation: "การทักทายที่ดีต้องชัดเจนว่าเราคือใคร และขออนุญาตลูกค้าก่อนเสมอ"
// };

// export const useTeleSaleSimulation = () => {
//   // ✅ 1. แก้เป็น 'Greet'
//   const [currentStage, setCurrentStage] = useState<Stage>('Greet');
//   const [isRecording, setIsRecording] = useState(false);
//   const [showWarning, setShowWarning] = useState(false);
  
//   const [aiSuggestion, setAiSuggestion] = useState(DEFAULT_SUGGESTION);
//   const [isAiProcessing, setIsAiProcessing] = useState(false);

//   const toggleRecording = () => setIsRecording(!isRecording);
  
//   const handleStageChange = (stage: Stage) => {
//     setCurrentStage(stage);
//   };

//   const resetSimulation = () => {
//     // ✅ 2. แก้เป็น 'Greet'
//     setCurrentStage('Greet');
//     setIsRecording(false);
//     setShowWarning(false);
//     setAiSuggestion(DEFAULT_SUGGESTION);
//   };

//   const simulateCustomerResponse = (text: string, stageId: string) => {
//     console.log(`[API REQUEST] Sending to AI: "${text}" from stage: ${stageId}`);
//     setIsAiProcessing(true);

//     setTimeout(() => {
//       const response = (mockAiResponses as any)[text];

//       if (response) {
//         setAiSuggestion({
//           action: response.action,
//           tags: response.tags,
//           lines: response.lines,
//           explanation: response.explanation
//         });
        
//         if (response.nextStage && response.nextStage !== currentStage) {
//           setCurrentStage(response.nextStage as Stage);
//         }
//       } else {
//         console.log("AI: ไม่มีข้อมูลตรงกันใน Mock Database");
//       }

//       setIsAiProcessing(false);
//     }, 1500);
//   };

//   return {
//     currentStage,
//     isRecording,
//     showWarning,
//     setShowWarning,
//     // ✅ 3. แก้เงื่อนไขเป็น 'Greet', 'Discover', 'Pitch'
//     progress: currentStage === 'Greet' ? 25 : currentStage === 'Discover' ? 50 : currentStage === 'Pitch' ? 75 : 100,
//     toggleRecording,
//     handleStageChange,
//     resetSimulation,
    
//     aiSuggestion,
//     isAiProcessing,
//     simulateCustomerResponse
//   };
// };

import { useState } from 'react';
import { Stage, CustomerInfo } from '@/types';
import mockAiResponses from '@/data/mockAiResponses.json';

// 🌟 1. ประกาศ Type ให้ชัดเจน (ไม่ต้องไปยัดไส้ข้างนอก)
export interface WarningData {
  title: string;
  concern: string;
  action: string;
  tags: string[];
  lines: string[];
  explanation: string;
}

interface AiResponse {
  action: string;
  tags: string[];
  lines: string[];
  explanation: string;
  nextStage?: string;
  extractedData?: {
    customer?: Partial<CustomerInfo>;
    interests?: Record<string, boolean>;
  };
}

type MockAiDatabase = Record<string, AiResponse>;

const DEFAULT_SUGGESTION = {
  action: "กล่าวทักทายลูกค้าด้วยความสุภาพ และแนะนำตัวพร้อมแจ้งวัตถุประสงค์",
  tags: ["Greeting", "Polite"],
  lines: [
    "สวัสดีครับ เรียนสายคุณลูกค้าสมชาย ใจดี ใช่ไหมครับ?",
    "ผมชื่อ [ชื่อคุณ] ติดต่อจากบริษัท [ชื่อบริษัท] นะครับ",
    "ขออนุญาตรบกวนเวลาสัก 2-3 นาที เพื่อนำเสนอสิทธิประโยชน์พิเศษสำหรับลูกค้าคนสำคัญนะครับ"
  ],
  explanation: "การทักทายที่ดีต้องชัดเจนว่าเราคือใคร และขออนุญาตลูกค้าก่อนเสมอ"
};

export const useTeleSaleSimulation = () => {
  const [currentStage, setCurrentStage] = useState<Stage>('Greet');
  const [isRecording, setIsRecording] = useState(false);
  
  // 🌟 2. เปลี่ยนจากการเก็บแค่ true/false มาเป็นการเก็บข้อมูล Warning ทั้งก้อน
  const [warningData, setWarningData] = useState<WarningData | null>(null);
  
  const [aiSuggestion, setAiSuggestion] = useState(DEFAULT_SUGGESTION);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const toggleRecording = () => setIsRecording(!isRecording);
  const handleStageChange = (stage: Stage) => setCurrentStage(stage);

  const resetSimulation = () => {
    setCurrentStage('Greet');
    setIsRecording(false);
    setWarningData(null); // เคลียร์ Warning
    setAiSuggestion(DEFAULT_SUGGESTION);
  };

  const simulateCustomerResponse = (
    text: string, 
    stageId: string, 
    onExtracted?: (data: AiResponse['extractedData']) => void
  ) => {
    console.log(`[API REQUEST] Sending to AI: "${text}" from stage: ${stageId}`);
    setIsAiProcessing(true);

    setTimeout(() => {
      const database = mockAiResponses as MockAiDatabase;
      const response = database[text];

      if (response) {
        setAiSuggestion({
          action: response.action,
          tags: response.tags,
          lines: response.lines,
          explanation: response.explanation
        });
        
        if (response.nextStage && response.nextStage !== currentStage) {
          setCurrentStage(response.nextStage as Stage);
        }

        if (response.extractedData && onExtracted) {
          onExtracted(response.extractedData);
        }

        // 🌟 3. ปั้นข้อมูล Warning ให้สมบูรณ์จากตรงนี้เลย!
        if (response.tags.includes("Objection")) {
          setWarningData({
            title: "⚠️ ตรวจพบข้อโต้แย้ง (OBJECTION DETECTED)",
            concern: "ลูกค้ามีความกังวลหรือปฏิเสธข้อเสนอ โปรดใช้ความระมัดระวังและตอบกลับตามคำแนะนำด้านล่าง",
            action: response.action,
            tags: response.tags,
            lines: response.lines,
            explanation: response.explanation
          });
        }

      } else {
        console.log("AI: ไม่มีข้อมูลตรงกันใน Mock Database");
      }

      setIsAiProcessing(false);
    }, 1500);
  };

  return {
    currentStage,
    isRecording,
    progress: currentStage === 'Greet' ? 25 : currentStage === 'Discover' ? 50 : currentStage === 'Pitch' ? 75 : 100,
    toggleRecording,
    handleStageChange,
    resetSimulation,
    
    // 🌟 4. ส่ง warningData และฟังก์ชันเคลียร์ค่าออกไป
    warningData,
    clearWarning: () => setWarningData(null),
    
    aiSuggestion,
    isAiProcessing,
    simulateCustomerResponse
  };
};