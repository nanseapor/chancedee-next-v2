import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";

import {
  useProfileCompletion,
  formatCompletionPercentage,
  getCompletionColor,
  type CandidateProfileData,
} from "@/hooks/jobsmarket/use-profile-completion";

/**
 * Unit tests for use ProfileCompletion hook
 * Per CAND-R01 RIS Appendix C
 *
 * Tests profile completion calculation with weighted sections:
 * - Identity: 15%
 * - Contact: 15%
 * - Photo: 10%
 * - Work Experience: 20%
 * - Education: 15%
 * - About Me: 10%
 * - Area of Expertise: 10%
 * - Preferences: 5%
 *
 * Coverage Target: 95%+
 */

describe("useProfileCompletion", () => {
  describe("Null/Undefined Profile Handling", () => {
    it("should return 0% for null profile", () => {
      const { result } = renderHook(() => useProfileCompletion(null));

      expect(result.current.percentage).toBe(0);
      expect(result.current.missingSections).toEqual([]);
    });

    it("should return 0% for undefined profile", () => {
      const { result } = renderHook(() => useProfileCompletion(undefined));

      expect(result.current.percentage).toBe(0);
      expect(result.current.missingSections).toEqual([]);
    });
  });

  describe("Empty Profile", () => {
    it("should return 0% for empty profile", () => {
      const emptyProfile: CandidateProfileData = {
        uid: "user123",
      };

      const { result } = renderHook(() =>
        useProfileCompletion(emptyProfile)
      );

      expect(result.current.percentage).toBe(0);
      expect(result.current.missingSections).toHaveLength(3); // Top 3 missing
    });

    it("should identify all missing sections in correct priority order", () => {
      const emptyProfile: CandidateProfileData = {
        uid: "user123",
      };

      const { result } = renderHook(() =>
        useProfileCompletion(emptyProfile)
      );

      const sections = result.current.missingSections;

      // Should return top 3: identity (priority 1), contact (priority 2), photo (priority 3)
      expect(sections[0].key).toBe("identity");
      expect(sections[0].priority).toBe(1);
      expect(sections[0].label_th).toBe("ข้อมูลส่วนตัว");
      expect(sections[0].label_en).toBe("Personal Info");
      expect(sections[0].tab).toBe("personal");

      expect(sections[1].key).toBe("contact");
      expect(sections[1].priority).toBe(2);

      expect(sections[2].key).toBe("photo");
      expect(sections[2].priority).toBe(3);
    });
  });

  describe("Complete Profile", () => {
    it("should return 100% for fully completed profile", () => {
      const completeProfile: CandidateProfileData = {
        uid: "user123",
        first_name_th: "สมชาย",
        last_name_th: "ใจดี",
        phone_number: "0812345678",
        email: "somchai@example.com",
        avatar_url: "https://example.com/avatar.jpg",
        works: [{ company: "ABC Corp" }],
        educations: [{ degree: "Bachelor" }],
        about_me:
          "Experienced software developer with 5 years in web development",
        area_of_expertise: "Full Stack Development",
        is_preference_set: true,
      };

      const { result } = renderHook(() =>
        useProfileCompletion(completeProfile)
      );

      expect(result.current.percentage).toBe(100);
      expect(result.current.missingSections).toHaveLength(0);
    });
  });

  describe("Partial Profile Completion", () => {
    it("should calculate 30% for identity + contact only", () => {
      const profile: CandidateProfileData = {
        uid: "user123",
        first_name_th: "สมชาย",
        last_name_th: "ใจดี",
        phone_number: "0812345678",
        email: "somchai@example.com",
      };

      const { result } = renderHook(() => useProfileCompletion(profile));

      // Identity (15%) + Contact (15%) = 30%
      expect(result.current.percentage).toBe(30);
      expect(result.current.missingSections).toHaveLength(3);
    });

    it("should calculate 70% for most fields except preferences", () => {
      const profile: CandidateProfileData = {
        uid: "user123",
        first_name_th: "สมชาย", // 15%
        last_name_th: "ใจดี",
        phone_number: "0812345678", // 15%
        email: "somchai@example.com",
        avatar_url: "https://example.com/avatar.jpg", // 10%
        works: [{ company: "ABC" }], // 20%
        educations: [{ degree: "Bachelor" }], // 15%
        about_me: "This is my bio with more than 50 characters to meet requirement", // 10%
        area_of_expertise: "Development", // 10%
        // Missing preferences (5%)
      };

      const { result } = renderHook(() => useProfileCompletion(profile));

      expect(result.current.percentage).toBe(95);
      expect(result.current.missingSections).toHaveLength(1);
      expect(result.current.missingSections[0].key).toBe("preferences");
    });
  });

  describe("Field Validation Rules", () => {
    it("should require BOTH first_name_th AND last_name_th for identity", () => {
      const profile1: CandidateProfileData = {
        uid: "user123",
        first_name_th: "สมชาย",
        // Missing last_name_th
      };

      const { result: result1 } = renderHook(() =>
        useProfileCompletion(profile1)
      );
      expect(result1.current.percentage).toBe(0);

      const profile2: CandidateProfileData = {
        uid: "user123",
        last_name_th: "ใจดี",
        // Missing first_name_th
      };

      const { result: result2 } = renderHook(() =>
        useProfileCompletion(profile2)
      );
      expect(result2.current.percentage).toBe(0);
    });

    it("should require BOTH phone_number AND email for contact", () => {
      const profile1: CandidateProfileData = {
        uid: "user123",
        phone_number: "0812345678",
        // Missing email
      };

      const { result: result1 } = renderHook(() =>
        useProfileCompletion(profile1)
      );
      expect(result1.current.percentage).toBe(0);

      const profile2: CandidateProfileData = {
        uid: "user123",
        email: "test@example.com",
        // Missing phone_number
      };

      const { result: result2 } = renderHook(() =>
        useProfileCompletion(profile2)
      );
      expect(result2.current.percentage).toBe(0);
    });

    it("should accept EITHER avatar_url OR photo_url for photo", () => {
      const profile1: CandidateProfileData = {
        uid: "user123",
        avatar_url: "https://example.com/avatar.jpg",
      };

      const { result: result1 } = renderHook(() =>
        useProfileCompletion(profile1)
      );
      expect(result1.current.percentage).toBe(10); // Only photo

      const profile2: CandidateProfileData = {
        uid: "user123",
        photo_url: "https://example.com/photo.jpg",
      };

      const { result: result2 } = renderHook(() =>
        useProfileCompletion(profile2)
      );
      expect(result2.current.percentage).toBe(10); // Only photo
    });

    it("should accept fresh graduate flag OR work experience for work section", () => {
      const profile1: CandidateProfileData = {
        uid: "user123",
        is_fresh_graduate: true,
      };

      const { result: result1 } = renderHook(() =>
        useProfileCompletion(profile1)
      );
      expect(result1.current.percentage).toBe(20); // Work experience

      const profile2: CandidateProfileData = {
        uid: "user123",
        works: [{ company: "ABC" }],
      };

      const { result: result2 } = renderHook(() =>
        useProfileCompletion(profile2)
      );
      expect(result2.current.percentage).toBe(20); // Work experience
    });

    it("should require at least 50 characters for about_me", () => {
      const profile1: CandidateProfileData = {
        uid: "user123",
        about_me: "Short bio", // Less than 50 chars
      };

      const { result: result1 } = renderHook(() =>
        useProfileCompletion(profile1)
      );
      expect(result1.current.percentage).toBe(0);

      // Exactly 50 characters
      const profile2: CandidateProfileData = {
        uid: "user123",
        about_me: "12345678901234567890123456789012345678901234567890", // Exactly 50
      };

      const { result: result2 } = renderHook(() =>
        useProfileCompletion(profile2)
      );
      expect(result2.current.percentage).toBe(10); // About me

      const profile3: CandidateProfileData = {
        uid: "user123",
        about_me:
          "This is an even longer bio with more than 50 characters to pass the test", // More than 50
      };

      const { result: result3 } = renderHook(() =>
        useProfileCompletion(profile3)
      );
      expect(result3.current.percentage).toBe(10); // About me
    });

    it("should require non-empty education array", () => {
      const profile1: CandidateProfileData = {
        uid: "user123",
        educations: [],
      };

      const { result: result1 } = renderHook(() =>
        useProfileCompletion(profile1)
      );
      expect(result1.current.percentage).toBe(0);

      const profile2: CandidateProfileData = {
        uid: "user123",
        educations: [{ degree: "Bachelor" }],
      };

      const { result: result2 } = renderHook(() =>
        useProfileCompletion(profile2)
      );
      expect(result2.current.percentage).toBe(15); // Education
    });
  });

  describe("Missing Sections Priority", () => {
    it("should return only top 3 missing sections even when more are missing", () => {
      const profile: CandidateProfileData = {
        uid: "user123",
        // All fields missing except one
        first_name_th: "สมชาย",
        last_name_th: "ใจดี",
      };

      const { result } = renderHook(() => useProfileCompletion(profile));

      // Should have many missing sections, but only return top 3
      expect(result.current.missingSections).toHaveLength(3);

      // Should be sorted by priority
      expect(result.current.missingSections[0].priority).toBeLessThan(
        result.current.missingSections[1].priority
      );
      expect(result.current.missingSections[1].priority).toBeLessThan(
        result.current.missingSections[2].priority
      );
    });

    it("should return less than 3 sections if only 1-2 are missing", () => {
      const profile: CandidateProfileData = {
        uid: "user123",
        first_name_th: "สมชาย",
        last_name_th: "ใจดี",
        phone_number: "0812345678",
        email: "somchai@example.com",
        avatar_url: "https://example.com/avatar.jpg",
        works: [{ company: "ABC" }],
        educations: [{ degree: "Bachelor" }],
        about_me: "Bio with more than 50 characters for the about me section",
        area_of_expertise: "Development",
        // Missing only preferences (1 section)
      };

      const { result } = renderHook(() => useProfileCompletion(profile));

      expect(result.current.missingSections).toHaveLength(1);
      expect(result.current.missingSections[0].key).toBe("preferences");
    });
  });

  describe("Memoization", () => {
    it("should memoize result and not recalculate if profile doesn't change", () => {
      const profile: CandidateProfileData = {
        uid: "user123",
        first_name_th: "สมชาย",
        last_name_th: "ใจดี",
      };

      const { result, rerender } = renderHook(
        ({ prof }) => useProfileCompletion(prof),
        { initialProps: { prof: profile } }
      );

      const firstResult = result.current;

      // Re-render with same profile reference
      rerender({ prof: profile });

      // Should return exact same object (memoized)
      expect(result.current).toBe(firstResult);
    });

    it("should recalculate when profile object changes", () => {
      const profile1: CandidateProfileData = {
        uid: "user123",
        first_name_th: "สมชาย",
        last_name_th: "ใจดี",
      };

      const { result, rerender } = renderHook(
        ({ prof }) => useProfileCompletion(prof),
        { initialProps: { prof: profile1 } }
      );

      const firstResult = result.current;
      expect(firstResult.percentage).toBe(15);

      // Re-render with different profile
      const profile2: CandidateProfileData = {
        uid: "user123",
        first_name_th: "สมชาย",
        last_name_th: "ใจดี",
        phone_number: "0812345678",
        email: "test@example.com",
      };

      rerender({ prof: profile2 });

      // Should recalculate (not same object)
      expect(result.current).not.toBe(firstResult);
      expect(result.current.percentage).toBe(30);
    });
  });
});

