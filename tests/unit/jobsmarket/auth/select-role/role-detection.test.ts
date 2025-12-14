import { describe, it, expect } from "vitest";

/**
 * Unit tests for AUTH-R07 Role Detection Logic
 * Tests auto-redirect logic based on user roles
 * Per RIS §11.2
 */

interface UserData {
  uid: string;
  roles: string[];
  company_id?: string;
}

/**
 * Determine if user should see selection page or auto-redirect
 */
function shouldShowSelectionPage(user: UserData | null): {
  show: boolean;
  redirectTo?: string;
  reason?: string;
} {
  if (!user) {
    return {
      show: false,
      redirectTo: "/jobsmarket/auth/login",
      reason: "not_authenticated",
    };
  }

  // Platform admin bypasses
  if (user.roles.includes("chancedee")) {
    return {
      show: false,
      redirectTo: "/platform/dashboard",
      reason: "platform_admin",
    };
  }

  // Deleted users
  if (user.roles.includes("deleted")) {
    return {
      show: false,
      redirectTo: "/jobsmarket/auth/status?type=deleted",
      reason: "deleted",
    };
  }

  // Pending users
  if (user.roles.includes("pending")) {
    return {
      show: false,
      redirectTo: "/jobsmarket/auth/status?type=pending",
      reason: "pending",
    };
  }

  // Single role checks
  const hasCandidate = user.roles.includes("candidate");
  const hasCompany = user.roles.includes("company") && !!user.company_id;

  // Candidate only
  if (hasCandidate && !hasCompany) {
    return {
      show: false,
      redirectTo: `/jobsmarket/candidates/${user.uid}`,
      reason: "single_role_candidate",
    };
  }

  // Company only
  if (hasCompany && !hasCandidate) {
    return {
      show: false,
      redirectTo: `/jobsmarket/companies/${user.company_id}/dashboard`,
      reason: "single_role_company",
    };
  }

  // Multi-role user - show selection
  if (hasCandidate && hasCompany) {
    return {
      show: true,
      reason: "multi_role",
    };
  }

  // Fallback - no valid roles
  return {
    show: false,
    redirectTo: "/jobsmarket",
    reason: "no_valid_roles",
  };
}

/**
 * Check if saved preference should auto-skip selection
 */
function shouldAutoSkipWithPreference(
  user: UserData,
  savedRole: string | null
): {
  skip: boolean;
  redirectTo?: string;
} {
  if (!savedRole) {
    return { skip: false };
  }

  const hasCandidate = user.roles.includes("candidate");
  const hasCompany = user.roles.includes("company") && !!user.company_id;

  // Validate saved preference
  if (savedRole === "candidate" && hasCandidate) {
    return {
      skip: true,
      redirectTo: `/jobsmarket/candidates/${user.uid}`,
    };
  }

  if (savedRole === "company" && hasCompany) {
    return {
      skip: true,
      redirectTo: `/jobsmarket/companies/${user.company_id}/dashboard`,
    };
  }

  // Invalid preference
  return { skip: false };
}

