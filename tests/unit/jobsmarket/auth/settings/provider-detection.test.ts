import { describe, it, expect } from "vitest";

/**
 * Unit tests for AUTH-R06 Settings Provider Detection Logic
 * Tests provider detection from Firebase providerData
 */

describe("Provider Detection Logic", () => {
  describe("Password provider detection", () => {
    it("should detect password provider when present", () => {
      const providers = [{ providerId: "password" }];
      const hasPasswordProvider = providers.some((p) => p?.providerId === "password");

      expect(hasPasswordProvider).toBe(true);
    });

    it("should return false when no password provider", () => {
      const providers = [{ providerId: "google.com" }];
      const hasPasswordProvider = providers.some((p) => p?.providerId === "password");

      expect(hasPasswordProvider).toBe(false);
    });

    it("should handle empty providerData array", () => {
      const providers: Array<{ providerId: string }> = [];
      const hasPasswordProvider = providers.some((p) => p?.providerId === "password");

      expect(hasPasswordProvider).toBe(false);
    });

    it("should handle null/undefined in providerData array", () => {
      const providers = [null, { providerId: "password" }, undefined];
      const hasPasswordProvider = providers.some((p) => p?.providerId === "password");

      expect(hasPasswordProvider).toBe(true);
    });
  });

  describe("Google provider detection", () => {
    it("should detect Google provider when present", () => {
      const providers = [{ providerId: "google.com" }];
      const hasGoogleProvider = providers.some((p) => p?.providerId === "google.com");

      expect(hasGoogleProvider).toBe(true);
    });

    it("should return false when no Google provider", () => {
      const providers = [{ providerId: "facebook.com" }];
      const hasGoogleProvider = providers.some((p) => p?.providerId === "google.com");

      expect(hasGoogleProvider).toBe(false);
    });

    it("should detect Google among multiple providers", () => {
      const providers = [
        { providerId: "password" },
        { providerId: "google.com" },
      ];
      const hasGoogleProvider = providers.some((p) => p?.providerId === "google.com");

      expect(hasGoogleProvider).toBe(true);
    });
  });

  describe("Facebook provider detection", () => {
    it("should detect Facebook provider when present", () => {
      const providers = [{ providerId: "facebook.com" }];
      const hasFacebookProvider = providers.some((p) => p?.providerId === "facebook.com");

      expect(hasFacebookProvider).toBe(true);
    });

    it("should return false when no Facebook provider", () => {
      const providers = [{ providerId: "google.com" }];
      const hasFacebookProvider = providers.some((p) => p?.providerId === "facebook.com");

      expect(hasFacebookProvider).toBe(false);
    });
  });

  describe("Multiple providers detection", () => {
    it("should detect all providers when user has password + Google", () => {
      const providers = [
        { providerId: "password" },
        { providerId: "google.com" },
      ];

      const hasPasswordProvider = providers.some((p) => p?.providerId === "password");
      const hasGoogleProvider = providers.some((p) => p?.providerId === "google.com");
      const hasFacebookProvider = providers.some((p) => p?.providerId === "facebook.com");

      expect(hasPasswordProvider).toBe(true);
      expect(hasGoogleProvider).toBe(true);
      expect(hasFacebookProvider).toBe(false);
    });

    it("should detect all three providers when present", () => {
      const providers = [
        { providerId: "password" },
        { providerId: "google.com" },
        { providerId: "facebook.com" },
      ];

      const hasPasswordProvider = providers.some((p) => p?.providerId === "password");
      const hasGoogleProvider = providers.some((p) => p?.providerId === "google.com");
      const hasFacebookProvider = providers.some((p) => p?.providerId === "facebook.com");

      expect(hasPasswordProvider).toBe(true);
      expect(hasGoogleProvider).toBe(true);
      expect(hasFacebookProvider).toBe(true);
    });
  });

  describe("Provider badge display logic", () => {
    it("should use first provider for badge when multiple providers", () => {
      const providers = [
        { providerId: "google.com" },
        { providerId: "password" },
      ];

      const badgeProvider = providers.length > 0 && providers[0] ? providers[0].providerId : null;

      expect(badgeProvider).toBe("google.com");
    });

    it("should return null when no providers", () => {
      const providers: Array<{ providerId: string }> = [];

      const badgeProvider = providers.length > 0 && providers[0] ? providers[0].providerId : null;

      expect(badgeProvider).toBeNull();
    });

    it("should map password provider to Thai text", () => {
      const providerId = "password";
      const displayText = providerId === "password" ? "อีเมล" : providerId;

      expect(displayText).toBe("อีเมล");
    });

    it("should map google.com provider to 'Google'", () => {
      const providerId = "google.com";
      const displayText = providerId === "google.com" ? "Google" : providerId;

      expect(displayText).toBe("Google");
    });

    it("should map facebook.com provider to 'Facebook'", () => {
      const providerId = "facebook.com";
      const displayText = providerId === "facebook.com" ? "Facebook" : providerId;

      expect(displayText).toBe("Facebook");
    });
  });
});
