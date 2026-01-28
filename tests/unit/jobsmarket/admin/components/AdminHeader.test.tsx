import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AdminHeader } from "@/app/(platform)/platform/_components/AdminHeader";

/**
 * Unit tests for AdminHeader component
 * Per ADM-R00 Cross-Cutting RIS §2.3 Header Specification
 *
 * Top header bar with:
 * - Page title
 * - Global search
 * - User menu with avatar
 *
 * Height: 64px
 *
 * Coverage Target: 90%+
 */

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/platform/companies",
}));

// Mock useAdminAuth
vi.mock("@/hooks/jobsmarket/admin/use-admin-auth", () => ({
  useAdminAuth: vi.fn(),
}));

import { useAdminAuth } from "@/hooks/jobsmarket/admin/use-admin-auth";

describe("AdminHeader", () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      state: "ready",
      isAdmin: true,
      isLoading: false,
      isReady: true,
      currentUserId: "admin123",
      currentUserName: "Admin User",
      currentUserEmail: "admin@chancedee.com",
      logout: mockLogout,
    });
  });

  describe("Rendering", () => {
    it("should render header with correct height", () => {
      render(<AdminHeader pageTitle="Companies" />);

      const header = screen.getByTestId("admin-header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("h-16"); // 64px
    });

    it("should render page title", () => {
      render(<AdminHeader pageTitle="Companies" />);

      expect(screen.getByText("Companies")).toBeInTheDocument();
    });

    it("should render breadcrumb when provided", () => {
      render(
        <AdminHeader
          pageTitle="Company Detail"
          breadcrumb={[
            { label: "Companies", href: "/platform/companies" },
            { label: "บริษัททดสอบ จำกัด" },
          ]}
        />
      );

      expect(screen.getByText("Companies")).toBeInTheDocument();
      expect(screen.getByText("บริษัททดสอบ จำกัด")).toBeInTheDocument();
    });
  });

  describe("Global Search", () => {
    it("should render search input", () => {
      render(<AdminHeader pageTitle="Companies" />);

      expect(screen.getByTestId("admin-search")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    it("should call onSearch when typing", () => {
      const onSearch = vi.fn();
      render(<AdminHeader pageTitle="Companies" onSearch={onSearch} />);

      const searchInput = screen.getByPlaceholderText(/Search/i);
      fireEvent.change(searchInput, { target: { value: "test company" } });

      expect(onSearch).toHaveBeenCalledWith("test company");
    });

    it("should show search icon", () => {
      render(<AdminHeader pageTitle="Companies" />);

      expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    });
  });

  describe("User Menu", () => {
    it("should render user avatar", () => {
      render(<AdminHeader pageTitle="Companies" />);

      expect(screen.getByTestId("user-avatar")).toBeInTheDocument();
    });

    it("should show user initials in avatar fallback", () => {
      render(<AdminHeader pageTitle="Companies" />);

      // "Admin User" -> "AU"
      const avatar = screen.getByTestId("user-avatar-fallback");
      expect(avatar).toHaveTextContent("AU");
    });

    it("should open user menu when avatar clicked", async () => {
      const user = userEvent.setup();
      render(<AdminHeader pageTitle="Companies" />);

      const avatar = screen.getByTestId("user-avatar");
      await user.click(avatar);

      await waitFor(() => {
        expect(screen.getByTestId("user-menu")).toBeInTheDocument();
      });
    });

    it("should show user name and email in menu", async () => {
      const user = userEvent.setup();
      render(<AdminHeader pageTitle="Companies" />);

      const avatar = screen.getByTestId("user-avatar");
      await user.click(avatar);

      await waitFor(() => {
        expect(screen.getByText("Admin User")).toBeInTheDocument();
        expect(screen.getByText("admin@chancedee.com")).toBeInTheDocument();
      });
    });

    it("should show logout option in menu", async () => {
      const user = userEvent.setup();
      render(<AdminHeader pageTitle="Companies" />);

      const avatar = screen.getByTestId("user-avatar");
      await user.click(avatar);

      await waitFor(() => {
        expect(screen.getByTestId("logout-button")).toBeInTheDocument();
      });
    });

    it("should call logout when logout clicked", async () => {
      const user = userEvent.setup();
      render(<AdminHeader pageTitle="Companies" />);

      const avatar = screen.getByTestId("user-avatar");
      await user.click(avatar);

      await waitFor(() => {
        expect(screen.getByTestId("logout-button")).toBeInTheDocument();
      });

      const logoutButton = screen.getByTestId("logout-button");
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Breadcrumb Navigation", () => {
    it("should render breadcrumb separator", () => {
      render(
        <AdminHeader
          pageTitle="Company Detail"
          breadcrumb={[
            { label: "Companies", href: "/platform/companies" },
            { label: "บริษัททดสอบ จำกัด" },
          ]}
        />
      );

      expect(screen.getByTestId("breadcrumb-separator")).toBeInTheDocument();
    });

    it("should make parent breadcrumb clickable", () => {
      render(
        <AdminHeader
          pageTitle="Company Detail"
          breadcrumb={[
            { label: "Companies", href: "/platform/companies" },
            { label: "บริษัททดสอบ จำกัด" },
          ]}
        />
      );

      const parentLink = screen.getByText("Companies").closest("a");
      expect(parentLink).toHaveAttribute("href", "/platform/companies");
    });

    it("should not make current page breadcrumb clickable", () => {
      render(
        <AdminHeader
          pageTitle="Company Detail"
          breadcrumb={[
            { label: "Companies", href: "/platform/companies" },
            { label: "บริษัททดสอบ จำกัด" },
          ]}
        />
      );

      const currentPage = screen.getByText("บริษัททดสอบ จำกัด");
      expect(currentPage.closest("a")).toBeNull();
    });
  });

  describe("Styling", () => {
    it("should have white background", () => {
      render(<AdminHeader pageTitle="Companies" />);

      const header = screen.getByTestId("admin-header");
      expect(header).toHaveClass("bg-white");
    });

    it("should have bottom border", () => {
      render(<AdminHeader pageTitle="Companies" />);

      const header = screen.getByTestId("admin-header");
      expect(header).toHaveClass("border-b");
    });

    it("should have proper spacing", () => {
      render(<AdminHeader pageTitle="Companies" />);

      const header = screen.getByTestId("admin-header");
      expect(header).toHaveClass("px-6"); // 24px horizontal padding
    });
  });
});
