export interface CustomerInfo {
  age?: number;
  income_per_month?: number;
  name?: string;
  tel?: string;
}

export interface CustomerInterest {
  family_protection?: boolean;
  legacy_planning?: boolean;
  savings_goal?: boolean;
  tax_benefits?: boolean;
  retirement_planning?: boolean;
  health_coverage?: boolean;
  accident_protection?: boolean;
  critical_illness?: boolean;
  budget_conscious?: boolean;
  immediate_need?: boolean;
}

export interface TranscriptionResult {
  text: string;
  timestamp: number;
  chunkId: number;
}