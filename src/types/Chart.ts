export interface ChartData {
    name: string;
    value: number;
    min?: number;
    max?: number;
    unit?: string;
    color?: string;
  }
  
  export interface TrendData {
    date: string;
    value: number;
    reference_min?: number;
    reference_max?: number;
  }
  
  export interface HealthScore {
    overall: number;
    categories: {
      [key: string]: number;
    };
    trend?: TrendPoint[];
  }
  
  export interface TrendPoint {
    date: string;
    score: number;
  }
  
  export interface GaugeConfig {
    min: number;
    max: number;
    value: number;
    thresholds: {
      [key: string]: number;
    };
    colors: {
      [key: string]: string;
    };
  }
  
  export interface ReferenceRange {
    min: number | null;
    max: number | null;
    text: string;
  }
  
  export interface ChartTooltipData {
    label: string;
    value: number;
    unit: string;
    reference?: string;
    status?: 'normal' | 'high' | 'low';
  }
  