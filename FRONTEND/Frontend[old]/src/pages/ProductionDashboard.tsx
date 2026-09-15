/* eslint-disable no-console */
import { useMemo, useState, useEffect, useCallback } from "react";

import { Header } from "../components/Header";
import { LineModelInfo } from "../components/LineModelInfo";
import { HourlyInfo } from "../components/HourlyInfo";
import { DailyInfo } from "../components/DailyInfo";
import { useConfig } from "../contexts/ConfigContext";

const API_BASE_URL = "http://192.168.1.39:5501/api";
const POLLING_INTERVAL = 1000;

export default function ProductionDashboard() {
  const { config, forceActual } = useConfig();
  const [liveData, setLiveData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchProductionData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/live`);

      if (response.ok) {
        const data = await response.json();

        setLiveData(data);
        setIsConnected(true);
        setLastUpdate(new Date());
        console.log("Live production data:", data);
        console.log(
          "Hourly Plan:",
          data.hourlyPlan,
          "Hourly Actual:",
          data.hourlyActual,
        );
        console.log("Daily Plan:", data.plan, "Daily Actual:", data.actual);
      } else {
        console.error("Failed to fetch live data, status:", response.status);
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Failed to fetch production data:", error);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchProductionData();
    const interval = setInterval(fetchProductionData, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchProductionData]);

  const line = config.line || liveData?.line || "N/A";
  const model = config.model || liveData?.model || "N/A";

  const tt = useMemo(() => {
    let ttValue = 0;

    if (liveData?.att_sec !== undefined && liveData?.att_sec !== null) {
      ttValue = parseFloat(liveData.att_sec.toString());
    } else {
      ttValue = parseFloat(config.att_sec?.toString() || "0.0");
    }

    return isNaN(ttValue) ? 10.0 : ttValue;
  }, [config.att_sec, liveData]);

  const threshold = useMemo(() => {
    const thresholdValue = parseInt(config.threshold?.toString() || "90");

    return isNaN(thresholdValue) ? 90 : thresholdValue;
  }, [config.threshold]);

  const hourlyActual = useMemo(() => {
    console.log(
      "Calculating hourlyActual - liveData:",
      liveData?.actual_hour,
      "forceActual:",
      forceActual.actual,
    );
    if (liveData?.actual_hour !== undefined && liveData?.actual_hour !== null) {
      return liveData.actual_hour;
    }

    if (forceActual.actual) {
      const actual =
        typeof forceActual.actual === "string"
          ? parseInt(forceActual.actual)
          : forceActual.actual;

      return isNaN(actual) ? 0 : actual;
    }

    return 0;
  }, [forceActual.actual, liveData]);

  const hourlyPlan = useMemo(() => {
    console.log("Calculating hourlyPlan - liveData:", liveData?.plan_per_hour);
    if (
      liveData?.plan_per_hour !== undefined &&
      liveData?.plan_per_hour !== null
    ) {
      return liveData.plan_per_hour;
    }

    return 0;
  }, [liveData]);

  const dailyActual = useMemo(() => {
    console.log("Calculating dailyActual - liveData:", liveData?.actual);
    if (liveData?.actual !== undefined && liveData?.actual !== null) {
      return liveData.actual;
    }

    return 0;
  }, [liveData]);

  const dailyPlan = useMemo(() => {
    console.log("Calculating dailyPlan - liveData:", liveData?.pp_plan);
    if (liveData?.pp_plan !== undefined && liveData?.pp_plan !== null) {
      return liveData.pp_plan;
    }

    return 0;
  }, [liveData]);

  const efficiency = useMemo(() => {
    if (liveData?.eff !== undefined) return liveData.eff;

    return threshold;
  }, [liveData, threshold]);

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden relative">
      <Header
        hourlyActual={hourlyActual}
        isConnected={isConnected}
        lastUpdate={lastUpdate}
      />

      <div className="flex-1 flex flex-col gap-3">
        <LineModelInfo line={line} model={model} />
        <HourlyInfo actual={hourlyActual} plan={hourlyPlan} />
        <DailyInfo
          actual={dailyActual}
          efficiency={efficiency}
          hourlyData={liveData?.hourly}
          hourlyPlan={hourlyPlan}
          plan={dailyPlan}
          threshold={threshold}
          tt={tt}
        />
      </div>
    </div>
  );
}
