"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { EditableField } from './EditableField';

interface EditableNumberInputProps {
  label: string;
  name: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  isChanged: boolean;
  error?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
}

export function EditableNumberInput({
  label,
  name,
  value,
  onChange,
  isChanged,
  error,
  required,
  min = 0,
  max = 999999,
  step = 1,
  helpText,
}: EditableNumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
    if (newValue === undefined || (!isNaN(newValue) && newValue >= min && newValue <= max)) {
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    const currentValue = value ?? min;
    if (currentValue < max) {
      onChange(currentValue + step);
    }
  };

  const handleDecrement = () => {
    const currentValue = value ?? min;
    if (currentValue > min) {
      onChange(currentValue - step);
    }
  };

  return (
    <EditableField
      label={label}
      name={name}
      isChanged={isChanged}
      error={error}
      required={required}
      helpText={helpText}
    >
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value !== undefined && value <= min}
          aria-label="ลด"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Input
          id={name}
          name={name}
          type="number"
          value={value ?? ''}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={`w-24 text-center ${error ? 'border-red-500' : ''}`}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={value !== undefined && value >= max}
          aria-label="เพิ่ม"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </EditableField>
  );
}
