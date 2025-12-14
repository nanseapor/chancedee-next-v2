"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface RememberCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function RememberCheckbox({ checked, onChange }: RememberCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="remember-choice"
        checked={checked}
        onCheckedChange={onChange}
      />
      <label
        htmlFor="remember-choice"
        className="text-sm text-gray-700 cursor-pointer"
      >
        จดจำการเลือกนี้ (Remember my choice)
      </label>
    </div>
  );
}
