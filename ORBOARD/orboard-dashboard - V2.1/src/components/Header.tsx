/* eslint-disable no-console */
"use client";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface HeaderProps {
  isConnected?: boolean;
  hourlyActual?: number;
  showStatus?: boolean;
}

export function Header({
  isConnected = true,
  hourlyActual = 0,
  showStatus = true,
}: HeaderProps) {
  const navigate = useNavigate();
  const [displayTime, setDisplayTime] = useState<string>("");
  const [displayDate, setDisplayDate] = useState<string>("");
  const [isActualStuck, setIsActualStuck] = useState(false);
  const [lastActualValue, setLastActualValue] = useState<number | null>(null);
  const [lastActualChangeTime, setLastActualChangeTime] = useState<number>(
    Date.now(),
  );

  // Monitor if actual count is stuck (no change for 1 minute)
  useEffect(() => {
    // Initialize on first run
    if (lastActualValue === null) {
      setLastActualValue(hourlyActual);
      setLastActualChangeTime(Date.now());

      return;
    }

    // Check if value actually changed
    if (hourlyActual !== lastActualValue) {
      console.log(`Actual changed from ${lastActualValue} to ${hourlyActual}`);
      setLastActualValue(hourlyActual);
      setLastActualChangeTime(Date.now());
      setIsActualStuck(false);
    }
  }, [hourlyActual, lastActualValue]);

  // Separate effect to check for stuck status
  useEffect(() => {
    const checkStuckInterval = setInterval(() => {
      const timeSinceLastChange = Date.now() - lastActualChangeTime;
      // Check if actual hasn't changed for 1 minute (60000ms) and production has started

      if (timeSinceLastChange > 300000 && hourlyActual > 0 && isConnected) {
        console.log(`Counter stuck - no change for ${timeSinceLastChange}ms`);
        setIsActualStuck(true);
      } else if (timeSinceLastChange <= 300000) {
        setIsActualStuck(false);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkStuckInterval);
  }, [lastActualChangeTime, hourlyActual, isConnected]);

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Update clock every second using Thailand time (Asia/Bangkok timezone)
  useEffect(() => {
    const updateClock = () => {
      // Get current time in Thailand timezone
      const thailandTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Bangkok",
      });
      const now = new Date(thailandTime);

      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      setDisplayTime(formatTime(hours, minutes, seconds));
      setDisplayDate(formatDate(now));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  // Determine status color and text
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
        <div className="flex flex-col items-center flex-1 mx-auto">
          <h2 className="text-7xl font-bold">Production Performance</h2>
          {(displayDate || displayTime) && (
            <div className="text-5xl text-gray-600 mt-1">
              {displayDate && (
                <span className="text-red-700">{displayDate}</span>
              )}
              {displayDate && displayTime && (
                <span className="mx-2 text-red-700"></span>
              )}
              {displayTime && (
                <span className="text-red-700">{displayTime}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 w-[200px]">
          {/* Status Indicator */}
          {showStatus && (
            <div className="text-md text-gray-700 bg-gray-100 px-3 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className={`inline-block w-2 h-2 ${getStatusColor()} rounded-full mr-2 ${!isActualStuck && isConnected ? 'animate-pulse' : ''}`}></span>
              <span className="font-medium">{getStatusText()}</span>
              {isConnected && !isActualStuck}
            </div>
          )}
          <Button
            isIconOnly
            size="lg"
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
