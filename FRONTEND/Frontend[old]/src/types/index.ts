import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface ConfigData {
  line: string;
  model: string;
  tt_sec: number;
  att_sec: number;
  count_per_cycle: number;
  target: number;
  threshold: number;
  flu_other_sec: number;
  short_breakdown_sec: number;
  breakdown_sec: number;
  day_start: string;
  night_start: string;
  reset_day_time: string;
  reset_night_time: string;
  day_breaks: BreakRow[];
  night_breaks: BreakRow[];
  enable: boolean;
}

export interface BreakRow {
  enabled: boolean;
  start: string;
  end: string;
}

export interface BreakConfig {
  dayBreak: BreakRow[];
  nightBreak: BreakRow[];
}

export interface ForceActualData {
  actual: number;
}

export interface DateTimeData {
  date: string;
  time: string;
  setAt: number;
}

export interface ProductionData {
  line: string;
  model: string;
  plan: number;
  actual: number;
  tt: number;
  att: number;
  eff: number;
  hourlyPlan: number;
  hourlyActual: number;
  threshold: number;
  pp_plan: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}