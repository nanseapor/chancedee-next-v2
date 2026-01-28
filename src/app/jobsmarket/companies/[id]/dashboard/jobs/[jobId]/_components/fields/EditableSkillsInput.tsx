"use client";

import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { EditableField } from './EditableField';

interface EditableSkillsInputProps {
  label: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  isChanged: boolean;
  error?: string;
  placeholder?: string;
  maxSkills?: number;
}

export function EditableSkillsInput({
  label,
  name,
  value,
  onChange,
  isChanged,
  error,
  placeholder = "พิมพ์แล้วกด Enter เพื่อเพิ่ม",
  maxSkills = 10,
}: EditableSkillsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim()) && value.length < maxSkills) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const handleRemove = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove));
  };

  return (
    <EditableField
      label={label}
      name={name}
      isChanged={isChanged}
      error={error}
      helpText={`สูงสุด ${maxSkills} ทักษะ (เหลือ ${maxSkills - value.length})`}
    >
      <div className="space-y-2">
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemove(skill)}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={value.length >= maxSkills}
        />
      </div>
    </EditableField>
  );
}
