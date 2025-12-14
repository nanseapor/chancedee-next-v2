import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountTab } from "@/app/jobsmarket/auth/settings/_components/AccountTab";

// Mock dependencies
vi.mock("@/hooks/use-auth", () => ({
  useFirebaseAuth: vi.fn(),
}));

vi.mock("swr", () => ({
  default: vi.fn(),
}));

import { useFirebaseAuth } from "@/hooks/use-auth";
import useSWR from "swr";

/**
 * Integration tests for AUTH-R06 Settings Account Tab
 * Tests account information display, provider badges, and default role settings
 */

describe("AccountTab Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  describe("Email display", () => {
    it("should display user email", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate"] },
        },
      } as any);

      render(<AccountTab />);

      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("should show email verification checkmark when verified", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "verified@example.com",
          emailVerified: true,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate"] },
        },
      } as any);

      render(<AccountTab />);

      expect(screen.getByText("ยืนยันอีเมลแล้ว")).toBeInTheDocument();
    });

    it("should not show verification checkmark when not verified", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "unverified@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate"] },
        },
      } as any);

      render(<AccountTab />);

      expect(screen.queryByText("ยืนยันอีเมลแล้ว")).not.toBeInTheDocument();
    });
  });

  describe("Provider badges", () => {
    it("should display อีเมล badge for password provider", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate"] },
        },
      } as any);

      render(<AccountTab />);

      expect(screen.getByText("อีเมล")).toBeInTheDocument();
    });

    it("should display Google badge for Google provider", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@gmail.com",
          emailVerified: true,
          providerData: [{ providerId: "google.com" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate"] },
        },
      } as any);

      render(<AccountTab />);

      expect(screen.getByText("Google")).toBeInTheDocument();
    });

    it("should display Facebook badge for Facebook provider", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@facebook.com",
          emailVerified: true,
          providerData: [{ providerId: "facebook.com" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate"] },
        },
      } as any);

      render(<AccountTab />);

      expect(screen.getByText("Facebook")).toBeInTheDocument();
    });
  });

  describe("Connected providers section", () => {
    it("should show all three provider options", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate"] },
        },
      } as any);

      render(<AccountTab />);

      // Check for Thai heading
      expect(screen.getByText("ผู้ให้บริการที่เชื่อมต่อ")).toBeInTheDocument();

      // Check for all provider labels
      expect(screen.getByText("Google")).toBeInTheDocument();
      expect(screen.getByText("Facebook")).toBeInTheDocument();
      expect(screen.getByText("อีเมล/รหัสผ่าน")).toBeInTheDocument();
    });

    it("should show เชื่อมต่อแล้ว badge for connected password provider", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate"] },
        },
      } as any);

      render(<AccountTab />);

      const passwordRow = screen.getByText("อีเมล/รหัสผ่าน").closest("div");
      expect(within(passwordRow!).getByText("เชื่อมต่อแล้ว")).toBeInTheDocument();
    });

    it("should show ไม่ได้เชื่อมต่อ badge for disconnected providers", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate"] },
        },
      } as any);

      render(<AccountTab />);

      const googleRow = screen.getByText("Google").closest("div");
      const facebookRow = screen.getByText("Facebook").closest("div");

      expect(within(googleRow!).getByText("ไม่ได้เชื่อมต่อ")).toBeInTheDocument();
      expect(within(facebookRow!).getByText("ไม่ได้เชื่อมต่อ")).toBeInTheDocument();
    });
  });

  describe("Multi-role default role section", () => {
    it("should not show default role section for candidate-only users", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate"] },
        },
      } as any);

      render(<AccountTab />);

      expect(screen.queryByText("บทบาทเริ่มต้นเมื่อเข้าสู่ระบบ")).not.toBeInTheDocument();
    });

    it("should not show default role section for company-only users", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["company", "admin"] },
        },
      } as any);

      render(<AccountTab />);

      expect(screen.queryByText("บทบาทเริ่มต้นเมื่อเข้าสู่ระบบ")).not.toBeInTheDocument();
    });

    it("should show default role section for multi-role users", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate", "company"] },
        },
      } as any);

      render(<AccountTab />);

      expect(screen.getByText("บทบาทเริ่มต้นเมื่อเข้าสู่ระบบ")).toBeInTheDocument();
      expect(screen.getByText("Default Role on Login")).toBeInTheDocument();
    });

    it("should show auto-skip checkbox for multi-role users", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate", "company"] },
        },
      } as any);

      render(<AccountTab />);

      expect(screen.getByText("ข้ามหน้าเลือกบทบาท")).toBeInTheDocument();
      expect(screen.getByText("Skip role selection page")).toBeInTheDocument();
    });
  });

  describe("Auto-skip functionality", () => {
    it("should enable auto-skip checkbox when lastActiveRole is in localStorage", () => {
      localStorage.setItem("lastActiveRole", "candidate");

      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate", "company"] },
        },
      } as any);

      render(<AccountTab />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("should show role dropdown when auto-skip is enabled", async () => {
      localStorage.setItem("lastActiveRole", "candidate");

      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate", "company"] },
        },
      } as any);

      render(<AccountTab />);

      expect(screen.getByText("บทบาทที่เลือกไว้")).toBeInTheDocument();
    });

    it("should toggle auto-skip checkbox and save to localStorage", async () => {
      const user = userEvent.setup();

      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate", "company"] },
        },
      } as any);

      render(<AccountTab />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(localStorage.getItem("lastActiveRole")).not.toBeNull();
    });

    it("should remove lastActiveRole from localStorage when unchecking auto-skip", async () => {
      const user = userEvent.setup();
      localStorage.setItem("lastActiveRole", "candidate");

      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: false,
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate", "company"] },
        },
      } as any);

      render(<AccountTab />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(localStorage.getItem("lastActiveRole")).toBeNull();
    });
  });
});
