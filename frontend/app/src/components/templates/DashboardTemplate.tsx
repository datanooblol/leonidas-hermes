import React from 'react';
import { CustomerSidebar, JourneyGuide, LogoutModal, Navbar, ProductModal, ProductSidebar, TranscriptModal, WarningModal } from '../organisms';
import { WARNING_CONTENT } from '@/data/mock';
import { CustomerInfo, Product, Stage } from '@/types';

// กำหนด Type สำหรับ State ที่มาจาก Custom Hook
interface SimulationState {
  currentStage: Stage;
  isRecording: boolean;
  showWarning: boolean;
  setShowWarning: (show: boolean) => void;
  progress: number;
  toggleRecording: () => void;
  handleStageChange: (stage: Stage) => void;
  resetSimulation: () => void;
}

// Types passed from Page Controller
interface DashboardTemplateProps {
  // Layout State
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  productSidebarOpen: boolean;
  setProductSidebarOpen: (v: boolean) => void;
  
  // Business State (from Hook)
  simulationState: SimulationState; 
  
  // Data
  customer: CustomerInfo;
  setCustomer: (c: CustomerInfo) => void;
  interests: Record<string, boolean>;
  toggleInterest: (key: string) => void;
  filteredProducts: Product[];
  
  // UI Actions
  actions: {
    handleLogout: () => void;
    handleMicClick: () => void;
    setSelectedProduct: (p: Product | null) => void;
    setShowTranscript: (v: boolean) => void;
    setShowLogoutConfirm: (v: boolean) => void;
  };

  // Modals Visibility
  modals: {
    selectedProduct: Product | null;
    showTranscript: boolean;
    showLogoutConfirm: boolean;
  };
}

export const DashboardTemplate = (props: DashboardTemplateProps) => {
  const { 
    sidebarOpen, setSidebarOpen, 
    productSidebarOpen, setProductSidebarOpen,
    simulationState,
    customer, setCustomer,
    interests, toggleInterest,
    filteredProducts,
    actions,
    modals
  } = props;

  return (
    <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3] font-sans transition-colors duration-300 overflow-hidden">
      
      {/* Navbar uses ThemeProvider internally now */}
      <Navbar 
        isRecording={simulationState.isRecording}
        onLogout={() => actions.setShowLogoutConfirm(true)}
      />

      <div className={`pt-20 pb-2 px-6 transition-all duration-300 h-screen overflow-hidden flex flex-col ${sidebarOpen ? 'ml-80' : 'ml-0'} ${productSidebarOpen ? 'mr-80' : 'mr-0'}`}>
        
        <CustomerSidebar 
          isOpen={sidebarOpen} 
          toggle={() => setSidebarOpen(!sidebarOpen)}
          customer={customer}
          setCustomer={setCustomer}
          interests={interests}
          toggleInterest={toggleInterest}
        />

        <ProductSidebar 
          isOpen={productSidebarOpen}
          toggle={() => setProductSidebarOpen(!productSidebarOpen)}
          products={filteredProducts}
          onSelect={actions.setSelectedProduct}
        />

        {/* Main Content */}
        <JourneyGuide 
          currentStage={simulationState.currentStage}
          progress={simulationState.progress}
          stages={['Greet', 'Discover', 'Pitch', 'Closing']}
          onStageChange={simulationState.handleStageChange}
        />

        {/* Floating Actions */}
        <div className={`fixed bottom-25 right-8 z-50 transition-all duration-300 flex flex-col items-center gap-4 ${productSidebarOpen ? 'mr-80' : 'mr-0'}`}>
          <button onClick={() => actions.setShowTranscript(true)} className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-yellow-500 text-white hover:scale-105 transition-transform cursor-pointer">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </button>
          
          <button 
            onClick={simulationState.toggleRecording}
            className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-300 cursor-pointer ${simulationState.isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-[#0B57D0]'}`}
          >
             {simulationState.isRecording ? 
               <div className="w-6 h-6 bg-white rounded-sm" /> : 
               <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
             }
          </button>
        </div>
      </div>

      {/* Modals */}
      {modals.selectedProduct && <ProductModal product={modals.selectedProduct} onClose={() => actions.setSelectedProduct(null)} />}
      {modals.showTranscript && <TranscriptModal onClose={() => actions.setShowTranscript(false)} />}
      {simulationState.showWarning && <WarningModal content={WARNING_CONTENT} onClose={() => simulationState.setShowWarning(false)} />}
      {modals.showLogoutConfirm && <LogoutModal onConfirm={actions.handleLogout} onCancel={() => actions.setShowLogoutConfirm(false)} />}
    </div>
  );
};