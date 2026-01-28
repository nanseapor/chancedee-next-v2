"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EditableField } from './EditableField';

interface SelectOption {
  value: string;
  label: string;
}

interface EditableSelectProps {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  isChanged: boolean;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  helpText?: string;
}

export function EditableSelect({
  label,
  name,
  value,
  options,
  onChange,
  isChanged,
  error,
  required,
  placeholder = 'เลือก...',
  disabled = false,
  helpText,
}: EditableSelectProps) {
  return (
    <EditableField
      label={label}
      name={name}
      isChanged={isChanged}
      error={error}
      required={required}
      helpText={helpText}
    >
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </EditableField>
  );
}
