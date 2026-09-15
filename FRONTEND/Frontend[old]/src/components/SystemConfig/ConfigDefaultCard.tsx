import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";

import { useConfig } from "../../contexts/ConfigContext";

export default function ConfigDefaultCard() {
  const { config, updateConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState(config);

  const handleInputChange = (
    field: string,
    value: string | number | boolean,
  ) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Update config whenever localConfig changes
  useEffect(() => {
    updateConfig(localConfig);
  }, [localConfig, updateConfig]);

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
              placeholder={config.line || "Line"}
              type="text"
              value={localConfig.line}
              onChange={(e) => handleInputChange("line", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">Model</label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              placeholder={config.model || "Model"}
              type="text"
              value={localConfig.model}
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
              placeholder={config.tt_sec?.toString() || "TT/ATT (Sec)"}
              type="number"
              value={localConfig.tt_sec}
              onChange={(e) =>
                handleInputChange("tt_sec", parseFloat(e.target.value) || 0)
              }
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Count per Cycle
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              inputMode="numeric"
              placeholder={
                config.count_per_cycle?.toString() || "Count per Cycle"
              }
              type="number"
              value={localConfig.count_per_cycle}
              onChange={(e) =>
                handleInputChange(
                  "count_per_cycle",
                  parseInt(e.target.value) || 1,
                )
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
              placeholder={config.threshold?.toString() || "Threshold"}
              type="number"
              value={localConfig.threshold}
              onChange={(e) =>
                handleInputChange("threshold", parseInt(e.target.value) || 90)
              }
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              FLU Other Sec
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              inputMode="numeric"
              placeholder={config.flu_other_sec?.toString() || "FLU Other Sec"}
              type="number"
              value={localConfig.flu_other_sec}
              onChange={(e) =>
                handleInputChange(
                  "flu_other_sec",
                  parseInt(e.target.value) || 1800,
                )
              }
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Short Breakdown Sec
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              inputMode="numeric"
              placeholder={config.short_breakdown_sec?.toString() || "Short Breakdown Sec"}
              type="number"
              value={localConfig.short_breakdown_sec}
              onChange={(e) =>
                handleInputChange(
                  "short_breakdown_sec",
                  parseInt(e.target.value) || 100,
                )
              }
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Breakdown Sec
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              inputMode="numeric"
              placeholder={config.breakdown_sec?.toString() || "Breakdown Sec"}
              type="number"
              value={localConfig.breakdown_sec}
              onChange={(e) =>
                handleInputChange(
                  "breakdown_sec",
                  parseInt(e.target.value) || 300,
                )
              }
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Day Start
            </label>
            <input
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              placeholder={config.day_start || "Day Start (HH:MM)"}
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
              placeholder={config.night_start || "Night Start (HH:MM)"}
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
              placeholder={config.reset_day_time || "Reset Day Time (HH:MM)"}
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
              placeholder={config.reset_night_time || "Reset Night Time (HH:MM)"}
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