/**
 * Unit tests for AboutMeEditDrawer component
 * CAND-R02 Batch 3D
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AboutMeEditDrawer } from "@/app/jobsmarket/candidates/[id]/profile/_components/AboutMeEditDrawer";
import type { FirebaseCandidateData } from "@/types/candidate.types";

// Mock dependencies
vi.mock("@/hooks/use-toast-notification", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

vi.mock("@/lib/database/actions/candidate-information", () => ({
  webCandidateSaveAboutMe: vi.fn().mockResolvedValue({ success: true }),
}));

describe("AboutMeEditDrawer", () => {
  const mockCandidate: FirebaseCandidateData = {
    uid: "test-uid-123",
    aboutMe: "ผมเป็นคนขยัน มีความรับผิดชอบสูง และชอบเรียนรู้สิ่งใหม่ๆ",
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
    render(<AboutMeEditDrawer {...defaultProps} />);

    expect(screen.getByText("แก้ไขเกี่ยวกับตัวคุณ")).toBeInTheDocument();
    expect(
      screen.getByText("เขียนเกี่ยวกับตัวคุณ ความสนใจ หรือสิ่งที่ต้องการบอกนายจ้าง")
    ).toBeInTheDocument();
  });

  it("should not render drawer when open is false", () => {
    render(<AboutMeEditDrawer {...defaultProps} open={false} />);

    expect(screen.queryByText("แก้ไขเกี่ยวกับตัวคุณ")).not.toBeInTheDocument();
  });

  it("should show textarea with about_me data", () => {
    render(<AboutMeEditDrawer {...defaultProps} />);

    const textarea = screen.getByDisplayValue(mockCandidate.aboutMe!);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute("id", "about_me");
  });

  it("should call onOpenChange when close button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();

    render(<AboutMeEditDrawer {...defaultProps} onOpenChange={mockOnOpenChange} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should call onOpenChange when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();

    render(<AboutMeEditDrawer {...defaultProps} onOpenChange={mockOnOpenChange} />);

    const cancelButton = screen.getByRole("button", { name: /ยกเลิก/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should handle form submission", async () => {
    const user = userEvent.setup();
    const mockOnSaved = vi.fn();
    const mockOnOpenChange = vi.fn();

    render(
      <AboutMeEditDrawer
        {...defaultProps}
        onSaved={mockOnSaved}
        onOpenChange={mockOnOpenChange}
      />
    );

    const submitButton = screen.getByRole("button", { name: /บันทึก/i });
    await user.click(submitButton);

    // Wait for async operations
    await waitFor(() => {
      expect(mockOnSaved).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("should handle empty about_me", () => {
    const candidateNoAboutMe: FirebaseCandidateData = {
      uid: "test-uid",
      isActive: true,
      isSearchable: false,
      createdAt: 0,
      updatedAt: 0,
    };

    render(<AboutMeEditDrawer {...defaultProps} candidate={candidateNoAboutMe} />);

    // Should render with empty textarea
    const textarea = screen.getByLabelText(/เกี่ยวกับตัวคุณ/i);
    expect(textarea).toHaveValue("");
  });

  it("should show character limit hint", () => {
    render(<AboutMeEditDrawer {...defaultProps} />);

    expect(screen.getByText("สูงสุด 1000 ตัวอักษร")).toBeInTheDocument();
  });

  it("should allow text editing", async () => {
    const user = userEvent.setup();

    render(<AboutMeEditDrawer {...defaultProps} />);

    const textarea = screen.getByDisplayValue(mockCandidate.aboutMe!);

    // Clear and type new text
    await user.clear(textarea);
    await user.type(textarea, "ข้อความใหม่");

    expect(textarea).toHaveValue("ข้อความใหม่");
  });
});
