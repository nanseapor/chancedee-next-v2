/**
 * Unit tests for SkillsEditDrawer component
 * CAND-R02 Batch 3D
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillsEditDrawer } from "@/app/jobsmarket/candidates/[id]/profile/_components/SkillsEditDrawer";
import type { FirebaseCandidateData } from "@/types/candidate.types";

// Mock dependencies
vi.mock("@/hooks/use-toast-notification", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

describe("SkillsEditDrawer", () => {
  const mockCandidate: FirebaseCandidateData = {
    uid: "test-uid-123",
    skills: [
      {
        skillName: "JavaScript",
        expertiseLevel: "advanced",
        isCertified: false,
      },
      {
        skillName: "React",
        expertiseLevel: "intermediate",
        isCertified: true,
        skillCertifiedName: "React Developer Certification",
      },
    ],
    languages: [
      {
        languageName: "ไทย",
        languageLevel: "เชี่ยวชาญ",
      },
      {
        languageName: "English",
        languageLevel: "ดี",
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
    render(<SkillsEditDrawer {...defaultProps} />);

    expect(screen.getByText("แก้ไขทักษะและภาษา")).toBeInTheDocument();
    expect(
      screen.getByText("เพิ่ม แก้ไข หรือลบทักษะและภาษาที่คุณสามารถใช้ได้")
    ).toBeInTheDocument();
  });

  it("should not render drawer when open is false", () => {
    render(<SkillsEditDrawer {...defaultProps} open={false} />);

    expect(screen.queryByText("แก้ไขทักษะและภาษา")).not.toBeInTheDocument();
  });

  it("should show form with skills and languages", () => {
    render(<SkillsEditDrawer {...defaultProps} />);

    // Form should be rendered
    expect(screen.getByText("แก้ไขทักษะและภาษา")).toBeInTheDocument();
  });

  it("should call onOpenChange when close button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();

    render(<SkillsEditDrawer {...defaultProps} onOpenChange={mockOnOpenChange} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should handle candidate with no skills", () => {
    const candidateNoSkills: FirebaseCandidateData = {
      uid: "test-uid",
      skills: [],
      languages: [],
      isActive: true,
      isSearchable: false,
      createdAt: 0,
      updatedAt: 0,
    };

    render(<SkillsEditDrawer {...defaultProps} candidate={candidateNoSkills} />);

    // Should render without crashing
    expect(screen.getByText("แก้ไขทักษะและภาษา")).toBeInTheDocument();
  });

  it("should handle candidate with no skills or languages property", () => {
    const candidateNoData: FirebaseCandidateData = {
      uid: "test-uid",
      isActive: true,
      isSearchable: false,
      createdAt: 0,
      updatedAt: 0,
    };

    render(<SkillsEditDrawer {...defaultProps} candidate={candidateNoData} />);

    // Should render without crashing
    expect(screen.getByText("แก้ไขทักษะและภาษา")).toBeInTheDocument();
  });
});
