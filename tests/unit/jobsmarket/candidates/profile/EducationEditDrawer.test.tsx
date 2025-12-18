/**
 * Unit tests for EducationEditDrawer component
 * CAND-R02 Batch 3D
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EducationEditDrawer } from "@/app/jobsmarket/candidates/[id]/profile/_components/EducationEditDrawer";
import type { FirebaseCandidateData } from "@/types/candidate.types";

// Mock dependencies
vi.mock("@/hooks/use-toast-notification", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

describe("EducationEditDrawer", () => {
  const mockCandidate: FirebaseCandidateData = {
    uid: "test-uid-123",
    educations: [
      {
        institution: "มหาวิทยาลัยธรรมศาสตร์",
        major: "วิศวกรรมคอมพิวเตอร์",
        educationLevel: 6,
        educationLabel: "ปริญญาตรี",
        endYear: 2020,
        gpax: "3.50",
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
    render(<EducationEditDrawer {...defaultProps} />);

    expect(screen.getByText("แก้ไขประวัติการศึกษา")).toBeInTheDocument();
    expect(
      screen.getByText("เพิ่ม แก้ไข หรือลบประวัติการศึกษาของคุณ")
    ).toBeInTheDocument();
  });

  it("should not render drawer when open is false", () => {
    render(<EducationEditDrawer {...defaultProps} open={false} />);

    expect(screen.queryByText("แก้ไขประวัติการศึกษา")).not.toBeInTheDocument();
  });

  it("should show form with education data", () => {
    render(<EducationEditDrawer {...defaultProps} />);

    // Form should be rendered
    expect(screen.getByText("แก้ไขประวัติการศึกษา")).toBeInTheDocument();
  });

  it("should call onOpenChange when close button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();

    render(
      <EducationEditDrawer {...defaultProps} onOpenChange={mockOnOpenChange} />
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should handle candidate with no education data", () => {
    const candidateNoEducation: FirebaseCandidateData = {
      uid: "test-uid",
      educations: [],
      isActive: true,
      isSearchable: false,
      createdAt: 0,
      updatedAt: 0,
    };

    render(
      <EducationEditDrawer {...defaultProps} candidate={candidateNoEducation} />
    );

    // Should render without crashing
    expect(screen.getByText("แก้ไขประวัติการศึกษา")).toBeInTheDocument();
  });

  it("should handle candidate with no educations property", () => {
    const candidateNoEducations: FirebaseCandidateData = {
      uid: "test-uid",
      isActive: true,
      isSearchable: false,
      createdAt: 0,
      updatedAt: 0,
    };

    render(
      <EducationEditDrawer {...defaultProps} candidate={candidateNoEducations} />
    );

    // Should render without crashing
    expect(screen.getByText("แก้ไขประวัติการศึกษา")).toBeInTheDocument();
  });
});
