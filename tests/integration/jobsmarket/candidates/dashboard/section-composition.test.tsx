import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import useSWR from "swr";

import { DashboardClient } from "@/app/jobsmarket/candidates/[id]/_components/DashboardClient";
import { useCandidateAuth } from "@/hooks/jobsmarket/use-candidate-auth";

/**
 * Integration tests for CAND-R01 Dashboard Section Composition
 * Tests individual section behavior within dashboard context
 *
 * Coverage Target: Section-level data handling and display
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

describe("Dashboard Section Composition Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCandidateAuth).mockReturnValue({
      state: "ready",
      isLoading: false,
      isReady: true,
      currentUserId: "user123",
      setOnboardingComplete: vi.fn(),
    });
  });

  describe("ApplicationSummary Section", () => {
    it("should display correct status counts based on application data", () => {
      const mockProfile = {
        uid: "user123",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
      };

      // Applications with different statuses
      const mockApplications = [
        // 2 "Applied" (new status)
        { id: "app1", candidateId: "user123", status: "new", createdAt: Date.now() },
        { id: "app2", candidateId: "user123", status: "read", createdAt: Date.now() },
        // 1 "Reviewing" (accepted status)
        { id: "app3", candidateId: "user123", status: "accepted", createdAt: Date.now() },
        // 1 "Interviewing" (scheduled status)
        { id: "app4", candidateId: "user123", status: "scheduled", createdAt: Date.now() },
      ];

      vi.mocked(useSWR).mockImplementation((key) => {
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return { data: mockProfile, error: undefined, isLoading: false, mutate: vi.fn() } as any;
        }
        if (Array.isArray(key) && key[0] === "applications") {
          return { data: mockApplications, error: undefined, isLoading: false, mutate: vi.fn() } as any;
        }
        return { data: undefined, error: undefined, isLoading: false, mutate: vi.fn() } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Verify status counts are displayed correctly
      const summarySection = screen.getByText(/สถานะการสมัครงาน/).closest("div");
      expect(summarySection).toBeInTheDocument();

      // Should show "2" for Applied (new + read)
      const appliedCard = screen.getByText("Applied").closest("a");
      expect(appliedCard).toHaveTextContent("2");

      // Should show "1" for Reviewing (accepted)
      const reviewingCard = screen.getByText("Reviewing").closest("a");
      expect(reviewingCard).toHaveTextContent("1");

      // Should show "1" for Interviewing (scheduled)
      const interviewingCard = screen.getByText("Interviewing").closest("a");
      expect(interviewingCard).toHaveTextContent("1");

      // Should show "0" for Offers (no offers)
      const offersCard = screen.getByText("Offers").closest("a");
      expect(offersCard).toHaveTextContent("0");
    });
  });

  describe("ProfileCompletionCard Section", () => {
    it("should show correct completion percentage and CTA based on profile data", () => {
      // Incomplete profile (only basic fields = 15% from identity, needs phone for contact)
      const incompleteProfile = {
        uid: "user123",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
        email: "test@example.com",
        first_name_th: "สมชาย", // For hook (15% identity)
        last_name_th: "ใจดี",
        // Missing: phone (need both phone+email for 15%), photo (10%), work (20%), education (15%), about (10%), expertise (10%), preferences (5%)
      };

      vi.mocked(useSWR).mockImplementation((key) => {
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return {
            data: incompleteProfile,
            error: undefined,
            isLoading: false,
            mutate: vi.fn(),
          } as any;
        }
        return { data: undefined, error: undefined, isLoading: false, mutate: vi.fn() } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Profile completion card should be visible
      expect(screen.getByText(/ความสมบูรณ์ของโปรไฟล์/)).toBeInTheDocument();

      // Should show low percentage (15% for identity only)
      expect(screen.getByText("15%")).toBeInTheDocument();

      // Should show CTA to complete profile
      expect(screen.getByText(/กรอกข้อมูลให้สมบูรณ์/)).toBeInTheDocument();
    });

    it("should show high completion for complete profile", () => {
      // Complete profile (all fields filled)
      const completeProfile = {
        uid: "user123",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
        email: "test@example.com",
        // For hook (snake_case):
        first_name_th: "สมชาย", // 15%
        last_name_th: "ใจดี",
        phone_number: "0812345678", // 15% (requires both phone + email)
        avatar_url: "https://example.com/photo.jpg", // 10%
        works: [{company: "Acme"}], // 20%
        educations: [{school: "University"}], // 15%
        about_me: "Experienced web developer with 5+ years in React and Node.js", // 10% (needs >= 50 chars)
        area_of_expertise: "Web Development", // 10%
        is_preference_set: true, // 5%
        // Total: 100%
      };

      vi.mocked(useSWR).mockImplementation((key) => {
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return {
            data: completeProfile,
            error: undefined,
            isLoading: false,
            mutate: vi.fn(),
          } as any;
        }
        return { data: undefined, error: undefined, isLoading: false, mutate: vi.fn() } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Should show 100% completion
      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });

  describe("AppointmentsSection Conditional Rendering", () => {
    it("should hide appointments section when no upcoming interviews", () => {
      const mockProfile = {
        uid: "user123",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
      };

      vi.mocked(useSWR).mockImplementation((key) => {
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return { data: mockProfile, error: undefined, isLoading: false, mutate: vi.fn() } as any;
        }
        if (Array.isArray(key) && key[0] === "upcoming-interviews") {
          // Empty array - no interviews
          return { data: [], error: undefined, isLoading: false, mutate: vi.fn() } as any;
        }
        return { data: undefined, error: undefined, isLoading: false, mutate: vi.fn() } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Appointments section should NOT be visible
      expect(screen.queryByText(/นัดหมายที่กำลังจะถึง/)).not.toBeInTheDocument();
    });

    it("should show appointments section when interviews exist", () => {
      const mockProfile = {
        uid: "user123",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
      };

      const mockInterviews = [
        {
          id: "int1",
          jobId: "job1",
          candidateId: "user123",
          interviewDate: new Date(Date.now() + 86400000).toISOString(),
          status: "scheduled",
        },
      ];

      vi.mocked(useSWR).mockImplementation((key) => {
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return { data: mockProfile, error: undefined, isLoading: false, mutate: vi.fn() } as any;
        }
        if (Array.isArray(key) && key[0] === "upcoming-interviews") {
          return { data: mockInterviews, error: undefined, isLoading: false, mutate: vi.fn() } as any;
        }
        return { data: undefined, error: undefined, isLoading: false, mutate: vi.fn() } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Appointments section SHOULD be visible
      expect(screen.getByText(/นัดหมายที่กำลังจะถึง/)).toBeInTheDocument();
    });
  });

  describe("RecommendedJobsCarousel Empty Handling", () => {
    it("should render recommended jobs section even when no jobs available", () => {
      const mockProfile = {
        uid: "user123",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
      };

      vi.mocked(useSWR).mockImplementation((key) => {
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return { data: mockProfile, error: undefined, isLoading: false, mutate: vi.fn() } as any;
        }
        // No mock for recommended jobs - component will handle empty
        return { data: undefined, error: undefined, isLoading: false, mutate: vi.fn() } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Recommended jobs section should always render
      expect(screen.getByText(/งานที่แนะนำสำหรับคุณ/)).toBeInTheDocument();
    });

    it("should handle gracefully when recommended jobs data is empty", () => {
      const mockProfile = {
        uid: "user123",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
      };

      vi.mocked(useSWR).mockImplementation((key) => {
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return { data: mockProfile, error: undefined, isLoading: false, mutate: vi.fn() } as any;
        }
        if (Array.isArray(key) && key[0] === "recommended-jobs") {
          return { data: [], error: undefined, isLoading: false, mutate: vi.fn() } as any;
        }
        return { data: undefined, error: undefined, isLoading: false, mutate: vi.fn() } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Should not crash - section should render
      expect(screen.getByText(/งานที่แนะนำสำหรับคุณ/)).toBeInTheDocument();

      // Should show empty state or placeholder
      const jobsSection = screen.getByText(/งานที่แนะนำสำหรับคุณ/).closest("div");
      expect(jobsSection).toBeInTheDocument();
    });
  });
});
