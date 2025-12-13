/**
 * Password Strength Meter Component
 * Per AUTH-R02 Implementation Plan Section 2 (Shared Components)
 * Per BLS-01 §6 Password Validation Rules
 *
 * Visual indicator showing password strength with feedback
 * Used by: AUTH-R02 (register), AUTH-R03 (change password), AUTH-R06 (settings)
 */

"use client";

import { usePasswordStrength } from "@/hooks/jobsmarket/use-password-strength";

export interface PasswordStrengthMeterProps {
  /** Password to evaluate */
  password: string;
  /** Optional class name */
  className?: string;
}

/**
 * Password Strength Meter
 * Shows color-coded strength bar and feedback messages
 */
export function PasswordStrengthMeter({
  password,
  className = "",
}: PasswordStrengthMeterProps) {
  const strength = usePasswordStrength(password);

  // Don't show meter if no password entered
  if (!password) {
    return null;
  }

  // Calculate bar width based on score (0-4 → 0%-100%)
  const barWidth = `${(strength.score / 4) * 100}%`;

  // Map color to Tailwind classes
  const colorClasses = {
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
  };

  const textColorClasses = {
    red: "text-red-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            ความแข็งแรงของรหัสผ่าน
          </span>
          <span
            className={`text-sm font-medium ${textColorClasses[strength.color]}`}
          >
            {strength.label}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${colorClasses[strength.color]}`}
            style={{ width: barWidth }}
          />
        </div>
      </div>

      {/* Feedback Messages */}
      <ul className="space-y-1 text-sm text-gray-600">
        {strength.feedback.map((message, index) => (
          <li key={index} className="flex items-start gap-2">
            <span
              className={`mt-1 ${
                message === "รหัสผ่านปลอดภัย"
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
            >
              {message === "รหัสผ่านปลอดภัย" ? "✓" : "•"}
            </span>
            <span>{message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
