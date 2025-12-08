// ---- CPI ITEM ----
export interface CpiItem {
  date: string; // "2025-11-13"
  shift_id: number;
  farm: string;
  dmb: number;

  production: number;
  total_cows: number;
  milking_duration: number;
  cows_per_hour: number;

  total_number_reattaches: number;
  total_manual_detach_count: number;
  total_manual_mode_count: number;

  two_min_milk: number;
  average_attach_duration: number;

  percent_total_number_reattaches: number;
  percent_total_manual_detach_count: number;
  percent_total_manual_mode_count: number;
  percent_two_min_milk: number;
}

// CPI response from API
export type CpiResponse = CpiItem[];


// ---- INDICATOR ITEM ----

export interface IndicatorItem {
  id: number;
  farm: string;
  dmb: number;
  indicator: string;
  more_than: boolean;
  active: boolean;
  value: number;
}

// Indicators response
export type IndicatorsResponse = IndicatorItem[];
