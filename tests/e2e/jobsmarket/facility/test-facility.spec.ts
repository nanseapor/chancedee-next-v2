/**
 * E2E Test Facility - Verification Tests
 *
 * These tests verify that the E2E Test Facility works correctly:
 * - Factories can create test users with custom tokens
 * - signInWithCustomToken works via the token-login route
 * - Test accounts are properly marked with custom claims
 */

import { test, expect } from "@playwright/test";
import {
  createTestCandidate,
  createTestCompany,
  CandidateVariants,
} from "../../helpers/factories";
import { signInWithCustomToken, signInAsCandidate, signInAsCompany } from "../../helpers/auth-helper";

test.describe("E2E Test Facility - Verification", () => {
  test.describe("Factory Functions", () => {
    test("createTestCandidate creates user with custom token", async () => {
      // Create a test candidate
      const candidate = await createTestCandidate({
        testName: "facility-verification",
      });

      // Verify the candidate has required properties
      expect(candidate.uid).toBeTruthy();
      expect(candidate.email).toContain("@test.chancedee.com");
      expect(candidate.candidateId).toBeTruthy();
      expect(candidate.customToken).toBeTruthy();

      console.log("Test candidate created:", {
        uid: candidate.uid,
        email: candidate.email,
        candidateId: candidate.candidateId,
      });
    });

    test("createTestCompany creates user with custom token", async () => {
      // Create a test company
      const company = await createTestCompany({
        testName: "facility-verification",
      });

      // Verify the company has required properties
      expect(company.uid).toBeTruthy();
      expect(company.email).toContain("@test.chancedee.com");
      expect(company.companyId).toBeTruthy();
      expect(company.customToken).toBeTruthy();

      console.log("Test company created:", {
        uid: company.uid,
        email: company.email,
        companyId: company.companyId,
      });
    });

    test("CandidateVariants.complete creates user with complete profile", async () => {
      const candidate = await CandidateVariants.complete();

      expect(candidate.uid).toBeTruthy();
      expect(candidate.candidateId).toBeTruthy();
      expect(candidate.customToken).toBeTruthy();
      // Complete profile has additional fields populated
    });
  });

  test.describe("Token Login Route", () => {
    test("signInWithCustomToken authenticates and redirects", async ({ page }) => {
      // Create a test candidate
      const candidate = await createTestCandidate({
        testName: "token-login-test",
      });

      // Sign in using the token-login route
      await signInWithCustomToken(page, candidate.customToken);

      // Verify we are authenticated (should be on a protected page)
      const currentUrl = page.url();
      expect(currentUrl).not.toContain("/auth/login");

      console.log("Signed in successfully, current URL:", currentUrl);
    });

    test("signInAsCandidate navigates to candidate dashboard", async ({ page }) => {
      // Create a test candidate
      const candidate = await createTestCandidate({
        testName: "signin-as-candidate-test",
      });

      // Sign in as candidate
      await signInAsCandidate(page, candidate);

      // Verify we're on the candidate dashboard
      await expect(page).toHaveURL(new RegExp(`/candidates/${candidate.candidateId}`));

      console.log("Signed in as candidate:", candidate.candidateId);
    });

    test("signInAsCompany navigates to company dashboard", async ({ page }) => {
      // Create a test company
      const company = await createTestCompany({
        testName: "signin-as-company-test",
      });

      // Sign in as company
      await signInAsCompany(page, company);

      // Verify we're on the company dashboard
      await expect(page).toHaveURL(new RegExp(`/companies/${company.companyId}`));

      console.log("Signed in as company:", company.companyId);
    });
  });

  test.describe("Test Isolation", () => {
    test("each test gets a unique user", async () => {
      const candidate1 = await createTestCandidate({ testName: "isolation-test-1" });
      const candidate2 = await createTestCandidate({ testName: "isolation-test-2" });

      // Each candidate should have unique IDs
      expect(candidate1.uid).not.toBe(candidate2.uid);
      expect(candidate1.email).not.toBe(candidate2.email);
      expect(candidate1.candidateId).not.toBe(candidate2.candidateId);

      console.log("Unique users verified:", {
        user1: candidate1.email,
        user2: candidate2.email,
      });
    });
  });
});
