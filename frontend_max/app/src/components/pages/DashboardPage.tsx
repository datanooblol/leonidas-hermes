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

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerInfo, Product } from "@/types";
import { MOCK_PRODUCTS } from "@/data/mock"; 
import { useTeleSaleSimulation } from "@/hooks/useTeleSaleSimulation";
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

  // --- Business Logic Hook ---
  const simulationState = useTeleSaleSimulation();

  // --- Data State ---
  const [customer, setCustomer] = useState<CustomerInfo>({
    // name: "คุณสมชาย ใจดี",
    age: "", // ✅ ทำให้ว่างไว้ก่อน จะได้เห็นชัดๆ ตอน AI ดึงมาเติมให้
    income: "",
    status: "Single",
    children: "0",
  });

  const [interests, setInterests] = useState<Record<string, boolean>>({
    "Life Insurance": false,
    "Health Insurance": false,
    "Critical Illness": false,
    "Retirement Planning": false,
    "Accident Insurance": false,
    "Tax Benefits": false,
    "Education Fund": false,
    Investment: false,
  });

  const filteredProducts = MOCK_PRODUCTS.filter((p) => interests[p.category]);

  // --- Actions ---
  const handleLogout = () => {
    simulationState.resetSimulation();
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };

  const toggleInterest = (key: string) => {
    setInterests((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ✅ สร้างฟังก์ชันแรปเปอร์ เพื่อรอรับข้อมูลสกัดจาก AI
  const handleSimulateResponse = (text: string, stageId: string) => {
    simulationState.simulateCustomerResponse(text, stageId, (extractedData) => {
      // 1. ถ้า AI บอกว่ามีข้อมูลลูกค้า (อายุ, รายได้) ให้อัปเดต
      if (extractedData?.customer) {
        setCustomer((prev) => ({ ...prev, ...extractedData.customer }));
      }
      // 2. ถ้า AI บอกว่าลูกค้าสนใจอะไร ให้อัปเดต
      if (extractedData?.interests) {
        setInterests((prev) => ({ ...prev, ...extractedData.interests }));
      }
    });
  };

  return (
    <DashboardTemplate
      simulationSidebarOpen={simulationSidebarOpen}
      setSimulationSidebarOpen={setSimulationSidebarOpen}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      productSidebarOpen={productSidebarOpen}
      setProductSidebarOpen={setProductSidebarOpen}
      simulationState={{
        ...simulationState,
        // ✅ เปลี่ยนไปส่งฟังก์ชันแรปเปอร์ของเราแทน
        simulateCustomerResponse: handleSimulateResponse 
      }}
      customer={customer}
      setCustomer={setCustomer}
      interests={interests}
      toggleInterest={toggleInterest}
      filteredProducts={filteredProducts}
      actions={{
        handleLogout,
        handleMicClick: simulationState.toggleRecording,
        setSelectedProduct,
        setShowTranscript,
        setShowLogoutConfirm,
      }}
      modals={{
        selectedProduct,
        showTranscript,
        showLogoutConfirm,
      }}
    />
  );
};