import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasswordTab } from "@/app/jobsmarket/auth/settings/_components/PasswordTab";

// Mock dependencies
vi.mock("@/hooks/use-auth", () => ({
  useFirebaseAuth: vi.fn(),
}));

vi.mock("@/components/auth/change-password", () => ({
  default: () => <div data-testid="change-password-form">Change Password Form</div>,
}));

vi.mock("@/components/auth/create-password", () => ({
  default: () => <div data-testid="create-password-form">Create Password Form</div>,
}));

import { useFirebaseAuth } from "@/hooks/use-auth";

/**
 * Integration tests for AUTH-R06 Settings Password Tab
 * Tests password form selection based on provider detection
 */

describe("PasswordTab Component", () => {
  describe("Password provider detection", () => {
    it("should show change password form for users with password provider", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(<PasswordTab />);

      expect(screen.getByTestId("change-password-form")).toBeInTheDocument();
      expect(screen.queryByTestId("create-password-form")).not.toBeInTheDocument();
    });

    it("should show create password form for users without password provider", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@gmail.com",
          providerData: [{ providerId: "google.com" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(<PasswordTab />);

      expect(screen.getByTestId("create-password-form")).toBeInTheDocument();
      expect(screen.queryByTestId("change-password-form")).not.toBeInTheDocument();
    });

    it("should show create password form for Facebook-only users", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@facebook.com",
          providerData: [{ providerId: "facebook.com" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(<PasswordTab />);

      expect(screen.getByTestId("create-password-form")).toBeInTheDocument();
      expect(screen.queryByTestId("change-password-form")).not.toBeInTheDocument();
    });

    it("should show change password form for users with multiple providers including password", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          providerData: [
            { providerId: "password" },
            { providerId: "google.com" },
          ],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(<PasswordTab />);

      expect(screen.getByTestId("change-password-form")).toBeInTheDocument();
      expect(screen.queryByTestId("create-password-form")).not.toBeInTheDocument();
    });
  });

  describe("Heading display", () => {
    it("should show เปลี่ยนรหัสผ่าน heading for password users", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          providerData: [{ providerId: "password" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(<PasswordTab />);

      expect(screen.getByText("เปลี่ยนรหัสผ่าน")).toBeInTheDocument();
      expect(screen.getByText("Change Password")).toBeInTheDocument();
    });

    it("should show สร้างรหัสผ่าน heading for OAuth users", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@gmail.com",
          providerData: [{ providerId: "google.com" }],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(<PasswordTab />);

      expect(screen.getByText("สร้างรหัสผ่าน")).toBeInTheDocument();
      expect(screen.getByText("Create Password")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("should handle empty providerData array", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          providerData: [],
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(<PasswordTab />);

      expect(screen.getByTestId("create-password-form")).toBeInTheDocument();
    });

    it("should handle undefined providerData", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          providerData: undefined,
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(<PasswordTab />);

      expect(screen.getByTestId("create-password-form")).toBeInTheDocument();
    });

    it("should handle null values in providerData array", () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: {
          uid: "test-uid",
          email: "test@example.com",
          providerData: [null, { providerId: "google.com" }] as any,
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(<PasswordTab />);

      expect(screen.getByTestId("create-password-form")).toBeInTheDocument();
    });
  });
});
