/* eslint-disable no-console */
import type {
  ConfigData,
  BreakConfig,
  ForceActualData,
  DateTimeData,
  BreakRow,
} from "../types";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// Storage Keys
const STORAGE_KEYS = {
  CONFIG: "production_config",
  BREAKS: "production_breaks",
  FORCE_ACTUAL: "production_force_actual",
  DATE_TIME: "production_date_time",
  LINE_ID: "production_line_id",
  MODEL: "production_model",
} as const;

// API Base URL
const API_BASE_URL = "http://192.168.1.39:5501/api";

// Helper functions
const getLineId = () => {
  return localStorage.getItem(STORAGE_KEYS.LINE_ID) || "1";
};

const getModel = () => {
  return localStorage.getItem(STORAGE_KEYS.MODEL) || "default";
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
  flu_other_sec: 1800,
  short_breakdown_sec: 100,
  breakdown_sec: 300,
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

const defaultForceActual: ForceActualData = {
  actual: 0,
};

const defaultDateTime: DateTimeData = {
  date: "",
  time: "",
  setAt: 0,
};

interface ConfigContextType {
  config: ConfigData;
  breakConfig: BreakConfig;
  forceActual: ForceActualData;
  dateTime: DateTimeData;
  isLoading: boolean;
  updateConfig: (config: ConfigData) => void;
  updateBreakConfig: (breakConfig: BreakConfig) => void;
  updateForceActual: (forceActual: ForceActualData) => void;
  updateDateTime: (dateTime: DateTimeData) => void;
  saveConfig: () => Promise<void>;
  saveBreaks: () => Promise<void>;
  saveForceActual: () => Promise<void>;
  saveDateTime: () => Promise<void>;
  fetchConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Provider Component
export function ConfigProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ConfigData>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);

    return stored ? JSON.parse(stored) : defaultConfig;
  });

  const [breakConfig, setBreakConfig] = useState<BreakConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.BREAKS);

    return stored ? JSON.parse(stored) : defaultBreakConfig;
  });

  const [forceActual, setForceActual] = useState<ForceActualData>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.FORCE_ACTUAL);

    return stored ? JSON.parse(stored) : defaultForceActual;
  });

  const [dateTime, setDateTime] = useState<DateTimeData>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DATE_TIME);

    return stored ? JSON.parse(stored) : defaultDateTime;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BREAKS, JSON.stringify(breakConfig));
  }, [breakConfig]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.FORCE_ACTUAL,
      JSON.stringify(forceActual),
    );
  }, [forceActual]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DATE_TIME, JSON.stringify(dateTime));
  }, [dateTime]);

  // API Save Functions with real API integration
  const saveConfig = async () => {
    try {
      const thresholdValue = parseInt(config.threshold?.toString() || "90");

      if (isNaN(thresholdValue) || thresholdValue < 0 || thresholdValue > 100) {
        throw new Error("Threshold must be between 0 and 100");
      }

      const lineId = config.line || getLineId();
      const modelId = config.model || getModel();

      // Store for future use
      localStorage.setItem(STORAGE_KEYS.LINE_ID, lineId);
      localStorage.setItem(STORAGE_KEYS.MODEL, modelId);

      // Format data to match backend structure
      const configToSend = {
        line: config.line,
        model: config.model,
        tt_sec: parseFloat(config.tt_sec?.toString() || "10.0"),
        count_per_cycle: parseInt(config.count_per_cycle?.toString() || "1"),
        target: parseInt(config.target?.toString() || "0"),
        threshold: parseInt(config.threshold?.toString() || "90"),
        flu_other_sec: parseInt(config.flu_other_sec?.toString() || "1800"),
        short_breakdown_sec: parseInt(
          config.short_breakdown_sec?.toString() || "100",
        ),
        breakdown_sec: parseInt(config.breakdown_sec?.toString() || "300"),
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

      const response = await fetch(
        `${API_BASE_URL}/${config.line}/${config.model}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(configToSend),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
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

  const saveForceActual = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/force-actual/${config.line}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(forceActual),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
    } catch (error) {
      console.error("Failed to save force actual:", error);
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
      const response = await fetch(
        `${API_BASE_URL}/${config.line}/${config.model}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Update config with fetched data if needed

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
    forceActual,
    dateTime,
    isLoading,
    updateConfig: setConfig,
    updateBreakConfig: setBreakConfig,
    updateForceActual: setForceActual,
    updateDateTime: setDateTime,
    saveConfig,
    saveBreaks,
    saveForceActual,
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
