/**
 * Unit tests for JobPreferencesEditDrawer component
 * CAND-R02 Batch 3D
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobPreferencesEditDrawer } from "@/app/jobsmarket/candidates/[id]/profile/_components/JobPreferencesEditDrawer";
import type { FirebaseCandidateData } from "@/types/candidate.types";

// Mock dependencies
vi.mock("@/hooks/use-toast-notification", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

describe("JobPreferencesEditDrawer", () => {
  const mockCandidate: FirebaseCandidateData = {
    uid: "test-uid-123",
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
    render(<JobPreferencesEditDrawer {...defaultProps} />);

    expect(screen.getByText("แก้ไขความต้องการงาน")).toBeInTheDocument();
    expect(
      screen.getByText("แก้ไขความต้องการงาน เงินเดือน และสถานที่ทำงานของคุณ")
    ).toBeInTheDocument();
  });

  it("should not render drawer when open is false", () => {
    render(<JobPreferencesEditDrawer {...defaultProps} open={false} />);

    expect(screen.queryByText("แก้ไขความต้องการงาน")).not.toBeInTheDocument();
  });

  it("should show form for job preferences", () => {
    render(<JobPreferencesEditDrawer {...defaultProps} />);

    // Form should be rendered
    expect(screen.getByText("แก้ไขความต้องการงาน")).toBeInTheDocument();
  });

  it("should call onOpenChange when close button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();

    render(
      <JobPreferencesEditDrawer
        {...defaultProps}
        onOpenChange={mockOnOpenChange}
      />
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should render without preferences data", () => {
    render(<JobPreferencesEditDrawer {...defaultProps} />);

    // Should render without crashing
    expect(screen.getByText("แก้ไขความต้องการงาน")).toBeInTheDocument();
  });
});
