/* eslint-disable no-console */
import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";

import { useConfig } from "../../contexts/ConfigContext";

const API_BASE_URL = "http://192.168.1.39:5501/api";

export default function ForceActualCard() {
  const { config, forceActual, updateForceActual, breakConfig } = useConfig();
  const [localActual, setLocalActual] = useState(forceActual.actual);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalActual(forceActual.actual);
  }, [forceActual.actual]);

  const handleSetActual = async () => {
    if (!localActual || localActual === "") {
      console.error("Actual value cannot be empty");

      return;
    }

    setIsSaving(true);
    try {
      const lineId = config.line || "1";
      const modelId = config.model || "default";

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
        force_actual: parseInt(localActual),
      };

      const response = await fetch(`${API_BASE_URL}/${lineId}/${modelId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(configToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      updateForceActual({ actual: parseInt(localActual) });
      console.log("Force Actual saved successfully:", data);
    } catch (error) {
      console.error("Failed to save force actual:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const displayActual = forceActual.actual || "0";

  return (
    <Card shadow="sm">
      <CardBody className="space-y-4">
        <h3 className="text-lg font-bold">Force Actual</h3>

        <p className="text-gray-500 text-sm">
          Current Actual = {displayActual}
        </p>

        <div>
          <label className="block text-gray-500 text-xs mb-1">Actual</label>
          <input
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            inputMode="numeric"
            placeholder="Enter actual count"
            type="text"
            value={localActual}
            onChange={(e) => setLocalActual(e.target.value)}
          />
        </div>

        <Button
          className="self-end"
          color="primary"
          isDisabled={isSaving}
          isLoading={isSaving}
          onClick={handleSetActual}
        >
          SET ACTUAL
        </Button>
      </CardBody>
    </Card>
  );
}
