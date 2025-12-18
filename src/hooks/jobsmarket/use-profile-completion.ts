"use client";

import { useMemo } from "react";

/**
 * Profile completion calculation hook
 * Per CAND-R01 RIS Appendix C
 *
 * Calculates profile completion percentage based on required fields
 * across multiple sections.
 */

export interface MissingSection {
  key: string;
  label_th: string;
  label_en: string;
  tab: string; // Profile tab to navigate to
  priority: number;
}

export interface ProfileCompletion {
  percentage: number;
  missingSections: MissingSection[];
}

export interface CandidateProfileData {
  // Unique identifier
  uid: string;
  walletId?: string; // Wallet reference

  // Identity
  first_name_th?: string;
  last_name_th?: string;

  // Contact
  phone_number?: string;
  email?: string;

  // Photo
  avatar_url?: string;
  photo_url?: string; // Alternative field name

  // Work Experience
  works?: unknown[];
  is_fresh_graduate?: boolean;

  // Education
  educations?: unknown[];

  // About Me
  about_me?: string;

  // Area of Expertise
  area_of_expertise?: string;

  // Preferences
  is_preference_set?: boolean;

  // Documents
  documents?: unknown[];
}

/**
 * Calculate profile completion percentage
 *
 * Weights (must sum to 100%):
 * - Identity: 15%
 * - Contact: 15%
 * - Photo: 10%
 * - Work Experience: 20%
 * - Education: 15%
 * - About Me: 10%
 * - Area of Expertise: 10%
 * - Preferences: 5%
 *
 * @param profile - Candidate profile data
 * @returns Completion percentage and top 3 missing sections
 */
export function useProfileCompletion(
  profile: CandidateProfileData | null | undefined
): ProfileCompletion {
  return useMemo(() => {
    if (!profile) {
      return {
        percentage: 0,
        missingSections: [],
      };
    }

    let score = 0;
    const missing: MissingSection[] = [];

    // Identity (15%)
    if (profile.first_name_th && profile.last_name_th) {
      score += 15;
    } else {
      missing.push({
        key: "identity",
        label_th: "ข้อมูลส่วนตัว",
        label_en: "Personal Info",
        tab: "personal",
        priority: 1,
      });
    }

    // Contact (15%)
    if (profile.phone_number && profile.email) {
      score += 15;
    } else {
      missing.push({
        key: "contact",
        label_th: "ข้อมูลติดต่อ",
        label_en: "Contact Info",
        tab: "personal",
        priority: 2,
      });
    }

    // Photo (10%)
    const hasPhoto = profile.avatar_url || profile.photo_url;
    if (hasPhoto) {
      score += 10;
    } else {
      missing.push({
        key: "photo",
        label_th: "รูปโปรไฟล์",
        label_en: "Profile Photo",
        tab: "personal",
        priority: 3,
      });
    }

    // Work Experience (20%)
    const hasWork =
      profile.is_fresh_graduate ||
      (profile.works && profile.works.length > 0);
    if (hasWork) {
      score += 20;
    } else {
      missing.push({
        key: "work",
        label_th: "ประสบการณ์ทำงาน",
        label_en: "Work Experience",
        tab: "resume",
        priority: 4,
      });
    }

    // Education (15%)
    if (profile.educations && profile.educations.length > 0) {
      score += 15;
    } else {
      missing.push({
        key: "education",
        label_th: "ประวัติการศึกษา",
        label_en: "Education",
        tab: "resume",
        priority: 5,
      });
    }

    // About Me (10%)
    if (profile.about_me && profile.about_me.length >= 50) {
      score += 10;
    } else {
      missing.push({
        key: "about",
        label_th: "เกี่ยวกับฉัน",
        label_en: "About Me",
        tab: "resume",
        priority: 6,
      });
    }

    // Area of Expertise (10%)
    if (profile.area_of_expertise) {
      score += 10;
    } else {
      missing.push({
        key: "expertise",
        label_th: "ความเชี่ยวชาญ",
        label_en: "Expertise",
        tab: "resume",
        priority: 7,
      });
    }

    // Preferences (5%)
    if (profile.is_preference_set) {
      score += 5;
    } else {
      missing.push({
        key: "preferences",
        label_th: "ความต้องการงาน",
        label_en: "Job Preferences",
        tab: "preferences",
        priority: 8,
      });
    }

    return {
      percentage: score,
      missingSections: missing
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 3), // Top 3 missing sections
    };
  }, [profile]);
}

/**
 * Utility function to format completion percentage for display
 * @param percentage - Completion percentage (0-100)
 * @returns Formatted string like "85%"
 */
export function formatCompletionPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

/**
 * Utility function to determine progress ring color
 * @param percentage - Completion percentage (0-100)
 * @returns Tailwind color class
 */
export function getCompletionColor(percentage: number): string {
  if (percentage === 100) return "text-green-500";
  if (percentage >= 70) return "text-secondary-500"; // Orange
  if (percentage >= 40) return "text-yellow-500";
  return "text-gray-400";
}
