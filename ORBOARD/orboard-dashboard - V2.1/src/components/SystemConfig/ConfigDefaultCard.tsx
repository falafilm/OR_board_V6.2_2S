import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";

import { useConfig } from "../../contexts/ConfigContext";

const MODEL_STORAGE_KEY = "production_model";

export default function ConfigDefaultCard() {
  const { config, updateConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState({
    line: "",
    tt_sec: "",
    count_per_cycle_plan: "",
    count_per_cycle_actual: "",
    threshold: "",
    day_start: "",
    night_start: "",
    reset_day_time: "",
    reset_night_time: "",
  });
  const [localModel, setLocalModel] = useState("");

  // Load model from localStorage on mount
  useEffect(() => {
    const savedModel = localStorage.getItem(MODEL_STORAGE_KEY);

    if (savedModel) {
      setLocalModel(savedModel);
    }
  }, []);

  // Update local config when API config changes
  useEffect(() => {
    setLocalConfig({
      line: config.line || "",
      tt_sec: config.tt_sec?.toString() || "",
      count_per_cycle_plan:
        config.count_per_cycle_plan?.toString() ||
        config.count_per_cycle?.toString() ||
        "",
      count_per_cycle_actual:
        config.count_per_cycle_actual?.toString() ||
        config.count_per_cycle?.toString() ||
        "",
      threshold: config.threshold?.toString() || "",
      day_start: config.day_start || "",
      night_start: config.night_start || "",
      reset_day_time: config.reset_day_time || "",
      reset_night_time: config.reset_night_time || "",
    });
  }, [config]);

  const handleInputChange = (field: string, value: string) => {
    if (field === "model") {
      setLocalModel(value);
      localStorage.setItem(MODEL_STORAGE_KEY, value);
      updateConfig({ ...config, model: value });
    } else {
      setLocalConfig((prev) => ({ ...prev, [field]: value }));

      // Update config context
      let parsedValue: any = value;
      if (field === "tt_sec") {
        parsedValue = value ? parseFloat(value) : 0;
      } else if (
        field === "count_per_cycle_plan" ||
        field === "count_per_cycle_actual" ||
        field === "threshold"
      ) {
        parsedValue = value ? parseInt(value) : 0;
      }

      const updatedConfig = {
        ...config,
        [field]: parsedValue || value,
      };

      updateConfig(updatedConfig);
    }
  };

  return (
    <Card shadow="sm">
      <CardBody className="space-y-4">
        <div className="text-3xl font-bold py-3">
          <h3>System Config</h3>
        </div>
        <h3 className="text-lg font-bold">Config Data Default</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-500 text-xs mb-1">Line</label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              type="text"
              value={localConfig.line}
              onChange={(e) => handleInputChange("line", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">Model</label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              type="text"
              value={localModel}
              onChange={(e) => handleInputChange("model", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              TT/ATT (Sec)
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              inputMode="numeric"
              type="number"
              value={localConfig.tt_sec}
              onChange={(e) => handleInputChange("tt_sec", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Count per Cycle (Plan)
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              inputMode="numeric"
              type="number"
              value={localConfig.count_per_cycle_plan}
              onChange={(e) =>
                handleInputChange("count_per_cycle_plan", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Threshold (%)
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              inputMode="numeric"
              type="number"
              value={localConfig.threshold}
              onChange={(e) => handleInputChange("threshold", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Count per Cycle (Actual)
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              inputMode="numeric"
              type="number"
              value={localConfig.count_per_cycle_actual}
              onChange={(e) =>
                handleInputChange("count_per_cycle_actual", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Day Start
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              type="text"
              value={localConfig.day_start}
              onChange={(e) => handleInputChange("day_start", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Night Start
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              type="text"
              value={localConfig.night_start}
              onChange={(e) => handleInputChange("night_start", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Reset Day Time
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              type="text"
              value={localConfig.reset_day_time}
              onChange={(e) =>
                handleInputChange("reset_day_time", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Reset Night Time
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              type="text"
              value={localConfig.reset_night_time}
              onChange={(e) =>
                handleInputChange("reset_night_time", e.target.value)
              }
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
