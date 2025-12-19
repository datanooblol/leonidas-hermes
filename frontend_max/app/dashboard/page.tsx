"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Data & Types
import { CustomerInfo, Product } from "@/types";

// Hooks
import { useWebSocket } from "@/hooks/useWebSocket";

// Template
import { DashboardTemplate } from "../src/components/templates";

export default function DashboardPage() {
  const router = useRouter();

  // --- UI State ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [productSidebarOpen, setProductSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- WebSocket Connection ---
  const webSocketState = useWebSocket();

  // --- Data State ---
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "คุณสมชาย ใจดี",
    age: "35",
    income: "45000",
    status: "Married",
    children: "1",
  });

  const [localInterests, setLocalInterests] = useState<Record<string, boolean>>({
    "Life Insurance": true,
    "Health Insurance": false,
    "Critical Illness": false,
    "Retirement Planning": false,
    "Accident Insurance": false,
    "Tax Benefits": true,
    "Education Fund": false,
    Investment: false,
  });

  // Sync backend data with local state
  useEffect(() => {
    if (webSocketState.customerInfo && Object.keys(webSocketState.customerInfo).length > 0) {
      setCustomer(prev => ({
        ...prev,
        age: webSocketState.customerInfo.age?.toString() || prev.age,
        income: webSocketState.customerInfo.income_per_month?.toString() || prev.income,
        status: webSocketState.customerInfo.marital_status || prev.status,
        children: webSocketState.customerInfo.number_of_children?.toString() || prev.children,
      }));
    }
  }, [webSocketState.customerInfo]);

  useEffect(() => {
    if (webSocketState.interests && Object.keys(webSocketState.interests).length > 0) {
      const mappedInterests = {
        "Life Insurance": webSocketState.interests.life_insurance || false,
        "Health Insurance": webSocketState.interests.health_insurance || false,
        "Critical Illness": webSocketState.interests.critical_illness || false,
        "Retirement Planning": webSocketState.interests.retirement_planning || false,
        "Accident Insurance": webSocketState.interests.accident_insurance || false,
        "Tax Benefits": webSocketState.interests.tax_benefits || false,
      };
      setLocalInterests(prev => ({ ...prev, ...mappedInterests }));
    }
  }, [webSocketState.interests]);

  const filteredProducts = webSocketState.products.length > 0 
    ? webSocketState.products.map(p => ({
        id: p.product_id,
        name: p.product_name,
        category: p.objective,
        price: `${p.premium_min_month_thb}-${p.premium_max_month_thb} THB/month`,
        ageRange: `${p.age_min}-${p.age_max} years`,
        description: p.notes || p.objective,
        fullDetail: p.notes || p.objective
      }))
    : [];

  // --- Actions ---
  const handleLogout = () => {
    webSocketState.resetSession();
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };

  const toggleInterest = (key: string) => {
    const newInterests = { ...localInterests, [key]: !localInterests[key] };
    setLocalInterests(newInterests);
    
    webSocketState.sendMessage({
      type: "manual_interest_update",
      data: {
        life_insurance: newInterests["Life Insurance"],
        health_insurance: newInterests["Health Insurance"],
        critical_illness: newInterests["Critical Illness"],
        retirement_planning: newInterests["Retirement Planning"],
        accident_insurance: newInterests["Accident Insurance"],
        tax_benefits: newInterests["Tax Benefits"],
      }
    });
  };

  const handleCustomerUpdate = (updatedCustomer: CustomerInfo) => {
    setCustomer(updatedCustomer);
    
    webSocketState.sendMessage({
      type: "manual_information_update",
      data: {
        age: parseInt(updatedCustomer.age) || undefined,
        income_per_month: parseInt(updatedCustomer.income) || undefined,
        marital_status: updatedCustomer.status,
        number_of_children: parseInt(updatedCustomer.children) || undefined,
      }
    });
  };

  return (
    <DashboardTemplate
      // Layout props
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      productSidebarOpen={productSidebarOpen}
      setProductSidebarOpen={setProductSidebarOpen}
      // WebSocket Logic
      simulationState={webSocketState}
      // Data Props
      customer={customer}
      setCustomer={handleCustomerUpdate}
      interests={localInterests}
      toggleInterest={toggleInterest}
      filteredProducts={filteredProducts}
      // Actions
      actions={{
        handleLogout,
        handleMicClick: webSocketState.toggleRecording,
        setSelectedProduct,
        setShowTranscript,
        setShowLogoutConfirm,
      }}
      // Modals
      modals={{
        selectedProduct,
        showTranscript,
        showLogoutConfirm,
      }}
    />
  );
}
