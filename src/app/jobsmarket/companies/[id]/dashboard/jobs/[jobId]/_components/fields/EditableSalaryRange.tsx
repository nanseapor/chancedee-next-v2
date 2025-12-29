"use client";

import { Input } from '@/components/ui/input';
import { EditableField } from './EditableField';

interface EditableSalaryRangeProps {
  minValue: number | undefined;
  maxValue: number | undefined;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  isMinChanged: boolean;
  isMaxChanged: boolean;
  error?: string;
}

export function EditableSalaryRange({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  isMinChanged,
  isMaxChanged,
  error,
}: EditableSalaryRangeProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
    onMinChange(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
    onMaxChange(value);
  };

  return (
    <EditableField
      label="เงินเดือน (บาท/เดือน)"
      name="salary"
      isChanged={isMinChanged || isMaxChanged}
      error={error}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">ต่ำสุด</label>
          <Input
            type="number"
            value={minValue || ''}
            onChange={handleMinChange}
            placeholder="เช่น 30000"
            min={0}
            className={isMinChanged ? "border-orange-300" : ""}
          />
        </div>
        <span className="text-muted-foreground mt-5">-</span>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">สูงสุด</label>
          <Input
            type="number"
            value={maxValue || ''}
            onChange={handleMaxChange}
            placeholder="เช่น 50000"
            min={0}
            className={isMaxChanged ? "border-orange-300" : ""}
          />
        </div>
      </div>
    </EditableField>
  );
}
