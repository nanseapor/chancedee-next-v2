"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChangeIndicator } from '../indicators/ChangeIndicator';

interface EditableFieldProps {
  label: string;
  name: string;
  isChanged: boolean;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: ReactNode;
  className?: string;
}

export function EditableField({
  label,
  name,
  isChanged,
  error,
  required,
  helpText,
  children,
  className,
}: EditableFieldProps) {
  return (
    <div
      data-testid="field-container"
      className={cn(
        "relative space-y-2 p-4 rounded-lg border transition-colors",
        error ? "border-red-500 bg-red-50" : "border-gray-200",
        isChanged && !error && "border-orange-300 bg-orange-50",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {isChanged && <ChangeIndicator />}
      </div>

      {children}

      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
