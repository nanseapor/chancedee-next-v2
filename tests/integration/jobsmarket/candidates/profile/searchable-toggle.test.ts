import { describe, it, expect } from "vitest";
import {
  webCandidateSetIsSearchable,
  webCandidateInformationGetById,
} from "@/lib/database/actions/candidate-information";

/**
 * CAND-R02 Batch 5A: Searchable Toggle Integration Test
 *
 * Verifies that:
 * 1. isSearchable can be toggled on/off
 * 2. Changes persist in Firestore
 * 3. Retrieved data reflects the toggle state
 */

describe("Profile Searchable Toggle", () => {
  const TEST_UID = "bywpdkLOSTWjvV8JhhQL6LNditJ3";
  const ACTOR_ID = TEST_UID;

  it("should toggle isSearchable from true to false", async () => {
    // Set to false
    await webCandidateSetIsSearchable(TEST_UID, false, ACTOR_ID);

    // Verify persisted
    const result = await webCandidateInformationGetById(TEST_UID);
    expect(result).toBeDefined();
    expect(result.isSearchable).toBe(false);
  });

  it("should toggle isSearchable from false to true", async () => {
    // Set to true
    await webCandidateSetIsSearchable(TEST_UID, true, ACTOR_ID);

    // Verify persisted
    const result = await webCandidateInformationGetById(TEST_UID);
    expect(result).toBeDefined();
    expect(result.isSearchable).toBe(true);
  });

  it("should preserve other data when toggling isSearchable", async () => {
    // Get current state
    const before = await webCandidateInformationGetById(TEST_UID);
    const originalName = before.firstnameTH;
    const originalEmail = before.email;

    // Toggle searchable
    await webCandidateSetIsSearchable(TEST_UID, !before.isSearchable, ACTOR_ID);

    // Verify other data unchanged
    const after = await webCandidateInformationGetById(TEST_UID);
    expect(after.firstnameTH).toBe(originalName);
    expect(after.email).toBe(originalEmail);
    expect(after.isSearchable).toBe(!before.isSearchable);
  });

  it("should handle multiple rapid toggles correctly", async () => {
    // Toggle multiple times
    await webCandidateSetIsSearchable(TEST_UID, true, ACTOR_ID);
    await webCandidateSetIsSearchable(TEST_UID, false, ACTOR_ID);
    await webCandidateSetIsSearchable(TEST_UID, true, ACTOR_ID);

    // Final state should be true
    const result = await webCandidateInformationGetById(TEST_UID);
    expect(result).toBeDefined();
    expect(result.isSearchable).toBe(true);
  });
});
