/**
 * Password Strength Hook
 * Per AUTH-R02 Implementation Plan Section 3.3
 * Per BLS-01 §6 Password Validation Rules
 *
 * Provides real-time password strength validation and feedback
 */

"use client";

import { useMemo } from "react";

export interface PasswordStrength {
  score: number; // 0-4 (weak to strong)
  feedback: string[]; // Thai feedback messages
  color: "red" | "yellow" | "green";
  label: string; // Thai label
}

/**
 * Calculate password strength score
 * Based on length, character variety, and common patterns
 */
function calculatePasswordScore(password: string): number {
  if (!password) return 0;

  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 0.5; // lowercase
  if (/[A-Z]/.test(password)) score += 0.5; // uppercase
  if (/[0-9]/.test(password)) score += 0.5; // numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 0.5; // special chars

  // Bonus for good patterns
  if (password.length >= 16) score += 0.5;

  // Penalty for common patterns
  if (/^123|abc|password/i.test(password)) score -= 1;
  if (/(.)\1{2,}/.test(password)) score -= 0.5; // repeated chars

  return Math.max(0, Math.min(4, Math.round(score)));
}

/**
 * Get Thai feedback messages based on password
 */
function getPasswordFeedback(password: string): string[] {
  const feedback: string[] = [];

  if (!password) {
    return ["กรุณากรอกรหัสผ่าน"];
  }

  if (password.length < 8) {
    feedback.push("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
  }

  if (!/[a-z]/.test(password)) {
    feedback.push("ควรมีตัวพิมพ์เล็ก (a-z)");
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push("ควรมีตัวพิมพ์ใหญ่ (A-Z)");
  }

  if (!/[0-9]/.test(password)) {
    feedback.push("ควรมีตัวเลข (0-9)");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push("ควรมีอักขระพิเศษ (!@#$%^&*)");
  }

  if (/^123|abc|password/i.test(password)) {
    feedback.push("ไม่ควรใช้รหัสผ่านที่เดาง่าย");
  }

  if (/(.)\1{2,}/.test(password)) {
    feedback.push("ไม่ควรใช้ตัวอักษรซ้ำกันหลายครั้ง");
  }

  if (feedback.length === 0 && password.length >= 8) {
    feedback.push("รหัสผ่านปลอดภัย");
  }

  return feedback;
}

/**
 * Map score to color and label
 */
function getStrengthDisplay(score: number): {
  color: "red" | "yellow" | "green";
  label: string;
} {
  if (score < 2) {
    return { color: "red", label: "รหัสผ่านอ่อนแอ" };
  } else if (score < 4) {
    return { color: "yellow", label: "รหัสผ่านปานกลาง" };
  } else {
    return { color: "green", label: "รหัสผ่านแข็งแรง" };
  }
}

/**
 * Hook to calculate password strength
 */
export function usePasswordStrength(password: string): PasswordStrength {
  const strength = useMemo(() => {
    const score = calculatePasswordScore(password);
    const feedback = getPasswordFeedback(password);
    const display = getStrengthDisplay(score);

    return {
      score,
      feedback,
      color: display.color,
      label: display.label,
    };
  }, [password]);

  return strength;
}

/**
 * Validate if password meets minimum requirements
 * Per BLS-01 §6
 */
export function isPasswordValid(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

/**
 * Validate if passwords match
 */
export function doPasswordsMatch(
  password: string,
  confirmPassword: string
): boolean {
  return password === confirmPassword && password.length > 0;
}
