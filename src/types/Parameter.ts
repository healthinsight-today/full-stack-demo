// Extended parameter interfaces for specific functions
export interface ParameterTrend {
  parameter: Parameter;
  trend: Array<{
    date: string;
    value: number;
    is_abnormal: boolean;
  }>;
  trendDirection: 'improving' | 'worsening' | 'stable';
  percentChange: number;
}

export interface ParameterComparison {
  parameter: Parameter;
  previousValue: number | null;
  previousDate: string | null;
  change: number;
  percentChange: number;
  changeDirection: 'increased' | 'decreased' | 'unchanged';
}

export interface ParameterCorrelation {
  source: Parameter;
  target: Parameter;
  correlationStrength: number; // -1 to 1
  significance: boolean;
  description: string;
}

// Explicitly define Parameter type here instead of re-exporting
export interface Parameter {
  name: string;
  code?: string;
  value: number;
  unit: string;
  reference_range: string;
  reference_min: number | null;
  reference_max: number | null;
  is_abnormal: boolean;
  direction: 'high' | 'low' | null;
  severity: 'mild' | 'moderate' | 'severe' | null;
}

export interface AbnormalParameter extends Parameter {
  section: string;
  percent_deviation: number;
  potential_causes: string[];
}
