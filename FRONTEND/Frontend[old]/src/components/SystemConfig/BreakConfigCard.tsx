import type { BreakRow } from "../../types";

import { memo, useCallback } from "react";
import { Card, CardBody } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Button } from "@heroui/button";
import { Plus, Trash2 } from "lucide-react";

import { useConfig } from "../../contexts/ConfigContext";

type Props = {
  title: string;
  type: "dayBreak" | "nightBreak";
};

const isValidTime = (t: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);

const BreakRowComponent = memo(
  ({
    row,
    index,
    onUpdate,
    onDelete,
    canDelete,
  }: {
    row: BreakRow;
    index: number;
    onUpdate: (index: number, patch: Partial<BreakRow>) => void;
    onDelete: (index: number) => void;
    canDelete: boolean;
  }) => (
    <div className="grid grid-cols-[40px_44px_1fr_1fr_40px] items-center gap-4 text-sm">
      <span className="text-gray-600">{index + 1}</span>

      <Checkbox
        aria-label={`Enable slot ${index + 1}`}
        isSelected={row.enabled}
        onValueChange={(checked) => onUpdate(index, { enabled: checked })}
      />

      <div>
        <label className="text-gray-500 block text-xs mb-1">Start</label>
        <input
          aria-label={`Start time for slot ${index + 1}`}
          className={`w-full rounded px-2 py-1 text-sm border transition-colors ${
            row.start && !isValidTime(row.start)
              ? "border-red-500 focus:border-red-600"
              : "border-gray-300 focus:border-blue-500"
          } focus:outline-none`}
          inputMode="numeric"
          placeholder="HH:MM"
          title="24-hour format, e.g. 09:30 or 18:45"
          type="text"
          value={row.start}
          onChange={(e) => onUpdate(index, { start: e.target.value })}
        />
      </div>

      <div>
        <label className="text-gray-500 block text-xs mb-1">End</label>
        <input
          aria-label={`End time for slot ${index + 1}`}
          className={`w-full rounded px-2 py-1 text-sm border transition-colors ${
            row.end && !isValidTime(row.end)
              ? "border-red-500 focus:border-red-600"
              : "border-gray-300 focus:border-blue-500"
          } focus:outline-none`}
          inputMode="numeric"
          placeholder="HH:MM"
          title="24-hour format, e.g. 09:30 or 18:45"
          type="text"
          value={row.end}
          onChange={(e) => onUpdate(index, { end: e.target.value })}
        />
      </div>

      <Button
        isIconOnly
        color="danger"
        isDisabled={!canDelete}
        size="sm"
        variant="light"
        onClick={() => onDelete(index)}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  ),
);

BreakRowComponent.displayName = "BreakRowComponent";

export default function BreakConfigCard({ title, type }: Props) {
  const { breakConfig, updateBreakConfig } = useConfig();
  const rows = breakConfig[type];

  const updateRow = useCallback(
    (index: number, patch: Partial<BreakRow>) => {
      const updatedRows = rows.map((r, i) =>
        i === index ? { ...r, ...patch } : r,
      );

      updateBreakConfig({ ...breakConfig, [type]: updatedRows });
    },
    [rows, breakConfig, type, updateBreakConfig],
  );

  const addRow = useCallback(() => {
    const newRow: BreakRow = {
      enabled: false,
      start: "",
      end: "",
    };
    const updatedRows = [...rows, newRow];

    updateBreakConfig({ ...breakConfig, [type]: updatedRows });
  }, [rows, breakConfig, type, updateBreakConfig]);

  const deleteRow = useCallback(
    (index: number) => {
      if (rows.length > 1) {
        const updatedRows = rows.filter((_, i) => i !== index);

        updateBreakConfig({ ...breakConfig, [type]: updatedRows });
      }
    },
    [rows, breakConfig, type, updateBreakConfig],
  );

  return (
    <Card shadow="sm">
      <CardBody>
        <h3 className="text-lg font-bold mb-4">{title}</h3>

        <div className="space-y-4">
          {rows.map((row, i) => (
            <BreakRowComponent
              key={i}
              canDelete={rows.length > 1}
              index={i}
              row={row}
              onDelete={deleteRow}
              onUpdate={updateRow}
            />
          ))}
        </div>

        <Button
          className="mt-4"
          color="primary"
          startContent={<Plus size={16} />}
          variant="bordered"
          onClick={addRow}
        >
          ADD BREAK TIME
        </Button>
      </CardBody>
    </Card>
  );
}
