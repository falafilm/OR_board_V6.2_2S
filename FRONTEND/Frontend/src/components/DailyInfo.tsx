import { memo } from "react";
import { Card, CardBody } from "@heroui/card";
import { cn } from "@heroui/theme";

import { BLACK_LABEL_CLASS, VALUE_CLASS } from "./shared/constants";

/* =======================
   Types
======================= */

interface Props {
  plan: number;
  actual: number;
  tt: number;
  efficiency: number | null;
  threshold: number;
}

interface MetricColumnProps {
  label: string;
  value: number | null;
  isPercentage?: boolean;
  isHighlight?: boolean;
  showBorder?: boolean;
  backgroundColor?: string;
}

/* =======================
   MetricColumn
======================= */

const MetricColumn = memo(
  ({
    label,
    value,
    isPercentage,
    isHighlight,
    showBorder,
    backgroundColor,
  }: MetricColumnProps) => {
    const isRedBackground = backgroundColor?.includes("bg-red");

    return (
      <div
        className={cn(
          "flex flex-col h-full",
          showBorder && "border-r-2 border-gray-800",
          backgroundColor,
        )}
      >
        {/* Label */}
        <div className="bg-orange-300 font-bold text-4xl py-4 flex items-center justify-center border-t-2">
          {label}
        </div>

        {/* Value */}
        <div
          className={cn(
            "text-7xl flex-1 flex items-center justify-center",
            VALUE_CLASS,
            isHighlight && "text-[#3F51B5]",
            isRedBackground && "text-zinc-100",
          )}
        >
          {value !== null ? (isPercentage ? `${value}%` : value) : ""}
        </div>
      </div>
    );
  },
);

MetricColumn.displayName = "MetricColumn";

export const DailyInfo = memo(
  ({ plan, actual, tt, efficiency, threshold }: Props) => {
    return (
      <Card className="flex-1" radius="none" shadow="none">
        <CardBody
          className="
            grid
            grid-cols-[300px_1fr_1fr_1fr_1fr]
            p-0
            h-full
          "
        >
          <div
            className={cn(
              BLACK_LABEL_CLASS,
              "border-r border-gray-800 flex items-center justify-center",
            )}
          >
            INFORMATION
            <br />
            (DAILY)
          </div>

          {/* Metrics */}
          <MetricColumn showBorder label="PLAN" value={plan} />
          <MetricColumn showBorder label="ACTUAL" value={actual} />
          <MetricColumn showBorder label="TT. / ATT." value={tt} />

          <MetricColumn
            isHighlight
            isPercentage
            backgroundColor={
              efficiency !== null
                ? efficiency >= threshold
                  ? "bg-green-500 border-t"
                  : "bg-red-500 border-t"
                : "bg-white"
            }
            label="% EFFICIENCY"
            value={efficiency}
          />
        </CardBody>
      </Card>
    );
  },
);

DailyInfo.displayName = "DailyInfo";
