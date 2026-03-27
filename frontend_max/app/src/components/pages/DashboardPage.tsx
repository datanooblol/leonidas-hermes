// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";

// // Types & Data
// import { CustomerInfo, Product } from "@/types";
// // *ถ้า MOCK_PRODUCTS อยู่ในโฟลเดอร์ data/ ให้ใช้ path ด้านล่างนี้ครับ
// import { MOCK_PRODUCTS } from "@/data/mock"; 

// // Hooks
// import { useTeleSaleSimulation } from "@/hooks/useTeleSaleSimulation";

// // Templates
// import { DashboardTemplate } from "../templates/DashboardTemplate";

// export const DashboardPage = () => {
//   const router = useRouter();

//   // --- UI State ---
//   const [simulationSidebarOpen, setSimulationSidebarOpen] = useState(true); 
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [productSidebarOpen, setProductSidebarOpen] = useState(true);
  
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
//   const [showTranscript, setShowTranscript] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

//   // --- Business Logic Hook ---
//   const simulationState = useTeleSaleSimulation();

//   // --- Data State ---
//   const [customer, setCustomer] = useState<CustomerInfo>({
//     name: "คุณสมชาย ใจดี",
//     age: "35",
//     income: "45000",
//     status: "Married",
//     children: "1",
//   });

//   const [interests, setInterests] = useState<Record<string, boolean>>({
//     "Life Insurance": true,
//     "Health Insurance": false,
//     "Critical Illness": false,
//     "Retirement Planning": false,
//     "Accident Insurance": false,
//     "Tax Benefits": true,
//     "Education Fund": false,
//     Investment: false,
//   });

//   const filteredProducts = MOCK_PRODUCTS.filter((p) => interests[p.category]);

//   // --- Actions ---
//   const handleLogout = () => {
//     simulationState.resetSimulation();
//     document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
//     router.push("/login");
//   };

//   const toggleInterest = (key: string) => {
//     setInterests((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   return (
//     <DashboardTemplate
//       // Layout props
//       simulationSidebarOpen={simulationSidebarOpen}
//       setSimulationSidebarOpen={setSimulationSidebarOpen}
//       sidebarOpen={sidebarOpen}
//       setSidebarOpen={setSidebarOpen}
//       productSidebarOpen={productSidebarOpen}
//       setProductSidebarOpen={setProductSidebarOpen}
      
//       // Simulation Logic
//       simulationState={simulationState}
      
//       // Data Props
//       customer={customer}
//       setCustomer={setCustomer}
//       interests={interests}
//       toggleInterest={toggleInterest}
//       filteredProducts={filteredProducts}
      
//       // Actions
//       actions={{
//         handleLogout,
//         handleMicClick: simulationState.toggleRecording,
//         setSelectedProduct,
//         setShowTranscript,
//         setShowLogoutConfirm,
//       }}
      
//       // Modals
//       modals={{
//         selectedProduct,
//         showTranscript,
//         showLogoutConfirm,
//       }}
//     />
//   );
// };

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CustomerInfo, Product } from "@/types";
import { MOCK_PRODUCTS } from "@/data/mock"; 
import { useWebSocket } from "@/hooks/useWebSocket";
import { DashboardTemplate } from "../templates/DashboardTemplate";

