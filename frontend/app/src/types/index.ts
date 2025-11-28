export interface CustomerInfo {
  age?: number;
  income_per_month?: number;
  marital_status?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated' | 'Unknown';
  number_of_children?: number;
  has_life_policy?: boolean;
  has_health_policy?: boolean;
  has_accident_policy?: boolean;
}

export interface CustomerInterest {
  life_insurance?: boolean;
  health_insurance?: boolean;
  critical_illness?: boolean;
  accident_insurance?: boolean;
  retirement_planning?: boolean;
  tax_benefits?: boolean;
}

export interface AgentChecklist {
  [key: string]: boolean;
}

export interface Guide {
  action: string;
  explanation: string;
  signals: string[];
  lines_to_say: string[];
}

export interface Product {
  product_id: string;
  product_name: string;
  objective: string;
  premium_min_month_thb: number;
  premium_max_month_thb: number;
  age_min: number;
  age_max: number;
  notes: string;
}

export interface TranscriptionResult {
  text: string;
  timestamp: number;
  chunkId: number;
}