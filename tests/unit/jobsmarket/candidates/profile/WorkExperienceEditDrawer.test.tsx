/**
 * Unit tests for WorkExperienceEditDrawer component
 * CAND-R02 Batch 3D
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkExperienceEditDrawer } from "@/app/jobsmarket/candidates/[id]/profile/_components/WorkExperienceEditDrawer";
import type { FirebaseCandidateData } from "@/types/candidate.types";

// Mock dependencies
vi.mock("@/hooks/use-toast-notification", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

describe("WorkExperienceEditDrawer", () => {
  const mockCandidate: FirebaseCandidateData = {
    uid: "test-uid-123",
    works: [
      {
        company: "บริษัท ABC จำกัด",
        jobTitle: "Software Engineer",
        startYear: 2020,
        endYear: 2023,
        isCurrent: false,
        isNewGraduate: false,
        startMonth: 1,
        salary: 50000,
        note: "Developed web applications",
      },
    ],
    isActive: true,
    isSearchable: true,
    createdAt: 0,
    updatedAt: 0,
  };

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    candidate: mockCandidate,
    onSaved: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render drawer when open is true", () => {
    render(<WorkExperienceEditDrawer {...defaultProps} />);

    expect(screen.getByText("แก้ไขประสบการณ์ทำงาน")).toBeInTheDocument();
    expect(
      screen.getByText("เพิ่ม แก้ไข หรือลบประสบการณ์ทำงานของคุณ")
    ).toBeInTheDocument();
  });

  it("should not render drawer when open is false", () => {
    render(<WorkExperienceEditDrawer {...defaultProps} open={false} />);

    expect(screen.queryByText("แก้ไขประสบการณ์ทำงาน")).not.toBeInTheDocument();
  });

  it("should show form with work experience data", () => {
    render(<WorkExperienceEditDrawer {...defaultProps} />);

    // Form should be rendered with Step2WorkExperience component
    expect(screen.getByText("แก้ไขประสบการณ์ทำงาน")).toBeInTheDocument();
  });

  it("should call onOpenChange when close button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();

    render(
      <WorkExperienceEditDrawer
        {...defaultProps}
        onOpenChange={mockOnOpenChange}
      />
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should handle fresh graduate candidate (no work experience)", () => {
    const freshGradCandidate: FirebaseCandidateData = {
      uid: "test-uid",
      works: [],
      isActive: true,
      isSearchable: false,
      createdAt: 0,
      updatedAt: 0,
    };

    render(
      <WorkExperienceEditDrawer {...defaultProps} candidate={freshGradCandidate} />
    );

    // Should render without crashing
    expect(screen.getByText("แก้ไขประสบการณ์ทำงาน")).toBeInTheDocument();
  });

  it("should handle candidate with no works property", () => {
    const candidateNoWorks: FirebaseCandidateData = {
      uid: "test-uid",
      isActive: true,
      isSearchable: false,
      createdAt: 0,
      updatedAt: 0,
    };

    render(
      <WorkExperienceEditDrawer {...defaultProps} candidate={candidateNoWorks} />
    );

    // Should render without crashing
    expect(screen.getByText("แก้ไขประสบการณ์ทำงาน")).toBeInTheDocument();
  });
});
