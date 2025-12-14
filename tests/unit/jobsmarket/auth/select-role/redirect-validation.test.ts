import { describe, it, expect } from "vitest";

/**
 * Unit tests for AUTH-R07 Redirect URL Validation
 * Tests the isValidRedirect function logic
 */

/**
 * Validate redirect URL is safe and role-appropriate
 * Per RIS §9.1
 */
function isValidRedirect(url: string, role: "candidate" | "company"): boolean {
  // Must be internal URL
  if (!url.startsWith("/")) return false;

  // Must start with /jobsmarket
  if (!url.startsWith("/jobsmarket/")) return false;

  // Role-appropriate paths
  if (role === "candidate") {
    return /^\/jobsmarket\/(candidates\/|jobs\/|chat|notifications)/.test(url);
  }

  if (role === "company") {
    return /^\/jobsmarket\/(companies\/|chat|notifications)/.test(url);
  }

  return false;
}

describe("Redirect URL Validation", () => {
  describe("Candidate role redirects", () => {
    it("should allow candidates/ paths", () => {
      expect(isValidRedirect("/jobsmarket/candidates/123", "candidate")).toBe(true);
      expect(isValidRedirect("/jobsmarket/candidates/456/profile", "candidate")).toBe(true);
    });

    it("should allow jobs/ paths", () => {
      expect(isValidRedirect("/jobsmarket/jobs/123", "candidate")).toBe(true);
      expect(isValidRedirect("/jobsmarket/jobs/456/apply", "candidate")).toBe(true);
    });

    it("should allow chat path", () => {
      expect(isValidRedirect("/jobsmarket/chat", "candidate")).toBe(true);
      expect(isValidRedirect("/jobsmarket/chat/123", "candidate")).toBe(true);
    });

    it("should allow notifications path", () => {
      expect(isValidRedirect("/jobsmarket/notifications", "candidate")).toBe(true);
    });

    it("should reject companies/ paths for candidate", () => {
      expect(isValidRedirect("/jobsmarket/companies/123", "candidate")).toBe(false);
      expect(isValidRedirect("/jobsmarket/companies/123/dashboard", "candidate")).toBe(false);
    });

    it("should reject other jobsmarket paths for candidate", () => {
      expect(isValidRedirect("/jobsmarket/auth/login", "candidate")).toBe(false);
      expect(isValidRedirect("/jobsmarket/settings", "candidate")).toBe(false);
    });
  });

  describe("Company role redirects", () => {
    it("should allow companies/ paths", () => {
      expect(isValidRedirect("/jobsmarket/companies/123", "company")).toBe(true);
      expect(isValidRedirect("/jobsmarket/companies/456/dashboard", "company")).toBe(true);
    });

    it("should allow chat path", () => {
      expect(isValidRedirect("/jobsmarket/chat", "company")).toBe(true);
      expect(isValidRedirect("/jobsmarket/chat/789", "company")).toBe(true);
    });

    it("should allow notifications path", () => {
      expect(isValidRedirect("/jobsmarket/notifications", "company")).toBe(true);
    });

    it("should reject candidates/ paths for company", () => {
      expect(isValidRedirect("/jobsmarket/candidates/123", "company")).toBe(false);
    });

    it("should reject jobs/ paths for company", () => {
      expect(isValidRedirect("/jobsmarket/jobs/123", "company")).toBe(false);
    });

    it("should reject other jobsmarket paths for company", () => {
      expect(isValidRedirect("/jobsmarket/auth/login", "company")).toBe(false);
    });
  });

  describe("Invalid URLs", () => {
    it("should reject external URLs", () => {
      expect(isValidRedirect("https://evil.com", "candidate")).toBe(false);
      expect(isValidRedirect("http://example.com", "candidate")).toBe(false);
      expect(isValidRedirect("//evil.com", "candidate")).toBe(false);
    });

    it("should reject non-jobsmarket internal paths", () => {
      expect(isValidRedirect("/auth/login", "candidate")).toBe(false);
      expect(isValidRedirect("/content/blog", "candidate")).toBe(false);
      expect(isValidRedirect("/platform/dashboard", "candidate")).toBe(false);
    });

    it("should reject relative URLs without leading slash", () => {
      expect(isValidRedirect("jobsmarket/candidates/123", "candidate")).toBe(false);
      expect(isValidRedirect("../jobsmarket/jobs/123", "candidate")).toBe(false);
    });

    it("should reject empty string", () => {
      expect(isValidRedirect("", "candidate")).toBe(false);
      expect(isValidRedirect("", "company")).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle URL with query params", () => {
      expect(isValidRedirect("/jobsmarket/jobs/123?ref=search", "candidate")).toBe(true);
      expect(isValidRedirect("/jobsmarket/companies/456?tab=jobs", "company")).toBe(true);
    });

    it("should handle URL with hash", () => {
      expect(isValidRedirect("/jobsmarket/candidates/123#profile", "candidate")).toBe(true);
    });

    it("should be case-sensitive for /jobsmarket", () => {
      expect(isValidRedirect("/Jobsmarket/jobs/123", "candidate")).toBe(false);
      expect(isValidRedirect("/JOBSMARKET/companies/123", "company")).toBe(false);
    });
  });
});
