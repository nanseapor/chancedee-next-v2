"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface SkillsTagInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  maxSkills?: number;
  error?: string;
  label?: string;
}

/**
 * Skills tag input component
 * Allows users to add/remove skills as tags
 */
export function SkillsTagInput({
  value,
  onChange,
  placeholder = "พิมพ์ทักษะและกด Enter",
  maxSkills,
  error,
  label = "ทักษะที่ต้องการ",
}: SkillsTagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const trimmedValue = inputValue.trim();

      // Ignore empty values
      if (!trimmedValue) return;

      // Check max skills limit
      if (maxSkills && value.length >= maxSkills) {
        return;
      }

      // Avoid duplicates
      if (value.includes(trimmedValue)) {
        setInputValue("");
        return;
      }

      // Add new skill
      onChange([...value, trimmedValue]);
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove last skill if input is empty and backspace is pressed
      onChange(value.slice(0, -1));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove));
  };

  const isMaxReached = Boolean(maxSkills && value.length >= maxSkills);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {maxSkills && (
            <span className="ml-2 text-xs text-gray-500">
              ({value.length}/{maxSkills})
            </span>
          )}
        </label>
      )}

      <div className="space-y-2">
        {/* Skills tags */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 rounded-full hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  aria-label={`ลบ ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Input field */}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isMaxReached ? `สูงสุด ${maxSkills} ทักษะ` : placeholder}
          disabled={isMaxReached}
          className={error ? "border-red-500 bg-red-50" : ""}
        />
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Helper text */}
      {!error && (
        <p className="text-xs text-gray-500">
          พิมพ์ทักษะและกด Enter เพื่อเพิ่ม
        </p>
      )}
    </div>
  );
}
