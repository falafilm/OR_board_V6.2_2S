import type {
  ApiResponse,
  ConfigData,
  ForceActualData,
  DateTimeData,
  ProductionData,
} from "../types";

import { getRuntimeConfig } from "../config/runtimeConfig";

const { API_BASE_URL } = getRuntimeConfig();

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      data: null as T,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const configApi = {
  get: async (
    line: string,
    model: string,
  ): Promise<ApiResponse<ConfigData>> => {
    return apiFetch<ConfigData>(`/${line}/${model}`);
  },

  save: async (config: ConfigData): Promise<ApiResponse<ConfigData>> => {
    return apiFetch<ConfigData>(`/${config.line}/${config.model}`, {
      method: "POST",
      body: JSON.stringify(config),
    });
  },
};

export const dashboardApi = {
  getLive: async (): Promise<ApiResponse<ProductionData>> => {
    return apiFetch<ProductionData>(`/live`);
  },
};

export const systemApi = {
  getActive: async (): Promise<ApiResponse<any>> => {
    return apiFetch<any>(`/active`);
  },

  selectLineModel: async (
    line: string,
    model: string,
  ): Promise<ApiResponse<any>> => {
    return apiFetch<any>(`/select`, {
      method: "POST",
      body: JSON.stringify({ line, model }),
    });
  },

  reset: async (lineId: string): Promise<ApiResponse<any>> => {
    return apiFetch<any>(`/reset/${lineId}`, {
      method: "POST",
    });
  },

  forceActual: async (
    data: ForceActualData,
    lineId: string,
  ): Promise<ApiResponse<ForceActualData>> => {
    return apiFetch<ForceActualData>(`/force-actual/${lineId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  saveDateTime: async (
    data: DateTimeData,
    lineId: string,
  ): Promise<ApiResponse<DateTimeData>> => {
    return apiFetch<DateTimeData>(`/datetime/${lineId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export const productionApi = {
  getCurrent: async (): Promise<ApiResponse<ProductionData>> => {
    return dashboardApi.getLive();
  },
};

export const api = {
  config: configApi,
  dashboard: dashboardApi,
  system: systemApi,
  production: productionApi,
};
