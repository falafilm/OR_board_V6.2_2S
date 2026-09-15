/* eslint-disable no-console */
import type { ConfigData, BreakConfig, DateTimeData, BreakRow } from "../types";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { getRuntimeConfig } from "../config/runtimeConfig";

const { API_BASE_URL } = getRuntimeConfig();

// Storage Keys
const STORAGE_KEYS = {
  CONFIG: "production_config",
  BREAKS: "production_breaks",
  DATE_TIME: "production_date_time",
  LINE_ID: "production_line_id",
  MODEL: "production_model",
} as const;

// Helper functions
const getLineId = () => {
  return localStorage.getItem(STORAGE_KEYS.LINE_ID) || "1";
};

// Default Values
const defaultBreakRow: BreakRow = {
  enabled: false,
  start: "",
  end: "",
};

const defaultConfig: ConfigData = {
  line: "",
  model: "",
  tt_sec: 0.0,
  att_sec: 0.0,
  count_per_cycle: 1,
  target: 0,
  threshold: 0,
  day_start: "08:00",
  night_start: "20:00",
  reset_day_time: "07:50",
  reset_night_time: "19:50",
  day_breaks: [],
  night_breaks: [],
  enable: true,
};

const defaultBreakConfig: BreakConfig = {
  dayBreak: Array.from({ length: 8 }, () => ({ ...defaultBreakRow })),
  nightBreak: Array.from({ length: 8 }, () => ({ ...defaultBreakRow })),
};

const defaultDateTime: DateTimeData = {
  date: "",
  time: "",
  setAt: 0,
};

interface ConfigContextType {
  config: ConfigData;
  breakConfig: BreakConfig;
  dateTime: DateTimeData;
  isLoading: boolean;
  updateConfig: (config: ConfigData) => void;
  updateBreakConfig: (breakConfig: BreakConfig) => void;
  updateDateTime: (dateTime: DateTimeData) => void;
  saveConfig: () => Promise<void>;
  saveBreaks: () => Promise<void>;
  saveDateTime: () => Promise<void>;
  fetchConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Provider Component
export function ConfigProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ConfigData>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const parsed = stored ? JSON.parse(stored) : defaultConfig;

    const model = localStorage.getItem(STORAGE_KEYS.MODEL) || "";

    return { ...parsed, model };
  });

  const [breakConfig, setBreakConfig] = useState<BreakConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.BREAKS);

    return stored ? JSON.parse(stored) : defaultBreakConfig;
  });

  const [dateTime, setDateTime] = useState<DateTimeData>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DATE_TIME);

    return stored ? JSON.parse(stored) : defaultDateTime;
  });

  useEffect(() => {
    // Save config without model
    const { model, ...configWithoutModel } = config;

    localStorage.setItem(
      STORAGE_KEYS.CONFIG,
      JSON.stringify(configWithoutModel),
    );

    // Save model separately
    if (model) {
      localStorage.setItem(STORAGE_KEYS.MODEL, model);
    }
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BREAKS, JSON.stringify(breakConfig));
  }, [breakConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DATE_TIME, JSON.stringify(dateTime));
  }, [dateTime]);

  const checkLineExists = async (line: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${line}`);

      return response.ok;
    } catch (error) {
      console.error("Error checking if line exists:", error);

      return false;
    }
  };

  const saveConfig = async () => {
    try {
      const thresholdValue = parseInt(config.threshold?.toString() || "90");

      if (isNaN(thresholdValue) || thresholdValue < 0 || thresholdValue > 100) {
        throw new Error("Threshold must be between 0 and 100");
      }

      const lineId = config.line || getLineId();

      localStorage.setItem(STORAGE_KEYS.LINE_ID, lineId);

      const configToSend = {
        line: config.line,
        tt_sec: parseFloat(config.tt_sec?.toString() || "10.0"),
        count_per_cycle: parseInt(config.count_per_cycle?.toString() || "1"),
        threshold: parseInt(config.threshold?.toString() || "90"),
        day_start: config.day_start || "08:00",
        night_start: config.night_start || "20:00",
        reset_day_time: config.reset_day_time || "07:50",
        reset_night_time: config.reset_night_time || "19:50",
        day_breaks: breakConfig.dayBreak
          .filter((b) => b.start && b.end)
          .map((b) => ({
            enabled: b.enabled,
            start: b.start,
            end: b.end,
          })),
        night_breaks: breakConfig.nightBreak
          .filter((b) => b.start && b.end)
          .map((b) => ({
            enabled: b.enabled,
            start: b.start,
            end: b.end,
          })),
        enable: true,
      };

      // Check if line exists to determine POST vs PUT
      const lineExists = await checkLineExists(config.line);
      const method = lineExists ? "PUT" : "POST";

      console.log(
        `${method} request for line: ${config.line} (${lineExists ? "existing" : "new"} line)`,
      );

      const response = await fetch(`${API_BASE_URL}/${config.line}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`Config ${lineExists ? "updated" : "created"} successfully`);
    } catch (error) {
      console.error("Failed to save config:", error);
      throw error;
    }
  };

  const saveBreaks = async () => {
    try {
      const breaksToSend = {
        dayBreak: breakConfig.dayBreak
          .filter((b) => b.start && b.end)
          .map((b) => ({
            enabled: b.enabled,
            start: b.start,
            end: b.end,
          })),
        nightBreak: breakConfig.nightBreak
          .filter((b) => b.start && b.end)
          .map((b) => ({
            enabled: b.enabled,
            start: b.start,
            end: b.end,
          })),
      };

      console.log("Breaks saved (only with values):", breaksToSend);
    } catch (error) {
      console.error("Failed to save breaks:", error);
      throw error;
    }
  };

  const saveDateTime = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/datetime/${config.line}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dateTime),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
    } catch (error) {
      console.error("Failed to save date/time:", error);
      throw error;
    }
  };

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/${config.line}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Fetched config:", data);
    } catch (error) {
      console.error("Failed to fetch config:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: ConfigContextType = {
    config,
    breakConfig,
    dateTime,
    isLoading,
    updateConfig: setConfig,
    updateBreakConfig: setBreakConfig,
    updateDateTime: setDateTime,
    saveConfig,
    saveBreaks,
    saveDateTime,
    fetchConfig,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);

  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }

  return context;
}