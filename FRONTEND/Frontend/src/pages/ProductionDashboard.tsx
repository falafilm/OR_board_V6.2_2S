/* eslint-disable no-console */
import { useMemo, useState, useEffect, useCallback } from "react";

import { Header } from "../components/Header";
import { LineModelInfo } from "../components/LineModelInfo";
import { HourlyInfo } from "../components/HourlyInfo";
import { DailyInfo } from "../components/DailyInfo";
import { useConfig } from "../contexts/ConfigContext";
import { getRuntimeConfig } from "../config/runtimeConfig";

const { API_BASE_URL } = getRuntimeConfig();

export default function ProductionDashboard() {
  const { config } = useConfig();

  const [liveData, setLiveData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(true);

  const fetchProductionData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/live`);

      if (!response.ok) {
        console.error("Failed to fetch live data, status:", response.status);
        setIsConnected(false);
        return;
      }

      const data = await response.json();

      setLiveData(data);
      setIsConnected(true);

      console.log("Live production data:", data);
      console.log(
        "Hourly Plan:",
        data.hourlyPlan,
        "Hourly Actual:",
        data.hourlyActual,
      );
      console.log("Daily Plan:", data.plan, "Daily Actual:", data.actual);
    } catch (error) {
      console.error("Failed to fetch production data:", error);
      setIsConnected(false);
    }
  }, []);

  /**
   * 🔥 REALTIME SAFE POLLING
   * - No overlapping requests
   * - Fetch again immediately after the last one finishes
   */
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;

      await fetchProductionData();

      if (!cancelled) {
        // 0ms = fastest safe polling
        setTimeout(poll, 2500);
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [fetchProductionData]);

  const line = config.line || liveData?.line || "N/A";
  const model = config.model || "N/A";

  const tt = useMemo(() => {
    let ttValue = 0;

    if (liveData?.tt_sec !== undefined && liveData?.tt_sec !== null) {
      ttValue = parseFloat(liveData.tt_sec.toString());
    } else {
      ttValue = parseFloat(config.tt_sec?.toString() || "0.0");
    }

    return isNaN(ttValue) ? 10.0 : ttValue;
  }, [config.tt_sec, liveData]);

  const threshold = useMemo(() => {
    const thresholdValue = parseInt(config.threshold?.toString() || "0");
    return isNaN(thresholdValue) ? 90 : thresholdValue;
  }, [config.threshold]);

  const hourlyActual = useMemo(() => {
    if (liveData?.actual_hour !== undefined && liveData?.actual_hour !== null) {
      return liveData.actual_hour;
    }
    return 0;
  }, [liveData]);

  const hourlyPlan = useMemo(() => {
    if (
      liveData?.plan_per_hour !== undefined &&
      liveData?.plan_per_hour !== null
    ) {
      return liveData.plan_per_hour;
    }
    return 0;
  }, [liveData]);

  const dailyActual = useMemo(() => {
    if (liveData?.actual !== undefined && liveData?.actual !== null) {
      return liveData.actual;
    }
    return 0;
  }, [liveData]);

  const dailyPlan = useMemo(() => {
    if (liveData?.pp_plan !== undefined && liveData?.pp_plan !== null) {
      return liveData.pp_plan;
    }
    return 0;
  }, [liveData]);

  const efficiency = useMemo(() => {
    if (liveData?.eff !== undefined) return liveData.eff;
    return null;
  }, [liveData]);

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden relative">
      <Header
        hourlyActual={hourlyActual}
        isConnected={isConnected}
        //lastUpdate={lastUpdate}
      />

      <div className="flex-1 flex flex-col gap-3">
        <LineModelInfo line={line} model={model} />
        <HourlyInfo actual={hourlyActual} plan={hourlyPlan} />
        <DailyInfo
          actual={dailyActual}
          efficiency={efficiency}
          plan={dailyPlan}
          threshold={threshold}
          tt={tt}
        />
      </div>
    </div>
  );
}
