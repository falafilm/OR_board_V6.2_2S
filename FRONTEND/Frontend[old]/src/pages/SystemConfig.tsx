/* eslint-disable no-console */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { Save, Home } from "lucide-react";

import { Header } from "../components/Header";
import ConfigDefaultCard from "../components/SystemConfig/ConfigDefaultCard";
import ForceActualCard from "../components/SystemConfig/ForceActualCard";
import DateTimeCard from "../components/SystemConfig/DateTimeCard";
import BreakConfigCard from "../components/SystemConfig/BreakConfigCard";
import { useConfig } from "../contexts/ConfigContext";

export default function SystemConfig() {
  const navigate = useNavigate();
  const { saveConfig } = useConfig();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await saveConfig();
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-50">
      <Header hourlyActual={0} isConnected={true} lastUpdate={null} />

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-auto">
        <div className="space-y-6">
          <ConfigDefaultCard />
          <ForceActualCard />
          <DateTimeCard />
        </div>

        <div className="space-y-6">
          <BreakConfigCard title="Day Break" type="dayBreak" />
          <BreakConfigCard title="Night Break" type="nightBreak" />
          <div className="flex gap-2 p-2 bg-gray-50 justify-end">
            <Button
              color="primary"
              isDisabled={isSaving}
              isLoading={isSaving}
              startContent={!isSaving && <Save />}
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>

            <Button
              startContent={<Home />}
              variant="bordered"
              onClick={handleHome}
            >
              Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
