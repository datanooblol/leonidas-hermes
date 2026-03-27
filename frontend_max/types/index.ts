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
  // name: string;
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