export const DashboardPage = () => {
  const router = useRouter();

  // --- UI State ---
  const [simulationSidebarOpen, setSimulationSidebarOpen] = useState(true); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [productSidebarOpen, setProductSidebarOpen] = useState(true);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- WebSocket Hook ---
  const wsState = useWebSocket();

  // --- Data State (Synced with Backend) ---
  const [localCustomer, setLocalCustomer] = useState<CustomerInfo>({
    name: "",
    age: "",
    income: "",
    status: "Single",
    children: "0",
  });

  const [localInterests, setLocalInterests] = useState<Record<string, boolean>>({
    "Life Insurance": false,
    "Health Insurance": false,
    "Critical Illness": false,
    "Retirement Planning": false,
    "Accident Insurance": false,
    "Tax Benefits": false,
    "Education Fund": false,
    Investment: false,
  });

  // Sync backend data to local state
  useEffect(() => {
    if (wsState.customerInfo && Object.keys(wsState.customerInfo).length > 0) {
      setLocalCustomer(prev => ({
        ...prev,
        name: wsState.customerInfo.name || prev.name,
        age: wsState.customerInfo.age?.toString() || prev.age,
        income: wsState.customerInfo.income_per_month?.toString() || prev.income,
        status: wsState.customerInfo.marital_status || prev.status,
        children: wsState.customerInfo.number_of_children?.toString() || prev.children,
      }));
    }
  }, [wsState.customerInfo]);

  useEffect(() => {
    if (wsState.interests && Object.keys(wsState.interests).length > 0) {
      const mappedInterests = {
        "Life Insurance": wsState.interests.life_insurance || false,
        "Health Insurance": wsState.interests.health_insurance || false,
        "Critical Illness": wsState.interests.critical_illness || false,
        "Retirement Planning": wsState.interests.retirement_planning || false,
        "Accident Insurance": wsState.interests.accident_insurance || false,
        "Tax Benefits": wsState.interests.tax_benefits || false,
        "Education Fund": wsState.interests.education_fund || false,
        "Investment": wsState.interests.investment || false,
      };
      setLocalInterests(prev => ({ ...prev, ...mappedInterests }));
    }
  }, [wsState.interests]);

  // Sync transcription
  useEffect(() => {
    if (wsState.transcription) {
      setTranscriptText(prev => prev + '\n' + wsState.transcription);
    }
  }, [wsState.transcription]);

  // Use backend products if available, otherwise fallback to mock
  const products = wsState.products.length > 0 
    ? wsState.products.map(p => ({
        id: p.product_id,
        name: p.product_name,
        category: p.objective,
        price: `${p.premium_min_month_thb}-${p.premium_max_month_thb} THB/month`,
        ageRange: `${p.age_min}-${p.age_max} years`,
        description: p.notes || p.objective,
        fullDetail: p.notes || p.objective
      }))
    : MOCK_PRODUCTS.filter((p) => localInterests[p.category]);

  // --- Actions ---
  const handleLogout = () => {
    wsState.disconnect();
    wsState.resetSession();
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };

  const handleCustomerUpdate = (updatedCustomer: CustomerInfo) => {
    setLocalCustomer(updatedCustomer);
    // Send manual update to backend
    if (wsState.isConnected) {
      const updateData: any = {};
      
      if (updatedCustomer.age) updateData.age = parseInt(updatedCustomer.age);
      if (updatedCustomer.income) updateData.income_per_month = parseInt(updatedCustomer.income);
      if (updatedCustomer.status) updateData.marital_status = updatedCustomer.status;
      if (updatedCustomer.children) updateData.number_of_children = parseInt(updatedCustomer.children);
      
      wsState.sendMessage({
        type: "manual_information_update",
        data: updateData
      });
      console.log('📝 Sent customer info update:', updateData);
    } else {
      console.error('❌ Cannot send update: WebSocket not connected');
    }
  };

  const toggleInterest = (key: string) => {
    const newInterests = { ...localInterests, [key]: !localInterests[key] };
    setLocalInterests(newInterests);
    // Send manual update to backend
    if (wsState.isConnected) {
      wsState.sendMessage({
        type: "manual_interest_update",
        data: {
          life_insurance: newInterests["Life Insurance"],
          health_insurance: newInterests["Health Insurance"],
          critical_illness: newInterests["Critical Illness"],
          retirement_planning: newInterests["Retirement Planning"],
          accident_insurance: newInterests["Accident Insurance"],
          tax_benefits: newInterests["Tax Benefits"],
          education_fund: newInterests["Education Fund"],
          investment: newInterests["Investment"],
        }
      });
      console.log('❤️ Sent interest update:', key, newInterests[key]);
    } else {
      console.error('❌ Cannot send update: WebSocket not connected');
    }
  };

  const handleSimulateResponse = (text: string, stageId: string) => {
    // Map frontend stage IDs to backend stage names
    const stageMap: Record<string, string> = {
      'GREET': 'greeting',
      'DISCOVER': 'discovery',
      'PITCH': 'pitch',
      'OBJECTION': 'objection',
      'CLOSING': 'closing'
    };
    
    // Send simulated customer speech via WebSocket with correct schema
    if (wsState.isConnected) {
      wsState.sendMessage({
        type: "guide",
        data: {
          stage_name: stageMap[stageId] || 'greeting',
          content: text
        }
      });
      console.log('🗣️ Sent guide message:', { stage: stageMap[stageId], content: text.substring(0, 50) + '...' });
    } else {
      console.error('❌ Cannot send message: WebSocket not connected');
    }
  };

  const handleObjectionResolved = () => {
    if (wsState.isConnected) {
      wsState.sendMessage({
        type: "manual_resolve_objection",
        data: { resolved: true }
      });
      console.log('✅ Sent objection resolution');
    } else {
      console.error('❌ Cannot send resolution: WebSocket not connected');
    }
    wsState.clearWarning();
  };

  const handlePlayAudioFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      wsState.playAudioFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <DashboardTemplate
      simulationSidebarOpen={simulationSidebarOpen}
      setSimulationSidebarOpen={setSimulationSidebarOpen}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      productSidebarOpen={productSidebarOpen}
      setProductSidebarOpen={setProductSidebarOpen}
      wsState={wsState}
      simulateCustomerResponse={handleSimulateResponse}
      customer={localCustomer}
      setCustomer={handleCustomerUpdate}
      interests={localInterests}
      toggleInterest={toggleInterest}
      filteredProducts={products}
      actions={{
        handleLogout,
        handleMicClick: wsState.toggleRecording,
        handleConnect: wsState.connect,
        handleDisconnect: wsState.disconnect,
        handleObjectionResolved,
        handlePlayAudioFile,
        handleStopAudio: wsState.stopAudioFile,
        setSelectedProduct,
        setShowTranscript,
        setShowLogoutConfirm,
      }}
      modals={{
        selectedProduct,
        showTranscript,
        showLogoutConfirm,
        transcriptText,
      }}
    />
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
};