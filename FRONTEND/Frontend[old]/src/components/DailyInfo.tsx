import { memo, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { Tooltip } from "@heroui/tooltip";
import { cn } from "@heroui/theme";

import {
  BLACK_LABEL_CLASS,
  HEADER_CLASS,
  VALUE_CLASS,
} from "./shared/constants";

/* Type */

interface Props {
  plan: number;
  actual: number;
  tt: number;
  efficiency: number;
  threshold: number;
  hourlyData?: Record<number, number>;
  hourlyPlan?: number;
}

interface MetricColumnProps {
  label: string;
  value: number;
  isPercentage?: boolean;
  isHighlight?: boolean;
  showBorder?: boolean;
  backgroundColor?: string;
}

/* Metric */

const MetricColumn = memo(
  ({
    label,
    value,
    isPercentage,
    isHighlight,
    showBorder,
    backgroundColor,
  }: MetricColumnProps) => {
    return (
      <div
        className={cn(
          "flex flex-col",
          showBorder && "border-r-2 border-t-2 border-gray-800",
          backgroundColor,
        )}
      >
        <div className="bg-orange-300 font-bold text-4xl py-4 flex items-center justify-center">{label}</div>
        <div
          className={cn(
            "text-7xl flex-1 flex items-center justify-center",
            VALUE_CLASS,
            isHighlight && "text-[#3F51B5]",
          )}
        >
          {isPercentage ? `${value}%` : value}
        </div>
      </div>
    );
  },
);

MetricColumn.displayName = "MetricColumn";

/* Daily Graph */

const PlanActualTimeline = memo(
  ({
    threshold,
    hourlyData,
    hourlyPlan,
  }: {
    threshold: number;
    hourlyData?: Record<number, number>;
    hourlyPlan?: number;
  }) => {
    const hours = useMemo(() => {
      const hoursArray = [];

      for (let i = 6; i < 6 + 24; i++) {
        hoursArray.push(i % 24);
      }

      return hoursArray;
    }, []);

    return (
      <div className="w-full flex flex-col items-center px-6">
        {/* Hour labels */}
        <div className="flex text-[18px] text-gray-800 mb-1 w-full">
          {hours.map((hour) => (
            <div key={hour} className="flex justify-center flex-1">
              {hour}
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="flex gap-[2px] w-full">
          {hours.flatMap((hour) =>
            Array.from({ length: 4 }).map((_, q) => {
              // Calculate efficiency from API data
              const hourlyActual = hourlyData?.[hour];
              const hasData =
                hourlyActual !== undefined && hourlyActual !== null;
              const hourlyPlanValue = hourlyPlan || 1; // Prevent division by zero
              const actualEfficiency =
                hasData && hourlyPlanValue
                  ? (hourlyActual / hourlyPlanValue) * 100
                  : 0;

              // Green if actual efficiency >= threshold, Red if doesn't meet, Gray if no data
              let barColor = "bg-gray-300";

              if (hasData) {
                barColor =
                  actualEfficiency >= threshold ? "bg-green-500" : "bg-red-500";
              }

              return (
                <Tooltip
                  key={`${hour}-${q}`}
                  content={
                    hasData
                      ? `Hour ${hour}:${q * 15} | Target: ${threshold}% | Actual: ${actualEfficiency.toFixed(1)}% (${hourlyActual}/${hourlyPlanValue})`
                      : `Hour ${hour}:${q * 15} | No data`
                  }
                >
                  <div
                    className={cn(
                      "flex-1 h-4 rounded-sm cursor-pointer transition-opacity hover:opacity-80",
                      barColor,
                    )}
                  />
                </Tooltip>
              );
            }),
          )}
        </div>
      </div>
    );
  },
);

PlanActualTimeline.displayName = "PlanActualTimeline";

/* Daily Cards */

export const DailyInfo = memo(
  ({
    plan,
    actual,
    tt,
    efficiency,
    threshold,
    hourlyData,
    hourlyPlan,
  }: Props) => {
    return (
      <Card className="flex-1" radius="none" shadow="none">
        <CardBody
          className="
          grid
          grid-cols-[300px_1fr_1fr_1fr_1fr]
          grid-rows-[auto_80px]
          p-0
          h-full
        "
        >
          <div
            className={cn(
              BLACK_LABEL_CLASS,
              "border-r border-gray-800 row-span-2",
            )}
          >
            INFORMATION
            <br />
            (DAILY)
          </div>

          {/* METRICS */}
          <MetricColumn showBorder label="PLAN" value={plan} />
          <MetricColumn showBorder label="ACTUAL" value={actual} />
          <MetricColumn showBorder label="TT. / ATT." value={tt} />
          <MetricColumn
            isHighlight
            isPercentage
            backgroundColor={
              efficiency >= threshold ? "bg-green-500 border-t" : "bg-red-500 border-t"
            }
            label="% EFFICIENCY"
            value={efficiency}
          />

          {/* TIMELINE - uses threshold for comparison */}
          <div className="col-span-4 border-t border-gray-800 px-4 flex items-center">
            <PlanActualTimeline
              hourlyData={hourlyData}
              hourlyPlan={hourlyPlan}
              threshold={threshold}
            />
          </div>
        </CardBody>
      </Card>
    );
  },
);

DailyInfo.displayName = "DailyInfo";