describe("Role Detection Logic", () => {
  describe("Auto-redirect scenarios", () => {
    it("should redirect to login if no user", () => {
      const result = shouldShowSelectionPage(null);

      expect(result.show).toBe(false);
      expect(result.redirectTo).toBe("/jobsmarket/auth/login");
      expect(result.reason).toBe("not_authenticated");
    });

    it("should redirect platform admin to platform dashboard", () => {
      const user: UserData = {
        uid: "admin1",
        roles: ["chancedee"],
      };

      const result = shouldShowSelectionPage(user);

      expect(result.show).toBe(false);
      expect(result.redirectTo).toBe("/platform/dashboard");
      expect(result.reason).toBe("platform_admin");
    });

    it("should redirect deleted users to status page", () => {
      const user: UserData = {
        uid: "user1",
        roles: ["deleted"],
      };

      const result = shouldShowSelectionPage(user);

      expect(result.show).toBe(false);
      expect(result.redirectTo).toBe("/jobsmarket/auth/status?type=deleted");
      expect(result.reason).toBe("deleted");
    });

    it("should redirect pending users to status page", () => {
      const user: UserData = {
        uid: "user1",
        roles: ["candidate", "pending"],
      };

      const result = shouldShowSelectionPage(user);

      expect(result.show).toBe(false);
      expect(result.redirectTo).toBe("/jobsmarket/auth/status?type=pending");
      expect(result.reason).toBe("pending");
    });

    it("should auto-redirect candidate-only users", () => {
      const user: UserData = {
        uid: "user1",
        roles: ["candidate"],
      };

      const result = shouldShowSelectionPage(user);

      expect(result.show).toBe(false);
      expect(result.redirectTo).toBe("/jobsmarket/candidates/user1");
      expect(result.reason).toBe("single_role_candidate");
    });

    it("should auto-redirect company-only users", () => {
      const user: UserData = {
        uid: "user1",
        roles: ["company"],
        company_id: "comp123",
      };

      const result = shouldShowSelectionPage(user);

      expect(result.show).toBe(false);
      expect(result.redirectTo).toBe("/jobsmarket/companies/comp123/dashboard");
      expect(result.reason).toBe("single_role_company");
    });

    it("should NOT auto-redirect company role without company_id", () => {
      const user: UserData = {
        uid: "user1",
        roles: ["company"], // Has role but no company_id
      };

      const result = shouldShowSelectionPage(user);

      // Should fallback since no valid roles
      expect(result.show).toBe(false);
      expect(result.redirectTo).toBe("/jobsmarket");
      expect(result.reason).toBe("no_valid_roles");
    });
  });

  describe("Show selection page scenarios", () => {
    it("should show page for multi-role users (candidate + company)", () => {
      const user: UserData = {
        uid: "user1",
        roles: ["candidate", "company"],
        company_id: "comp123",
      };

      const result = shouldShowSelectionPage(user);

      expect(result.show).toBe(true);
      expect(result.reason).toBe("multi_role");
      expect(result.redirectTo).toBeUndefined();
    });

    it("should show page for multi-role with admin", () => {
      const user: UserData = {
        uid: "user1",
        roles: ["candidate", "company", "admin"],
        company_id: "comp123",
      };

      const result = shouldShowSelectionPage(user);

      expect(result.show).toBe(true);
      expect(result.reason).toBe("multi_role");
    });
  });

  describe("Saved preference auto-skip", () => {
    const multiRoleUser: UserData = {
      uid: "user1",
      roles: ["candidate", "company"],
      company_id: "comp123",
    };

    it("should auto-skip with valid candidate preference", () => {
      const result = shouldAutoSkipWithPreference(multiRoleUser, "candidate");

      expect(result.skip).toBe(true);
      expect(result.redirectTo).toBe("/jobsmarket/candidates/user1");
    });

    it("should auto-skip with valid company preference", () => {
      const result = shouldAutoSkipWithPreference(multiRoleUser, "company");

      expect(result.skip).toBe(true);
      expect(result.redirectTo).toBe("/jobsmarket/companies/comp123/dashboard");
    });

    it("should NOT skip with no saved preference", () => {
      const result = shouldAutoSkipWithPreference(multiRoleUser, null);

      expect(result.skip).toBe(false);
      expect(result.redirectTo).toBeUndefined();
    });

    it("should NOT skip with invalid preference value", () => {
      const result = shouldAutoSkipWithPreference(multiRoleUser, "admin");

      expect(result.skip).toBe(false);
    });

    it("should NOT skip if saved candidate but user lacks candidate role", () => {
      const companyOnlyUser: UserData = {
        uid: "user1",
        roles: ["company"],
        company_id: "comp123",
      };

      const result = shouldAutoSkipWithPreference(companyOnlyUser, "candidate");

      expect(result.skip).toBe(false);
    });

    it("should NOT skip if saved company but user lacks company_id", () => {
      const candidateOnlyUser: UserData = {
        uid: "user1",
        roles: ["candidate", "company"], // Has role but no company_id
      };

      const result = shouldAutoSkipWithPreference(candidateOnlyUser, "company");

      expect(result.skip).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle user with no roles", () => {
      const user: UserData = {
        uid: "user1",
        roles: [],
      };

      const result = shouldShowSelectionPage(user);

      expect(result.show).toBe(false);
      expect(result.reason).toBe("no_valid_roles");
    });

    it("should prioritize deleted over other roles", () => {
      const user: UserData = {
        uid: "user1",
        roles: ["candidate", "company", "deleted"],
        company_id: "comp123",
      };

      const result = shouldShowSelectionPage(user);

      expect(result.show).toBe(false);
      expect(result.redirectTo).toBe("/jobsmarket/auth/status?type=deleted");
    });

    it("should prioritize pending over single role", () => {
      const user: UserData = {
        uid: "user1",
        roles: ["candidate", "pending"],
      };

      const result = shouldShowSelectionPage(user);

      expect(result.show).toBe(false);
      expect(result.redirectTo).toBe("/jobsmarket/auth/status?type=pending");
    });

    it("should prioritize chancedee over multi-role", () => {
      const user: UserData = {
        uid: "user1",
        roles: ["candidate", "company", "chancedee"],
        company_id: "comp123",
      };

      const result = shouldShowSelectionPage(user);

      expect(result.show).toBe(false);
      expect(result.redirectTo).toBe("/platform/dashboard");
    });
  });
});
