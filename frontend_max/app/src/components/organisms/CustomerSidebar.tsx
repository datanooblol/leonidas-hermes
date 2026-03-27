import React from 'react';
import { User, Baby, DollarSign, Briefcase, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomerInfo } from '@/types';
import { CompactField, InterestToggle } from '../molecules';
import { Card } from '../atoms';

interface CustomerSidebarProps {
  isOpen: boolean;
  toggle: () => void;
  customer: CustomerInfo;
  setCustomer: (c: CustomerInfo) => void;
  interests: Record<string, boolean>;
  toggleInterest: (key: string) => void;
  isSimulationOpen?: boolean;
}

export const CustomerSidebar = ({ isOpen, toggle, customer, setCustomer, interests, toggleInterest, isSimulationOpen }: CustomerSidebarProps) => {
  return (
    <div 
      className={`
        fixed inset-y-0 left-0 z-30 w-[20rem] 
        bg-[#F0F4F9] dark:bg-[#131314] 
        border-r border-gray-200 dark:border-[#444746] 
        transform transition-transform duration-300 ease-in-out flex flex-col pt-16
        /* ✅ แก้ไข Logic การสไลด์: 
           - ถ้าปิด: เลื่อนไปหลบหลัง Simulation (0) หรือหลบซ้ายสุด (-100%) 
           - ถ้าเปิด: เลื่อนออกมาต่อท้าย (20rem) หรืออยู่ชิดซ้ายปกติ (0) */
        ${!isOpen 
          ? (isSimulationOpen ? 'translate-x-0' : '-translate-x-full') 
          : (isSimulationOpen ? 'translate-x-[20rem]' : 'translate-x-0')
        }
      `}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Section 1: Customer Info */}
        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 border-b border-gray-100 dark:border-[#444746] pb-3">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
               <User className="text-[#0B57D0] dark:text-[#A8C7FA]" size={16} />
            </div>
            <h2 className="font-bold text-gray-800 dark:text-[#E3E3E3] text-xs uppercase tracking-wider">Customer Info</h2>
          </div>
          
          <div className="flex flex-wrap gap-4">
             <CompactField label="Age" value={customer.age} onChange={(v) => setCustomer({...customer, age: v})} icon={Baby} type="number" />
             <CompactField label="Income" value={customer.income} onChange={(v) => setCustomer({...customer, income: v})} icon={DollarSign} type="number" />
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
             <CompactField 
                label="Status" 
                value={customer.status} 
                onChange={(v) => setCustomer({...customer, status: v})} 
                icon={Briefcase} 
                type="select"
                options={['Single', 'Married', 'Divorced', 'Widowed']}
              />
             <CompactField label="Children" value={customer.children} onChange={(v) => setCustomer({...customer, children: v})} icon={Baby} type="number" />
          </div>
        </Card>

        {/* Section 2: Interests */}
        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 border-b border-gray-100 dark:border-[#444746] pb-3">
            <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
               <Heart className="text-red-500 dark:text-red-400" size={16} />
            </div>
            <h2 className="font-bold text-gray-800 dark:text-[#E3E3E3] text-xs uppercase tracking-wider">Interests</h2>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {Object.keys(interests).map((key) => (
              <InterestToggle 
                key={key} 
                label={key.replace(' Insurance', '').replace(' Planning', '').replace(' Benefits', '')} 
                checked={interests[key]} 
                onChange={() => toggleInterest(key)} 
              />
            ))}
          </div>
        </Card>
      </div>

      {/* 🔵 แท็บดึง Customer Sidebar (สีน้ำเงิน) */}
      <button 
        onClick={toggle}
        className="absolute -right-8 top-48 w-8 h-16 flex items-center justify-center bg-[#0B57D0] hover:bg-blue-700 text-white rounded-r-xl shadow-[4px_0_15px_-3px_rgba(11,87,208,0.3)] transition-all cursor-pointer border border-l-0 border-blue-800 dark:border-blue-600"
        title="Customer Info"
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </div>
  );
};