export interface CustomerInfo {
  age?: number;
  income_per_month?: number;
  marital_status?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated' | 'Unknown';
  number_of_children?: number;
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

export interface JourneyStage {
  stage: 'Greeting' | 'Discovery' | 'Pitch';
  action: string;
  explanation: string[];
  signals: string[];
  lines: string[];
}

export interface InsurancePlan {
  name: string;
  ageRange: string;
  premium: string;
  benefits: string[];
}