describe("formatCompletionPercentage", () => {
  it("should format percentage with % symbol", () => {
    expect(formatCompletionPercentage(0)).toBe("0%");
    expect(formatCompletionPercentage(50)).toBe("50%");
    expect(formatCompletionPercentage(100)).toBe("100%");
  });

  it("should round decimal percentages", () => {
    expect(formatCompletionPercentage(47.3)).toBe("47%");
    expect(formatCompletionPercentage(47.5)).toBe("48%");
    expect(formatCompletionPercentage(47.8)).toBe("48%");
  });
});

describe("getCompletionColor", () => {
  it("should return green for 100%", () => {
    expect(getCompletionColor(100)).toBe("text-green-500");
  });

  it("should return secondary (orange) for 70-99%", () => {
    expect(getCompletionColor(70)).toBe("text-secondary-500");
    expect(getCompletionColor(85)).toBe("text-secondary-500");
    expect(getCompletionColor(99)).toBe("text-secondary-500");
  });

  it("should return yellow for 40-69%", () => {
    expect(getCompletionColor(40)).toBe("text-yellow-500");
    expect(getCompletionColor(50)).toBe("text-yellow-500");
    expect(getCompletionColor(69)).toBe("text-yellow-500");
  });

  it("should return gray for <40%", () => {
    expect(getCompletionColor(0)).toBe("text-gray-400");
    expect(getCompletionColor(20)).toBe("text-gray-400");
    expect(getCompletionColor(39)).toBe("text-gray-400");
  });
});
