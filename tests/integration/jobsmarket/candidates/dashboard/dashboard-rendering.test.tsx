import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import useSWR from "swr";

import { DashboardClient } from "@/app/jobsmarket/candidates/[id]/_components/DashboardClient";
import { useCandidateAuth } from "@/hooks/jobsmarket/use-candidate-auth";

/**
 * Integration tests for CAND-R01 Dashboard Rendering
 * Tests complete dashboard rendering with all sections
 *
 * Coverage Target: Component composition and layout
 */

// Mock dependencies
vi.mock("@/hooks/jobsmarket/use-candidate-auth");
vi.mock("swr");
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

describe("Dashboard Rendering Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default auth state: ready
    vi.mocked(useCandidateAuth).mockReturnValue({
      state: "ready",
      isLoading: false,
      isReady: true,
      currentUserId: "user123",
      setOnboardingComplete: vi.fn(),
    });
  });

  it("should render all dashboard sections with complete mock data", () => {
    // Mock complete profile data (camelCase to match component)
    const mockProfile = {
      uid: "user123",
      firstnameTH: "สมชาย",
      lastnameTH: "ใจดี",
      email: "somchai@example.com",
      phone: "0812345678",
      first_name_th: "สมชาย", // For profile completion hook (snake_case)
      last_name_th: "ใจดี",
      phone_number: "0812345678",
      avatar_url: "https://example.com/avatar.jpg",
    };

    // Mock applications
    const mockApplications = [
      {
        id: "app1",
        candidateId: "user123",
        jobId: "job1",
        status: "new",
        createdAt: Date.now(),
      },
      {
        id: "app2",
        candidateId: "user123",
        jobId: "job2",
        status: "accepted",
        createdAt: Date.now() - 86400000,
      },
    ];

    // Mock interviews
    const mockInterviews = [
      {
        id: "int1",
        jobId: "job1",
        candidateId: "user123",
        interviewDate: new Date(Date.now() + 86400000).toISOString(),
        status: "scheduled",
      },
    ];

    // Mock wallet
    const mockWallet = {
      balance: 250,
      updatedAt: Date.now(),
    };

    vi.mocked(useSWR).mockImplementation((key) => {
      if (Array.isArray(key) && key[0] === "candidate-profile") {
        return {
          data: mockProfile,
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      }
      if (Array.isArray(key) && key[0] === "applications") {
        return {
          data: mockApplications,
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      }
      if (Array.isArray(key) && key[0] === "upcoming-interviews") {
        return {
          data: mockInterviews,
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      }
      if (Array.isArray(key) && key[0] === "coin-balance") {
        return {
          data: mockWallet,
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      }
      return {
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      } as any;
    });

    render(<DashboardClient candidateId="user123" />);

    // Verify welcome header
    expect(screen.getByText(/สมชาย ใจดี/)).toBeInTheDocument();

    // Verify profile completion card
    expect(screen.getByText(/ความสมบูรณ์ของโปรไฟล์/)).toBeInTheDocument();

    // Verify coin balance card
    expect(screen.getByText(/250/)).toBeInTheDocument();

    // Verify application summary
    expect(screen.getByText(/สถานะการสมัครงาน/)).toBeInTheDocument();
    expect(screen.getByText(/Applied/)).toBeInTheDocument();

    // Verify recent applications
    expect(screen.getByText(/ใบสมัครล่าสุด/)).toBeInTheDocument();

    // Verify appointments section (should show when interviews exist)
    expect(screen.getByText(/นัดหมายที่กำลังจะถึง/)).toBeInTheDocument();

    // Verify recommended jobs
    expect(screen.getByText(/งานที่แนะนำสำหรับคุณ/)).toBeInTheDocument();
  });

  it("should show loading skeleton during data fetch", () => {
    vi.mocked(useCandidateAuth).mockReturnValue({
      state: "ready",
      isLoading: false,
      isReady: true,
      currentUserId: "user123",
      setOnboardingComplete: vi.fn(),
    });

    const mockProfile = {
      uid: "user123",
      firstnameTH: "สมชาย",
      lastnameTH: "ใจดี",
    };

    vi.mocked(useSWR).mockImplementation((key) => {
      // Profile loaded
      if (Array.isArray(key) && key[0] === "candidate-profile") {
        return {
          data: mockProfile,
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      }
      // Everything else is loading
      return {
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any;
    });

    render(<DashboardClient candidateId="user123" />);

    // Should show loading skeletons (animate-pulse)
    const pulsingElements = document.querySelectorAll(".animate-pulse");
    expect(pulsingElements.length).toBeGreaterThan(0);
  });

  it("should handle partial data with mixed loading and loaded states", () => {
    const mockProfile = {
      uid: "user123",
      firstnameTH: "สมชาย",
      lastnameTH: "ใจดี",
    };

    vi.mocked(useSWR).mockImplementation((key) => {
      // Profile is loaded
      if (Array.isArray(key) && key[0] === "candidate-profile") {
        return {
          data: mockProfile,
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      }
      // Everything else is still loading
      return {
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any;
    });

    render(<DashboardClient candidateId="user123" />);

    // Profile should be visible
    expect(screen.getByText(/สมชาย ใจดี/)).toBeInTheDocument();

    // Other sections should show loading
    const loadingElements = document.querySelectorAll(".animate-pulse");
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it("should render inside candidate shell layout structure", () => {
    const mockProfile = {
      uid: "user123",
      firstnameTH: "สมชาย",
      lastnameTH: "ใจดี",
    };

    vi.mocked(useSWR).mockImplementation((key) => {
      if (Array.isArray(key) && key[0] === "candidate-profile") {
        return {
          data: mockProfile,
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      }
      return {
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      } as any;
    });

    const { container } = render(<DashboardClient candidateId="user123" />);

    // Verify main layout structure
    const mainContainer = container.querySelector(".min-h-screen");
    expect(mainContainer).toBeInTheDocument();

    // Verify responsive grid for top row cards
    const gridContainer = container.querySelector(".grid.grid-cols-1.md\\:grid-cols-2");
    expect(gridContainer).toBeInTheDocument();

    // Verify spacing between sections
    const spacedContainer = container.querySelector(".space-y-6");
    expect(spacedContainer).toBeInTheDocument();
  });
});
