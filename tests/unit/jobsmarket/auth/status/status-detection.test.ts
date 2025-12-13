import { describe, it, expect } from "vitest";
import {
  detectStatusType,
  validateStatusType,
  getTargetCompanyId,
} from "@/app/jobsmarket/auth/status/_lib/status-detection";
import type { userDataProps } from "@/types/auth.types";

describe("detectStatusType", () => {
  describe("deleted status detection", () => {
    it("should detect deleted status from roles array", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["deleted"],
        },
        isActive: false,
      };

      expect(detectStatusType(user as userDataProps)).toBe("deleted");
    });

    it("should detect deleted status from status field and is_active=false", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: [],
        },
        status: "deleted",
        isActive: false,
      };

      expect(detectStatusType(user as userDataProps)).toBe("deleted");
    });

    it("should prioritize deleted over company-pending", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["deleted", "pending", "admin"],
        },
        transfer: {
          uid: "test-uid",
          targetCompany: "company-123",
          requestTimestamp: Date.now(),
          transferApproved: false,
        },
        isActive: false,
      };

      expect(detectStatusType(user as userDataProps)).toBe("deleted");
    });

    it("should prioritize deleted over staff-pending", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["deleted", "pending"],
        },
        transfer: {
          uid: "test-uid",
          targetCompany: "company-123",
          requestTimestamp: Date.now(),
          transferApproved: false,
        },
        isActive: false,
      };

      expect(detectStatusType(user as userDataProps)).toBe("deleted");
    });
  });

  describe("company-pending status detection", () => {
    it("should detect company-pending when user has pending + admin roles + target_company", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["pending", "admin"],
        },
        transfer: {
          uid: "test-uid",
          targetCompany: "company-123",
          requestTimestamp: Date.now(),
          transferApproved: false,
        },
        isActive: true,
      };

      expect(detectStatusType(user as userDataProps)).toBe("company-pending");
    });

    it("should NOT detect company-pending if target_company is missing", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["pending", "admin"],
        },
        isActive: true,
      };

      expect(detectStatusType(user as userDataProps)).toBeNull();
    });

    it("should NOT detect company-pending if admin role is missing", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["pending"],
        },
        transfer: {
          uid: "test-uid",
          targetCompany: "company-123",
          requestTimestamp: Date.now(),
          transferApproved: false,
        },
        isActive: true,
      };

      // This should be staff-pending instead
      expect(detectStatusType(user as userDataProps)).toBe("staff-pending");
    });

    it("should prioritize company-pending over staff-pending when both conditions exist", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["pending", "admin"], // Has both pending and admin
        },
        transfer: {
          uid: "test-uid",
          targetCompany: "company-123",
          requestTimestamp: Date.now(),
          transferApproved: false,
        },
        isActive: true,
      };

      expect(detectStatusType(user as userDataProps)).toBe("company-pending");
    });
  });

  describe("staff-pending status detection", () => {
    it("should detect staff-pending when user has pending role + target_company (no admin)", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["pending", "candidate"],
        },
        transfer: {
          uid: "test-uid",
          targetCompany: "company-123",
          requestTimestamp: Date.now(),
          transferApproved: false,
        },
        isActive: true,
      };

      expect(detectStatusType(user as userDataProps)).toBe("staff-pending");
    });

    it("should NOT detect staff-pending if target_company is missing", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["pending"],
        },
        isActive: true,
      };

      expect(detectStatusType(user as userDataProps)).toBeNull();
    });

    it("should NOT detect staff-pending if admin role is present", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["pending", "admin"],
        },
        transfer: {
          uid: "test-uid",
          targetCompany: "company-123",
          requestTimestamp: Date.now(),
          transferApproved: false,
        },
        isActive: true,
      };

      // Should be company-pending instead
      expect(detectStatusType(user as userDataProps)).toBe("company-pending");
    });
  });

  describe("null cases (no status - redirect to dashboard)", () => {
    it("should return null when user is null", () => {
      expect(detectStatusType(null)).toBeNull();
    });

    it("should return null when user is undefined", () => {
      expect(detectStatusType(undefined)).toBeNull();
    });

    it("should return null for active user with no pending status", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["candidate"],
        },
        isActive: true,
      };

      expect(detectStatusType(user as userDataProps)).toBeNull();
    });

    it("should return null when user has pending but no target_company", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["pending"],
        },
        isActive: true,
      };

      expect(detectStatusType(user as userDataProps)).toBeNull();
    });

    it("should return null when info.roles is missing", () => {
      const user: Partial<userDataProps> = {
        uid: "test-uid",
        isActive: true,
      };

      expect(detectStatusType(user as userDataProps)).toBeNull();
    });
  });
});

describe("validateStatusType", () => {
  it("should return 'rejected' when queryType is 'rejected' (special case)", () => {
    expect(validateStatusType("rejected", null)).toBe("rejected");
    expect(validateStatusType("rejected", "deleted")).toBe("rejected");
    expect(validateStatusType("rejected", "staff-pending")).toBe("rejected");
  });

  it("should return null when detectedType is null and queryType is not 'rejected'", () => {
    expect(validateStatusType(null, null)).toBeNull();
    expect(validateStatusType("deleted", null)).toBeNull();
    expect(validateStatusType("some-invalid-type", null)).toBeNull();
  });

  it("should return detectedType when queryType matches", () => {
    expect(validateStatusType("deleted", "deleted")).toBe("deleted");
    expect(validateStatusType("staff-pending", "staff-pending")).toBe("staff-pending");
    expect(validateStatusType("company-pending", "company-pending")).toBe("company-pending");
  });

  it("should return detectedType when queryType doesn't match (silently ignore invalid query)", () => {
    expect(validateStatusType("staff-pending", "deleted")).toBe("deleted");
    expect(validateStatusType("deleted", "company-pending")).toBe("company-pending");
    expect(validateStatusType("invalid-type", "staff-pending")).toBe("staff-pending");
  });

  it("should return detectedType when queryType is null or undefined", () => {
    expect(validateStatusType(null, "deleted")).toBe("deleted");
    expect(validateStatusType(undefined, "staff-pending")).toBe("staff-pending");
  });
});

describe("getTargetCompanyId", () => {
  it("should return target company ID when transfer exists", () => {
    const user: Partial<userDataProps> = {
      uid: "test-uid",
      transfer: {
        uid: "test-uid",
        targetCompany: "company-123",
        requestTimestamp: Date.now(),
        transferApproved: false,
      },
    };

    expect(getTargetCompanyId(user as userDataProps)).toBe("company-123");
  });

  it("should return null when user is null", () => {
    expect(getTargetCompanyId(null)).toBeNull();
  });

  it("should return null when user is undefined", () => {
    expect(getTargetCompanyId(undefined)).toBeNull();
  });

  it("should return null when transfer is missing", () => {
    const user: Partial<userDataProps> = {
      uid: "test-uid",
    };

    expect(getTargetCompanyId(user as userDataProps)).toBeNull();
  });

  it("should return null when targetCompany is missing from transfer", () => {
    const user: Partial<userDataProps> = {
      uid: "test-uid",
      transfer: {
        uid: "test-uid",
        targetCompany: "",
        requestTimestamp: Date.now(),
        transferApproved: false,
      },
    };

    expect(getTargetCompanyId(user as userDataProps)).toBeNull();
  });
});
