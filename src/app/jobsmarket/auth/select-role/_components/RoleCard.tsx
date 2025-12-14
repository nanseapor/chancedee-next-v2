"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  role: "candidate" | "company";
  title: string; // Thai title (ผู้หางาน or company name)
  subtitle: string; // English subtitle
  icon: React.ReactNode; // Lucide icon
  features: string[]; // Bullet list (3 items)
  onSelect: () => void;
  disabled?: boolean;
}

export function RoleCard({
  title,
  subtitle,
  icon,
  features,
  onSelect,
  disabled,
}: RoleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      className={cn(
        "w-full md:w-80 p-8 rounded-lg border-2 cursor-pointer transition-all",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isHovered
          ? "bg-gray-50 border-primary shadow-md"
          : "bg-white border-gray-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={disabled ? undefined : onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`เลือกบทบาท ${title}`}
    >
      {/* Icon */}
      <div className="flex justify-center mb-4">{icon}</div>

      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Features */}
      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-gray-400">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* Button */}
      <Button
        className="w-full"
        variant={isHovered ? "default" : "outline"}
        disabled={disabled}
        type="button"
      >
        เข้าใช้งาน
      </Button>
    </div>
  );
}
