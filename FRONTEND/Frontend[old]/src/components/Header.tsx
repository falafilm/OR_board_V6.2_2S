/* eslint-disable no-console */
"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { useConfig } from "../contexts/ConfigContext";

interface HeaderProps {
  isConnected?: boolean;
  lastUpdate?: Date | null;
  hourlyActual?: number;
}

export function Header({
  isConnected = true,
  lastUpdate = null,
  hourlyActual = 0,
}: HeaderProps) {
  const navigate = useNavigate();
  const { dateTime } = useConfig();

  // ✅ SAFETY: ensure dateTime is always defined
  const safeDateTime = dateTime ?? {
    date: "",
    time: "",
    setAt: 0,
  };

  const [displayTime, setDisplayTime] = useState<string>("");
  const [displayDate, setDisplayDate] = useState<string>("");

  const [isActualStuck, setIsActualStuck] = useState(false);
  const [lastActualValue, setLastActualValue] = useState<number | null>(null);
  const [lastActualChangeTime, setLastActualChangeTime] = useState<number>(
    Date.now(),
  );

  // ------------------------------------
  // ACTUAL STUCK DETECTION
  // ------------------------------------
  useEffect(() => {
    if (lastActualValue === null) {
      setLastActualValue(hourlyActual);
      setLastActualChangeTime(Date.now());
      return;
    }

    if (hourlyActual !== lastActualValue) {
      setLastActualValue(hourlyActual);
      setLastActualChangeTime(Date.now());
      setIsActualStuck(false);
    }
  }, [hourlyActual, lastActualValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastChange = Date.now() - lastActualChangeTime;

      if (timeSinceLastChange > 60000 && hourlyActual > 0 && isConnected) {
        setIsActualStuck(true);
      } else {
        setIsActualStuck(false);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lastActualChangeTime, hourlyActual, isConnected]);

  // ------------------------------------
  // DATE / TIME FORMATTERS
  // ------------------------------------
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatTime = (h: number, m: number, s: number) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  // ------------------------------------
  // LOGICAL CLOCK (LINE-SYNCED TIME)
  // ------------------------------------
  useEffect(() => {
    const updateClock = () => {
      if (
        safeDateTime.date &&
        safeDateTime.time &&
        safeDateTime.setAt
      ) {
        const now = Date.now();
        const elapsedSeconds = Math.floor(
          (now - safeDateTime.setAt) / 1000,
        );

        const [h, m, s] = safeDateTime.time
          .split(":")
          .map(Number);

        let totalSeconds =
          h * 3600 + m * 60 + (s || 0) + elapsedSeconds;

        const daysElapsed = Math.floor(totalSeconds / 86400);
        totalSeconds = totalSeconds % 86400;

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const baseDate = new Date(safeDateTime.date);
        baseDate.setDate(baseDate.getDate() + daysElapsed);

        setDisplayTime(formatTime(hours, minutes, seconds));
        setDisplayDate(
          formatDate(baseDate.toISOString().split("T")[0]),
        );
      } else {
        // fallback to system time
        const now = new Date();
        setDisplayTime(
          formatTime(
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
          ),
        );
        setDisplayDate(
          formatDate(now.toISOString().split("T")[0]),
        );
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [safeDateTime.date, safeDateTime.time, safeDateTime.setAt]);

  // ------------------------------------
  // STATUS UI
  // ------------------------------------
  const getStatusColor = () => {
    if (!isConnected) return "bg-red-500";
    if (isActualStuck) return "bg-red-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (!isConnected) return "Disconnected";
    if (isActualStuck) return "Counter Stuck";
    return "Live";
  };

  // ------------------------------------
  // RENDER
  // ------------------------------------
  return (
    <Card className="border-b" radius="none" shadow="none">
      <CardBody className="flex flex-row items-center justify-between px-6 py-3">
        <div className="w-100">
          <img
            alt="Denso Logo"
            className="h-30 object-contain"
            src="/img/Denso-Logo.png"
          />
        </div>

        <div className="flex flex-col items-center flex-1">
          <h2 className="text-7xl font-bold">
            Production Performance
          </h2>

          {(displayDate || displayTime) && (
            <div className="text-5xl mt-1">
              <span className="text-red-700">{displayDate}</span>
              <span className="mx-2"></span>
              <span className="text-red-700">{displayTime}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-md bg-gray-100 px-3 py-2 rounded-lg shadow-smr">
            <span
              className={`inline-block w-2 h-2 ${getStatusColor()} rounded-full mr-2 ${
                !isActualStuck && isConnected ? "animate-pulse" : ""
              }`}
            />
            <span className="font-medium">
              {getStatusText()}
            </span>
            {isConnected && lastUpdate && !isActualStuck && (
              <span className="ml-2 text-gray-500">
                • {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>

          <Button
            isIconOnly
            size="xl"
            variant="light"
            onPress={() => navigate("/system-config")}
          >
            <Settings size={70} />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
