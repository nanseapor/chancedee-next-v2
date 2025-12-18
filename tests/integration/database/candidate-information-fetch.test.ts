import { describe, it, expect } from "vitest";

import { webCandidateInformationGetById } from "@/lib/database/actions/candidate-information";

/**
 * Integration test for Firestore candidate data fetching
 * Tests that we can fetch the test user data correctly
 *
 * This verifies:
 * 1. Firebase connection works
 * 2. Snake_case to camelCase transformation works
 * 3. Test user data structure matches expectations
 */

describe("Candidate Information Firestore Fetch", () => {
  // Test user from .env.playwright
  const TEST_CANDIDATE_UID = "bywpdkLOSTWjvV8JhhQL6LNditJ3";

  it("should fetch test candidate data with correct field transformation", async () => {
    // Fetch the actual Firestore data
    const result = await webCandidateInformationGetById(TEST_CANDIDATE_UID);

    // Verify we got data back
    expect(result).toBeDefined();
    expect(result).not.toBeNull();

    // Verify snake_case fields were transformed to camelCase
    // (Using actual values from Firestore, not hardcoded expectations)
    expect(result.firstnameTH).toBeTruthy();
    expect(result.lastnameTH).toBeTruthy();
    expect(typeof result.firstnameTH).toBe("string");
    expect(typeof result.lastnameTH).toBe("string");

    // Verify UID matches
    expect(result.uid).toBe(TEST_CANDIDATE_UID);

    // Verify nested arrays are transformed correctly
    if (result.educations) {
      expect(Array.isArray(result.educations)).toBe(true);
      // Educations in snake_case (education_level) should be transformed to camelCase (educationLevel)
      if (result.educations.length > 0) {
        expect(result.educations[0]).toHaveProperty("educationLevel");
        expect(result.educations[0]).toHaveProperty("educationLabel");
      }
    }

    if (result.works) {
      expect(Array.isArray(result.works)).toBe(true);
      // Works in snake_case (job_title) should be transformed to camelCase (jobTitle)
      if (result.works.length > 0) {
        expect(result.works[0]).toHaveProperty("jobTitle");
        expect(result.works[0]).toHaveProperty("company");
      }
    }
  });

  it("should fetch test candidate with profile completion fields", async () => {
    const result = await webCandidateInformationGetById(TEST_CANDIDATE_UID);

    expect(result).toBeDefined();

    // Verify fields used by useProfileCompletion hook
    // Identity section (15%)
    expect(result.firstnameTH).toBeTruthy();
    expect(result.lastnameTH).toBeTruthy();

    // Contact section (15%) - requires BOTH phone AND email
    expect(result.phone).toBeTruthy();
    expect(result.email).toBeTruthy();

    // About me section (10%) - requires >= 50 characters
    if (result.aboutMe) {
      expect(result.aboutMe.length).toBeGreaterThanOrEqual(50);
    }

    // Preference flag (5%)
    expect(typeof result.isPreferenceSet).toBe("boolean");

    // Onboarding flag
    expect(typeof result.isOnboarded).toBe("boolean");
    expect(result.isOnboarded).toBe(true);
  });

  it("should return data that WelcomeHeader component can use", async () => {
    const result = await webCandidateInformationGetById(TEST_CANDIDATE_UID);

    expect(result).toBeDefined();

    // WelcomeHeader expects these exact field names
    expect(result).toHaveProperty("firstnameTH");
    expect(result).toHaveProperty("lastnameTH");

    // These should be strings (not undefined, not snake_case)
    expect(typeof result.firstnameTH).toBe("string");
    expect(typeof result.lastnameTH).toBe("string");

    // Verify they have actual values (not empty)
    expect(result.firstnameTH).toBeTruthy();
    expect(result.lastnameTH).toBeTruthy();
    expect(result.firstnameTH!.length).toBeGreaterThan(0);
    expect(result.lastnameTH!.length).toBeGreaterThan(0);
  });
});
