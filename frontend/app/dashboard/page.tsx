"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Data & Types
import { CustomerInfo, Product } from "@/types";
import { MOCK_PRODUCTS } from "@/data/mock";

// Hooks
import { useTeleSaleSimulation } from "@/hooks/useTeleSaleSimulation";

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

  // --- Business Logic Hook ---
  const simulationState = useTeleSaleSimulation();

  // --- Data State ---
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "คุณสมชาย ใจดี",
    age: "35",
    income: "45000",
    status: "Married",
    children: "1",
  });

  const [interests, setInterests] = useState<Record<string, boolean>>({
    "Life Insurance": true,
    "Health Insurance": false,
    "Critical Illness": false,
    "Retirement Planning": false,
    "Accident Insurance": false,
    "Tax Benefits": true,
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

  return (
    <DashboardTemplate
      // Layout props
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      productSidebarOpen={productSidebarOpen}
      setProductSidebarOpen={setProductSidebarOpen}
      // Simulation Logic
      simulationState={simulationState}
      // Data Props
      customer={customer}
      setCustomer={setCustomer}
      interests={interests}
      toggleInterest={toggleInterest}
      filteredProducts={filteredProducts}
      // Actions
      actions={{
        handleLogout,
        handleMicClick: simulationState.toggleRecording,
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
