"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { COMMON_SKILLS, COMMON_LANGUAGES, LANGUAGE_LEVELS } from "@/lib/constants/jobsmarket/skills";

/**
 * Language Entry Schema
 */
const languageSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อภาษา"),
  level: z.string().min(1, "กรุณาเลือกระดับความสามารถ"),
});

/**
 * Step 4 Schema
 * Requires at least 1 skill
 * Languages are optional
 */
const step4Schema = z.object({
  skills: z.array(z.string()).min(1, "กรุณาเพิ่มอย่างน้อย 1 ทักษะ").max(50, "สามารถเพิ่มทักษะได้สูงสุด 50 รายการ"),
  languages: z.array(languageSchema).max(10, "สามารถเพิ่มภาษาได้สูงสุด 10 รายการ"),
});

export type Language = z.infer<typeof languageSchema>;
export type Step4FormData = z.infer<typeof step4Schema>;

export interface Step4SkillsProps {
  /** Initial form data (for draft resume) */
  initialData?: Partial<Step4FormData>;
  /** Callback when form is submitted */
  onSubmit: (data: Step4FormData) => void | Promise<void>;
  /** Callback to go back */
  onBack?: () => void;
  /** Show back button */
  showBackButton?: boolean;
  /** Submit button text */
  submitText?: string;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Step 4: Skills & Languages Form
 *
 * Used in CAND-R02 Profile Creation Wizard
 * Collects skills (required, ≥1) and languages (optional)
 *
 * Features:
 * - Skills: Autocomplete + custom entry
 * - Languages: Name + proficiency level
 * - Tag-based display
 */
export function Step4Skills({
  initialData,
  onSubmit,
  onBack,
  showBackButton = true,
  submitText = "ถัดไป",
  isLoading = false,
}: Step4SkillsProps) {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      skills: initialData?.skills || [],
      languages: initialData?.languages || [],
    },
  });

  const skills = watch("skills") || [];
  const languages = watch("languages") || [];

  // Skill input state
  const [skillInput, setSkillInput] = React.useState("");
  const [filteredSkills, setFilteredSkills] = React.useState<string[]>([]);

  // Language input state
  const [languageInput, setLanguageInput] = React.useState("");
  const [filteredLanguages, setFilteredLanguages] = React.useState<string[]>([]);
  const [languageLevel, setLanguageLevel] = React.useState("");

  // Filter skills based on input
  React.useEffect(() => {
    if (skillInput.trim()) {
      const filtered = COMMON_SKILLS.filter((skill) =>
        skill.toLowerCase().includes(skillInput.toLowerCase())
      ).slice(0, 10);
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills([]);
    }
  }, [skillInput]);

  // Filter languages based on input
  React.useEffect(() => {
    if (languageInput.trim()) {
      const filtered = COMMON_LANGUAGES.filter((lang) =>
        lang.toLowerCase().includes(languageInput.toLowerCase())
      ).slice(0, 10);
      setFilteredLanguages(filtered);
    } else {
      setFilteredLanguages([]);
    }
  }, [languageInput]);

  // Add skill
  const handleAddSkill = (skillName?: string) => {
    const newSkill = skillName || skillInput.trim();
    if (newSkill && !skills.includes(newSkill) && skills.length < 50) {
      setValue("skills", [...skills, newSkill]);
      setSkillInput("");
      setFilteredSkills([]);
    }
  };

  // Remove skill
  const handleRemoveSkill = (index: number) => {
    setValue(
      "skills",
      skills.filter((_, i) => i !== index)
    );
  };

  // Add language
  const handleAddLanguage = (langName?: string) => {
    const newLanguageName = langName || languageInput.trim();
    if (newLanguageName && languageLevel && languages.length < 10) {
      const exists = languages.some((lang) => lang.name === newLanguageName);
      if (!exists) {
        setValue("languages", [
          ...languages,
          {
            name: newLanguageName,
            level: languageLevel,
          },
        ]);
        setLanguageInput("");
        setLanguageLevel("");
        setFilteredLanguages([]);
      }
    }
  };

  // Remove language
  const handleRemoveLanguage = (index: number) => {
    setValue(
      "languages",
      languages.filter((_, i) => i !== index)
    );
  };

  // Handle Enter key
  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">ทักษะและภาษา</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          เพิ่มทักษะและความสามารถทางภาษาของคุณ
        </p>
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">
          ทักษะ <span className="text-destructive">*</span>
        </h3>

        {/* Skill Input */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                placeholder="พิมพ์เพื่อค้นหาหรือเพิ่มทักษะ..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                disabled={skills.length >= 50}
              />

              {/* Autocomplete Dropdown */}
              {filteredSkills.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                  {filteredSkills.map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 h-auto text-left text-sm rounded-none"
                      onClick={() => handleAddSkill(skill)}
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={() => handleAddSkill()}
              disabled={!skillInput.trim() || skills.length >= 50}
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่ม
            </Button>
          </div>
          {errors.skills && (
            <p className="text-xs text-destructive">{errors.skills.message}</p>
          )}
        </div>

        {/* Skills List */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-sm pr-1">
                {skill}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-4 w-4 p-0 hover:text-destructive hover:bg-transparent"
                  onClick={() => handleRemoveSkill(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground">
            ยังไม่มีทักษะ - เพิ่มทักษะอย่างน้อย 1 รายการ
          </p>
        )}
      </div>

      {/* Languages Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">ภาษา (ถ้ามี)</h3>

        {/* Language Input */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                placeholder="พิมพ์เพื่อค้นหาหรือเพิ่มภาษา..."
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                disabled={languages.length >= 10}
              />

              {/* Autocomplete Dropdown */}
              {filteredLanguages.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                  {filteredLanguages.map((lang) => (
                    <Button
                      key={lang}
                      type="button"
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 h-auto text-left text-sm rounded-none"
                      onClick={() => {
                        setLanguageInput(lang);
                        setFilteredLanguages([]);
                      }}
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <Select value={languageLevel} onValueChange={setLanguageLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ระดับความสามารถ" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={() => handleAddLanguage()}
              disabled={!languageInput.trim() || !languageLevel || languages.length >= 10}
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่ม
            </Button>
          </div>
        </div>

        {/* Languages List */}
        {languages.length > 0 && (
          <div className="space-y-2">
            {languages.map((lang, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{lang.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {LANGUAGE_LEVELS.find((l) => l.value === lang.level)?.label}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLanguage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {languages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            ยังไม่มีภาษา - เพิ่มภาษาที่คุณใช้ได้ (ถ้ามี)
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        {showBackButton && onBack ? (
          <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
            ย้อนกลับ
          </Button>
        ) : (
          <div />
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "กำลังบันทึก..." : submitText}
        </Button>
      </div>
    </form>
  );
}
