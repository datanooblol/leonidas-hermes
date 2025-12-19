export type Stage = 'Greet' | 'Discover' | 'Pitch' | 'Closing';
export type Theme = 'dark' | 'light';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  ageRange: string;
  description: string;
  fullDetail: string;
}

export interface CustomerInfo {
  name: string;
  age: string;
  income: string;
  status: string;
  children: string;
}

export interface TranscriptMsg {
  role: 'Agent' | 'Customer';
  text: string;
  timestamp: string;
}

export interface StageContentData {
  action: string;
  tags: string[];
  lines: string[];
  explanation: string;
}

// ✅ เพิ่ม Type นี้เข้าไปครับ
export interface WarningData {
  title: string;
  concern: string;
  action: string;
  lines: string[];
  explanation: string;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type?: 'transcription' | 'information' | 'interest' | 'checklist' | 'guide' | 'products' | 'stage_change' | 'objection' | 'objection_resolved';
  timestamp?: string;
  transcription?: string;
  customer_information?: any;
  customer_interest?: any;
  agent_checklist?: any;
  guide?: any;
  products?: any;
  stage_name?: string;
  status?: string;
  stage?: string;
  reason?: string;
  previous_stage?: string;
}

// Backend Product Interface
export interface BackendProduct {
  product_id: string;
  product_name: string;
  objective: string;
  premium_min_month_thb: number;
  premium_max_month_thb: number;
  age_min: number;
  age_max: number;
  notes?: string;
}

// Backend Customer Info
export interface BackendCustomerInfo {
  age?: number;
  income_per_month?: number;
  marital_status?: string;
  number_of_children?: number;
}

// Backend Interest
export interface BackendInterest {
  life_insurance?: boolean;
  health_insurance?: boolean;
  critical_illness?: boolean;
  accident_insurance?: boolean;
  retirement_planning?: boolean;
  tax_benefits?: boolean;
}