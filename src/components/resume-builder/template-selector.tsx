"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TemplateInfo, TemplateSelectorProps } from "@/types/resume";
import { ChevronDown, FileText } from "lucide-react";

// Convert new template format to old template format
function convertToOldTemplateFormat(
  newTemplates: Record<string, any>,
): TemplateInfo[] {
  return Object.entries(newTemplates).map(([id, template]) => ({
    id,
    name: template.name,
    category: template.category,
    description: template.description,
    features: [], // Default empty features
    preview: undefined, // No preview available
  }));
}

export function TemplateSelector({
  selectedTemplate,
  onTemplateSelect,
  templates,
  disabled = false,
}: TemplateSelectorProps) {
  // Handle both old and new template formats
  const normalizedTemplates: TemplateInfo[] = Array.isArray(templates)
    ? templates
    : convertToOldTemplateFormat(templates);

  const selectedTemplateInfo = normalizedTemplates.find(
    (t: TemplateInfo) => t.id === selectedTemplate,
  );

  const freshGraduateTemplates = normalizedTemplates.filter(
    (t: TemplateInfo) => t.category === "fresh-graduate",
  );
  const professionalTemplates = normalizedTemplates.filter(
    (t: TemplateInfo) => t.category === "professional",
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={disabled}>
          <FileText className="h-4 w-4" />
          {selectedTemplateInfo ? selectedTemplateInfo.name : "เลือก Template"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>เลือก Template Resume</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Fresh Graduate Templates */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          นักศึกษาจบใหม่
        </DropdownMenuLabel>
        {freshGraduateTemplates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => onTemplateSelect(template.id)}
            className="flex flex-col items-start gap-1 p-3"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{template.name}</span>
              {selectedTemplate === template.id && (
                <Badge variant="default" className="text-xs">
                  เลือกแล้ว
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {template.description}
            </p>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Professional Templates */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          ผู้เชี่ยวชาญ
        </DropdownMenuLabel>
        {professionalTemplates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => onTemplateSelect(template.id)}
            className="flex flex-col items-start gap-1 p-3"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{template.name}</span>
              {selectedTemplate === template.id && (
                <Badge variant="default" className="text-xs">
                  เลือกแล้ว
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {template.description}
            </p>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
