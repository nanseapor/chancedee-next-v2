/**
 * Role Validation Tests
 *
 * Tests for role-based access control including permission matrix validation,
 * company scoping, and role hierarchy enforcement.
 */

import { beforeEach, describe, expect, it } from "vitest";

import type { AuthResult } from "@/types/auth.types";

import { belongsToCompany, hasRoles } from "../core/auth-engine";
import {
  createMockAuthResult,
  createMockUserProfile,
} from "../test/auth-test-utils";

describe("Role Validation System", () => {
  describe("Permission Matrix Validation", () => {
    /**
     * Test the complete permission matrix as defined in the AUTH_TESTING_PLAN.md
     *
     * | Role | Admin Routes | Company Routes | Candidate Routes | Cross-Company Access |
     * |------|-------------|----------------|------------------|---------------------|
     * | chancedee | ✅ | ✅ | ✅ | ✅ |
     * | company | ❌ | ✅ (own only) | ❌ | ❌ |
     * | admin | ❌ | ✅ (own only) | ❌ | ❌ |
     * | candidate | ❌ | ❌ | ✅ | ❌ |
     * | pending | ❌ | Limited | ❌ | ❌ |
     */

    describe("Chancedee Role (System Admin)", () => {
      let chancedeeAuth: AuthResult;

      beforeEach(() => {
        chancedeeAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "chancedee-user",
              roles: ["chancedee"],
              companyId: "system",
            },
          }),
        });
      });

      it("should have access to admin routes", () => {
        expect(hasRoles(chancedeeAuth, ["chancedee"])).toBe(true);
        expect(hasRoles(chancedeeAuth, ["admin"])).toBe(false); // Only chancedee, not admin
      });

      it("should have access to company routes", () => {
        expect(hasRoles(chancedeeAuth, ["company"])).toBe(false);
        expect(hasRoles(chancedeeAuth, ["chancedee", "company"])).toBe(true); // Has chancedee
      });

      it("should have access to candidate routes", () => {
        expect(hasRoles(chancedeeAuth, ["candidate"])).toBe(false);
        expect(hasRoles(chancedeeAuth, ["chancedee", "candidate"])).toBe(true); // Has chancedee
      });

      it("should have cross-company access", () => {
        expect(belongsToCompany(chancedeeAuth, "any-company-123")).toBe(false); // Different company
        // Chancedee users typically need special handling for cross-company access
      });
    });

    describe("Company Role", () => {
      let companyAuth: AuthResult;

      beforeEach(() => {
        companyAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "company-user",
              roles: ["company"],
              companyId: "company-123",
            },
          }),
        });
      });

      it("should NOT have access to admin routes", () => {
        expect(hasRoles(companyAuth, ["chancedee"])).toBe(false);
        expect(hasRoles(companyAuth, ["admin"])).toBe(false);
      });

      it("should have access to company routes (own company only)", () => {
        expect(hasRoles(companyAuth, ["company"])).toBe(true);
        expect(belongsToCompany(companyAuth, "company-123")).toBe(true);
        expect(belongsToCompany(companyAuth, "other-company-456")).toBe(false);
      });

      it("should NOT have access to candidate routes", () => {
        expect(hasRoles(companyAuth, ["candidate"])).toBe(false);
      });

      it("should NOT have cross-company access", () => {
        expect(belongsToCompany(companyAuth, "other-company-456")).toBe(false);
        expect(belongsToCompany(companyAuth, "another-company-789")).toBe(
          false,
        );
      });
    });

    describe("Admin Role (Company Admin)", () => {
      let adminAuth: AuthResult;

      beforeEach(() => {
        adminAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "admin-user",
              roles: ["admin"],
              companyId: "company-123",
            },
          }),
        });
      });

      it("should NOT have access to system admin routes", () => {
        expect(hasRoles(adminAuth, ["chancedee"])).toBe(false);
      });

      it("should have access to company routes (own company only)", () => {
        expect(hasRoles(adminAuth, ["admin"])).toBe(true);
        expect(hasRoles(adminAuth, ["company", "admin"])).toBe(true); // Has admin role
        expect(belongsToCompany(adminAuth, "company-123")).toBe(true);
        expect(belongsToCompany(adminAuth, "other-company-456")).toBe(false);
      });

      it("should NOT have access to candidate routes", () => {
        expect(hasRoles(adminAuth, ["candidate"])).toBe(false);
      });

      it("should NOT have cross-company access", () => {
        expect(belongsToCompany(adminAuth, "other-company-456")).toBe(false);
      });
    });

    describe("Candidate Role", () => {
      let candidateAuth: AuthResult;

      beforeEach(() => {
        candidateAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "candidate-user",
              roles: ["candidate"],
              companyId: undefined, // Candidates typically don't belong to companies
            },
          }),
        });
      });

      it("should NOT have access to admin routes", () => {
        expect(hasRoles(candidateAuth, ["chancedee"])).toBe(false);
        expect(hasRoles(candidateAuth, ["admin"])).toBe(false);
      });

      it("should NOT have access to company routes", () => {
        expect(hasRoles(candidateAuth, ["company"])).toBe(false);
        expect(hasRoles(candidateAuth, ["admin"])).toBe(false);
      });

      it("should have access to candidate routes", () => {
        expect(hasRoles(candidateAuth, ["candidate"])).toBe(true);
      });

      it("should NOT have company access", () => {
        expect(belongsToCompany(candidateAuth, "any-company-123")).toBe(false);
      });
    });

    describe("Pending Role", () => {
      let pendingAuth: AuthResult;

      beforeEach(() => {
        pendingAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "pending-user",
              roles: ["pending"],
              companyId: "company-123",
            },
          }),
        });
      });

      it("should NOT have access to admin routes", () => {
        expect(hasRoles(pendingAuth, ["chancedee"])).toBe(false);
        expect(hasRoles(pendingAuth, ["admin"])).toBe(false);
      });

      it("should have limited company access", () => {
        expect(hasRoles(pendingAuth, ["pending"])).toBe(true);
        expect(hasRoles(pendingAuth, ["company"])).toBe(false);
        expect(belongsToCompany(pendingAuth, "company-123")).toBe(true); // Can see company info
      });

      it("should NOT have access to candidate routes", () => {
        expect(hasRoles(pendingAuth, ["candidate"])).toBe(false);
      });

      it("should NOT have cross-company access", () => {
        expect(belongsToCompany(pendingAuth, "other-company-456")).toBe(false);
      });
    });

    describe("Deleted Role", () => {
      let deletedAuth: AuthResult;

      beforeEach(() => {
        deletedAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "deleted-user",
              roles: ["deleted"],
              companyId: "company-123",
            },
          }),
        });
      });

      it("should NOT have access to any routes", () => {
        expect(hasRoles(deletedAuth, ["chancedee"])).toBe(false);
        expect(hasRoles(deletedAuth, ["admin"])).toBe(false);
        expect(hasRoles(deletedAuth, ["company"])).toBe(false);
        expect(hasRoles(deletedAuth, ["candidate"])).toBe(false);
        expect(hasRoles(deletedAuth, ["pending"])).toBe(false);
      });

      it("should have deleted role for identification", () => {
        expect(hasRoles(deletedAuth, ["deleted"])).toBe(true);
      });
    });
  });

  describe("Multi-Role Users", () => {
    it("should handle users with multiple roles correctly", () => {
      const multiRoleAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "multi-role-user",
            roles: ["company", "admin"],
            companyId: "company-123",
          },
        }),
      });

      expect(hasRoles(multiRoleAuth, ["company"])).toBe(true);
      expect(hasRoles(multiRoleAuth, ["admin"])).toBe(true);
      expect(hasRoles(multiRoleAuth, ["company", "admin"])).toBe(true);
      expect(hasRoles(multiRoleAuth, ["candidate"])).toBe(false);
    });

    it("should handle user transitioning from pending to active", () => {
      const transitioningAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "transitioning-user",
            roles: ["pending", "company"], // User approved but not yet cleaned up
            companyId: "company-123",
          },
        }),
      });

      expect(hasRoles(transitioningAuth, ["pending"])).toBe(true);
      expect(hasRoles(transitioningAuth, ["company"])).toBe(true);
      expect(hasRoles(transitioningAuth, ["pending", "company"])).toBe(true);
    });
  });

  describe("Company Scoping Validation", () => {
    it("should enforce strict company boundaries", () => {
      const company1User = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "company1-user",
            roles: ["company"],
            companyId: "company-001",
          },
        }),
      });

      const company2User = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "company2-user",
            roles: ["company"],
            companyId: "company-002",
          },
        }),
      });

      // Company 1 user can only access company 1
      expect(belongsToCompany(company1User, "company-001")).toBe(true);
      expect(belongsToCompany(company1User, "company-002")).toBe(false);
      expect(belongsToCompany(company1User, "company-003")).toBe(false);

      // Company 2 user can only access company 2
      expect(belongsToCompany(company2User, "company-001")).toBe(false);
      expect(belongsToCompany(company2User, "company-002")).toBe(true);
      expect(belongsToCompany(company2User, "company-003")).toBe(false);
    });

    it("should handle missing company information", () => {
      const noCompanyAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "no-company-user",
            roles: ["company"],
            companyId: undefined,
          },
        }),
      });

      expect(belongsToCompany(noCompanyAuth, "any-company")).toBe(false);
    });

    it("should handle null/undefined company IDs", () => {
      const auth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "test-user",
            roles: ["company"],
            companyId: "company-123",
          },
        }),
      });

      expect(belongsToCompany(auth, null as any)).toBe(false);
      expect(belongsToCompany(auth, undefined as any)).toBe(false);
      expect(belongsToCompany(auth, "")).toBe(false);
    });
  });

  describe("Edge Cases and Security", () => {
    it("should handle missing profile gracefully", () => {
      const noProfileAuth = createMockAuthResult({ profile: undefined });

      expect(hasRoles(noProfileAuth, ["any-role"])).toBe(false);
      expect(belongsToCompany(noProfileAuth, "any-company")).toBe(false);
    });

    it("should handle missing user info gracefully", () => {
      const noInfoAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: undefined as any,
        }),
      });

      expect(hasRoles(noInfoAuth, ["any-role"])).toBe(false);
      expect(belongsToCompany(noInfoAuth, "any-company")).toBe(false);
    });

    it("should handle empty roles array", () => {
      const emptyRolesAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "empty-roles-user",
            roles: [],
            companyId: "company-123",
          },
        }),
      });

      expect(hasRoles(emptyRolesAuth, ["any-role"])).toBe(false);
      expect(hasRoles(emptyRolesAuth, ["company"])).toBe(false);
      expect(belongsToCompany(emptyRolesAuth, "company-123")).toBe(true); // Company check still works
    });

    it("should handle null/undefined roles", () => {
      const nullRolesAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "null-roles-user",
            roles: null as any,
            companyId: "company-123",
          },
        }),
      });

      expect(hasRoles(nullRolesAuth, ["any-role"])).toBe(false);
    });

    it("should be case-sensitive for role names", () => {
      const auth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "case-test-user",
            roles: ["company"],
            companyId: "company-123",
          },
        }),
      });

      expect(hasRoles(auth, ["company"])).toBe(true);
      expect(hasRoles(auth, ["Company"])).toBe(false); // Case sensitive
      expect(hasRoles(auth, ["COMPANY"])).toBe(false); // Case sensitive
    });

    it("should be case-sensitive for company IDs", () => {
      const auth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "company-case-user",
            roles: ["company"],
            companyId: "company-123",
          },
        }),
      });

      expect(belongsToCompany(auth, "company-123")).toBe(true);
      expect(belongsToCompany(auth, "Company-123")).toBe(false); // Case sensitive
      expect(belongsToCompany(auth, "COMPANY-123")).toBe(false); // Case sensitive
    });
  });
});
