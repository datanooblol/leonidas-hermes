export interface CustomerInfo {
  age?: number;
  income_per_month?: number;
  marital_status?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated' | 'Unknown';
  number_of_children?: number;
}

export interface CustomerInterest {
  life_insurance?: boolean;
  health_insurance?: boolean;
  critical_illness?: boolean;
  accident_insurance?: boolean;
  retirement_planning?: boolean;
  tax_benefits?: boolean;
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