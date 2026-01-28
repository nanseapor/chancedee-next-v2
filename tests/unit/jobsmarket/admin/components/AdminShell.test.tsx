import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { AdminShell } from "@/app/(platform)/platform/_components/AdminShell";

/**
 * Unit tests for AdminShell component
 * Per ADM-R00 Cross-Cutting RIS §2 Admin Shell Specification
 *
 * The Admin Shell is the layout wrapper for all platform admin routes.
 * It includes the sidebar, header, and main content area.
 * Desktop-only: blocks mobile access (min-width: 1024px)
 *
 * Coverage Target: 90%+
 */

// Mock useAdminAuth hook
vi.mock("@/hooks/jobsmarket/admin/use-admin-auth", () => ({
  useAdminAuth: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/platform/companies",
}));

// Mock matchMedia for responsive tests
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

import { useAdminAuth } from "@/hooks/jobsmarket/admin/use-admin-auth";

describe("AdminShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to desktop view
    mockMatchMedia(false);
  });

  describe("Rendering", () => {
    it("should render shell with sidebar and main content area", () => {
      (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        state: "ready",
        isAdmin: true,
        isLoading: false,
        isReady: true,
        currentUserId: "admin123",
      });

      render(
        <AdminShell>
          <div data-testid="test-content">Test Content</div>
        </AdminShell>
      );

      expect(screen.getByTestId("admin-shell")).toBeInTheDocument();
      expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("admin-main-content")).toBeInTheDocument();
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
    });

    it("should render header with search and user menu", () => {
      (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        state: "ready",
        isAdmin: true,
        isLoading: false,
        isReady: true,
        currentUserId: "admin123",
      });

      render(
        <AdminShell>
          <div>Content</div>
        </AdminShell>
      );

      expect(screen.getByTestId("admin-header")).toBeInTheDocument();
    });

    it("should apply correct layout dimensions per spec", () => {
      (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        state: "ready",
        isAdmin: true,
        isLoading: false,
        isReady: true,
        currentUserId: "admin123",
      });

      render(
        <AdminShell>
          <div>Content</div>
        </AdminShell>
      );

      // Sidebar: 280px fixed width
      const sidebar = screen.getByTestId("admin-sidebar");
      expect(sidebar).toHaveClass("w-[280px]");

      // Header: 64px height
      const header = screen.getByTestId("admin-header");
      expect(header).toHaveClass("h-16"); // h-16 = 64px
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when auth is loading", () => {
      (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        state: "loading",
        isAdmin: false,
        isLoading: true,
        isReady: false,
        currentUserId: null,
      });

      render(
        <AdminShell>
          <div>Content</div>
        </AdminShell>
      );

      expect(screen.getByTestId("admin-shell-loading")).toBeInTheDocument();
    });

    it("should not render children while loading", () => {
      (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        state: "loading",
        isAdmin: false,
        isLoading: true,
        isReady: false,
        currentUserId: null,
      });

      render(
        <AdminShell>
          <div data-testid="test-content">Test Content</div>
        </AdminShell>
      );

      expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
    });
  });

  describe("Authorization", () => {
    it("should render children when authorized", () => {
      (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        state: "ready",
        isAdmin: true,
        isLoading: false,
        isReady: true,
        currentUserId: "admin123",
      });

      render(
        <AdminShell>
          <div data-testid="admin-content">Admin Content</div>
        </AdminShell>
      );

      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });

    it("should not render children when unauthorized", () => {
      (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        state: "unauthorized",
        isAdmin: false,
        isLoading: false,
        isReady: false,
        currentUserId: null,
      });

      render(
        <AdminShell>
          <div data-testid="admin-content">Admin Content</div>
        </AdminShell>
      );

      expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
    });
  });

  describe("Mobile Blocking", () => {
    it("should show mobile blocker on screens < 1024px", () => {
      mockMatchMedia(true); // Mobile view

      (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        state: "ready",
        isAdmin: true,
        isLoading: false,
        isReady: true,
        currentUserId: "admin123",
      });

      render(
        <AdminShell>
          <div data-testid="admin-content">Admin Content</div>
        </AdminShell>
      );

      expect(screen.getByTestId("admin-mobile-blocker")).toBeInTheDocument();
      expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
    });

    it("should show desktop instructions in mobile blocker", () => {
      mockMatchMedia(true); // Mobile view

      (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        state: "ready",
        isAdmin: true,
        isLoading: false,
        isReady: true,
        currentUserId: "admin123",
      });

      render(
        <AdminShell>
          <div>Content</div>
        </AdminShell>
      );

      // Should show message about desktop requirement
      expect(screen.getByRole("heading", { name: /Desktop Required/i })).toBeInTheDocument();
    });

    it("should render shell on desktop (>= 1024px)", () => {
      mockMatchMedia(false); // Desktop view

      (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        state: "ready",
        isAdmin: true,
        isLoading: false,
        isReady: true,
        currentUserId: "admin123",
      });

      render(
        <AdminShell>
          <div data-testid="admin-content">Admin Content</div>
        </AdminShell>
      );

      expect(screen.queryByTestId("admin-mobile-blocker")).not.toBeInTheDocument();
      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });
  });

  describe("Theme", () => {
    it("should apply purple accent theme per spec", () => {
      (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        state: "ready",
        isAdmin: true,
        isLoading: false,
        isReady: true,
        currentUserId: "admin123",
      });

      render(
        <AdminShell>
          <div>Content</div>
        </AdminShell>
      );

      const shell = screen.getByTestId("admin-shell");
      // Background should be gray-50
      expect(shell).toHaveClass("bg-gray-50");
    });
  });
});
