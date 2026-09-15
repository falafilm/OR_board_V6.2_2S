/* eslint-disable no-console */
import { useState, useEffect, useRef } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Clock, RotateCcw } from "lucide-react";

import { useConfig } from "../../contexts/ConfigContext";

export default function DateTimeCard() {
  const { dateTime, updateDateTime, saveDateTime } = useConfig();
  const [localDate, setLocalDate] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Update running clock every second
  useEffect(() => {
    const updateClock = () => {
      if (dateTime.setAt && dateTime.time && dateTime.date) {
        // Custom time is set - calculate elapsed time since setAt
        const now = Date.now();
        const elapsedMs = now - dateTime.setAt;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);

        // Parse the set time
        const [hours, minutes, seconds] = dateTime.time.split(":").map(Number);
        let totalSeconds =
          hours * 3600 + minutes * 60 + seconds + elapsedSeconds;

        // Handle day rollover
        const daysElapsed = Math.floor(totalSeconds / (24 * 3600));

        totalSeconds = totalSeconds % (24 * 3600);

        const displayHours = Math.floor(totalSeconds / 3600);
        const displayMinutes = Math.floor((totalSeconds % 3600) / 60);
        const displaySeconds = totalSeconds % 60;

        // Calculate new date if days have elapsed
        const baseDate = new Date(dateTime.date);

        baseDate.setDate(baseDate.getDate() + daysElapsed);
        const year = baseDate.getFullYear();
        const month = String(baseDate.getMonth() + 1).padStart(2, "0");
        const day = String(baseDate.getDate()).padStart(2, "0");

        if (!isEditingDate) {
          setLocalDate(`${year}-${month}-${day}`);
        }
        if (!isEditingTime) {
          setLocalTime(
            `${String(displayHours).padStart(2, "0")}:${String(displayMinutes).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`,
          );
        }
      } else {
        // No custom time set - show current system time
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        if (!isEditingDate) {
          setLocalDate(`${month}-${day}-${year}`);
        }
        if (!isEditingTime) {
          setLocalTime(
            `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
          );
        }
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, [
    dateTime.setAt,
    dateTime.time,
    dateTime.date,
    isEditingTime,
    isEditingDate,
  ]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTime(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalDate(e.target.value);
  };

  const handleTimeFocus = () => {
    setIsEditingTime(true);
  };

  const handleTimeBlur = () => {
    setIsEditingTime(false);
    // When user finishes editing, update the time and reset the timer
    if (localTime && localTime.match(/^\d{2}:\d{2}:\d{2}$/)) {
      // Valid time format - update context with new time
      const [month, day, year] = localDate.split("-");
      const isoDate =
        year && month && day ? `${year}-${month}-${day}` : dateTime.date;

      updateDateTime({
        date: isoDate || dateTime.date,
        time: localTime,
        setAt: Date.now(), // Reset the timer from this moment
      });
    }
  };

  const handleDateFocus = () => {
    setIsEditingDate(true);
  };

  const handleDateBlur = () => {
    setIsEditingDate(false);
    // When user finishes editing date, update it
    if (localDate && localDate.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const [month, day, year] = localDate.split("-");
      const isoDate = `${year}-${month}-${day}`;

      updateDateTime({
        date: isoDate,
        time: localTime || dateTime.time,
        setAt: Date.now(),
      });
    }
  };

  const handleSetDateTime = async () => {
    setIsSaving(true);
    try {
      // Convert MM-DD-YYYY to YYYY-MM-DD for storage
      const [month, day, year] = localDate.split("-");
      const isoDate = `${year}-${month}-${day}`;

      updateDateTime({
        date: isoDate,
        time: localTime,
        setAt: Date.now(),
      });
      await saveDateTime();
    } catch (error) {
      console.error("Failed to save date/time:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToCurrentTime = async () => {
    setIsResetting(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const isoDate = `${year}-${month}-${day}`;
      const currentTime = now.toTimeString().slice(0, 8);

      // Reset by clearing setAt (will use system time)
      updateDateTime({
        date: isoDate,
        time: currentTime,
        setAt: 0,
      });
      await saveDateTime();
    } catch (error) {
      console.error("Failed to reset date/time:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card shadow="sm">
      <CardBody className="space-y-4">
        <h3 className="text-lg font-bold">Date / Time Setting</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Date (YYYY-MM-DD)
            </label>
            <input
              ref={dateInputRef}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              placeholder="MM-DD-YYYY"
              type="text"
              value={localDate}
              onBlur={handleDateBlur}
              onChange={handleDateChange}
              onFocus={handleDateFocus}
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">
              Time (HH:MM:SS)
            </label>
            <input
              ref={timeInputRef}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              inputMode="numeric"
              placeholder="HH:MM:SS"
              title="24-hour format with seconds, e.g. 09:30:00 or 18:45:30"
              type="text"
              value={localTime}
              onBlur={handleTimeBlur}
              onChange={handleTimeChange}
              onFocus={handleTimeFocus}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            color="primary"
            isDisabled={isSaving || isResetting}
            isLoading={isSaving}
            startContent={!isSaving && <Clock size={16} />}
            onClick={handleSetDateTime}
          >
            SET DATE / TIME
          </Button>

          <Button
            className="flex-1"
            color="primary"
            isDisabled={isSaving || isResetting}
            isLoading={isResetting}
            startContent={!isResetting && <RotateCcw size={16} />}
            variant="bordered"
            onClick={handleResetToCurrentTime}
          >
            RESET TO CURRENT
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
