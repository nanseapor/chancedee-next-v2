/**
 * Integration Tests for Password Reset - Real Firebase (AUTH-R04)
 * Per AUTH-R04 Implementation Plan
 *
 * ⚠️ SKIPPED: These tests send real emails to Firebase.
 *
 * Reasons for skipping:
 * - Cannot verify email received (no email access in automated tests)
 * - Causes rate limiting after multiple runs (Firebase enforces ~5 requests/hour)
 * - Domain whitelisting requires Firebase Console configuration
 *
 * Replaced by:
 * - Unit tests with mocked Firebase (tests/unit/jobsmarket/auth/reset/password-reset.test.ts)
 * - E2E UI tests with mocked requests (tests/e2e/jobsmarket/auth/reset.spec.ts)
 * - Manual checklist for email delivery (docs/jobsmarket/MANUAL-TEST-CHECKLIST.md)
 */

import { describe, it, expect, beforeAll } from "vitest";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail, type Auth } from "firebase/auth";

describe.skip("Password Reset - Real Firebase Integration (Manual Verification Only)", () => {
  let auth: Auth;
  let app: FirebaseApp;

  // Test credentials from .env.playwright
  const testEmail = process.env.PLAYWRIGHT_TEST_CANDIDATE_EMAIL;
  const hasTestCredentials = !!testEmail;

  beforeAll(() => {
    // Initialize Firebase with real dev credentials from .env.local (loaded by setup.ts)
    if (hasTestCredentials) {
      app =
        getApps().length === 0
          ? initializeApp({
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
              authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
              messagingSenderId:
                process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
              appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            })
          : getApps()[0];

      auth = getAuth(app);
    }
  });

  describe("sendPasswordResetEmail - Real Firebase", () => {
    it.skipIf(!hasTestCredentials)(
      "should send reset email to existing user",
      async () => {
        // This actually sends an email to dev Firebase
        // Email will be sent to PLAYWRIGHT_TEST_CANDIDATE_EMAIL
        await expect(
          sendPasswordResetEmail(auth, testEmail!, {
            url: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/jobsmarket/auth/login`,
            handleCodeInApp: false,
          })
        ).resolves.not.toThrow();

        console.log(`✅ Password reset email sent to ${testEmail}`);
      }
    );

    it.skipIf(!hasTestCredentials)(
      "should handle non-existent email gracefully",
      async () => {
        const fakeEmail = `nonexistent-${Date.now()}@test-reset.example.com`;

        // Firebase will throw auth/user-not-found
        await expect(
          sendPasswordResetEmail(auth, fakeEmail)
        ).rejects.toThrow();
      }
    );

    it.skipIf(!hasTestCredentials)(
      "should reject invalid email format",
      async () => {
        const invalidEmail = "not-an-email";

        // Firebase will throw auth/invalid-email
        await expect(
          sendPasswordResetEmail(auth, invalidEmail)
        ).rejects.toThrow();
      }
    );

    it.skipIf(!hasTestCredentials)(
      "should handle rate limiting (if triggered)",
      async () => {
        // This test might trigger rate limiting if run too frequently
        // Firebase enforces ~5 reset requests per hour per email

        // Send first request - should succeed
        await expect(
          sendPasswordResetEmail(auth, testEmail!)
        ).resolves.not.toThrow();

        // Rapid subsequent requests might trigger rate limit
        // Note: This is hard to test reliably without actually triggering the limit
        // Just verify it doesn't crash
        try {
          await sendPasswordResetEmail(auth, testEmail!);
          console.log("⚠️  No rate limit triggered (normal if not testing rapidly)");
        } catch (error: any) {
          if (error.code === "auth/too-many-requests") {
            console.log("✅ Rate limit correctly enforced by Firebase");
            expect(error.code).toBe("auth/too-many-requests");
          } else {
            // Some other error - that's fine for this test
            console.log(`ℹ️  Got error: ${error.code || error.message}`);
          }
        }
      }
    );
  });

  describe("Error code mapping verification", () => {
    it.skipIf(!hasTestCredentials)(
      "should produce correct Firebase error codes",
      async () => {
        // Test invalid email error code
        try {
          await sendPasswordResetEmail(auth, "invalid-email");
          expect.fail("Should have thrown error");
        } catch (error: any) {
          expect(error.code).toBe("auth/invalid-email");
        }

        // Test user-not-found error code
        try {
          await sendPasswordResetEmail(
            auth,
            `nonexistent-${Date.now()}@test.example.com`
          );
          expect.fail("Should have thrown error");
        } catch (error: any) {
          expect(error.code).toBe("auth/user-not-found");
        }
      }
    );
  });

  describe("actionCodeSettings configuration", () => {
    it.skipIf(!hasTestCredentials)(
      "should accept redirect URL configuration",
      async () => {
        // Use whitelisted domain from env (production or vercel URL)
        // localhost may not be whitelisted in Firebase
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
        const actionCodeSettings = {
          url: `${baseUrl}/jobsmarket/auth/login`,
          handleCodeInApp: false,
        };

        // Should not throw with valid actionCodeSettings from whitelisted domain
        await expect(
          sendPasswordResetEmail(auth, testEmail!, actionCodeSettings)
        ).resolves.not.toThrow();
      }
    );

    it.skipIf(!hasTestCredentials)(
      "should work without actionCodeSettings (uses default)",
      async () => {
        // Firebase allows calling without actionCodeSettings
        await expect(
          sendPasswordResetEmail(auth, testEmail!)
        ).resolves.not.toThrow();
      }
    );
  });
});
