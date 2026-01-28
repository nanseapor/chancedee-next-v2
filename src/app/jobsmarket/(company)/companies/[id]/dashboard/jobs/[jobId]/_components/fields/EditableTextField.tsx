"use client";

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EditableField } from './EditableField';

interface EditableTextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  isChanged: boolean;
  error?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
}

export function EditableTextField({
  label,
  name,
  value,
  onChange,
  isChanged,
  error,
  required,
  placeholder,
  helpText,
  multiline = false,
  rows = 4,
  maxLength,
}: EditableTextFieldProps) {
  const InputComponent = multiline ? Textarea : Input;

  return (
    <EditableField
      label={label}
      name={name}
      isChanged={isChanged}
      error={error}
      required={required}
      helpText={helpText}
    >
      <InputComponent
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? rows : undefined}
        maxLength={maxLength}
        className={error ? "border-red-500" : ""}
      />
      {maxLength && (
        <div className="text-xs text-muted-foreground text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </EditableField>
  );
}
