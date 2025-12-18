/**
 * Unit tests for PersonalInfoEditDrawer component
 * CAND-R02 Batch 3D
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PersonalInfoEditDrawer } from "@/app/jobsmarket/candidates/[id]/profile/_components/PersonalInfoEditDrawer";
import type { FirebaseCandidateData } from "@/types/candidate.types";

// Mock dependencies
vi.mock("@/hooks/use-toast-notification", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

vi.mock("@/lib/database/actions/candidate-information", () => ({
  webCandidateSavePersonalInfo: vi.fn().mockResolvedValue({}),
}));

describe("PersonalInfoEditDrawer", () => {
  const mockCandidate: FirebaseCandidateData = {
    uid: "test-uid-123",
    titlePrefix: "mr",
    firstnameTH: "สมชาย",
    lastnameTH: "ใจดี",
    nicknameTH: "ชาย",
    email: "somchai@example.com",
    phone: "0812345678",
    birthdate: 946684800, // 2000-01-01
    gender: "male",
    maritalStatus: "single",
    province: "กรุงเทพมหานคร",
    district: "บางรัก",
    addressLine1: "123 ถนนสีลม",
    postCode: "10500",
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
    render(<PersonalInfoEditDrawer {...defaultProps} />);

    expect(screen.getByText("แก้ไขข้อมูลส่วนตัว")).toBeInTheDocument();
    expect(
      screen.getByText("แก้ไขข้อมูลส่วนตัวของคุณ เพื่อให้นายจ้างสามารถติดต่อคุณได้")
    ).toBeInTheDocument();
  });

  it("should not render drawer when open is false", () => {
    render(<PersonalInfoEditDrawer {...defaultProps} open={false} />);

    expect(screen.queryByText("แก้ไขข้อมูลส่วนตัว")).not.toBeInTheDocument();
  });

  it("should show form with initial candidate data", () => {
    render(<PersonalInfoEditDrawer {...defaultProps} />);

    // Check if form fields are populated with candidate data
    const emailInput = screen.getByDisplayValue(mockCandidate.email!);
    expect(emailInput).toBeInTheDocument();

    const phoneInput = screen.getByDisplayValue(mockCandidate.phone!);
    expect(phoneInput).toBeInTheDocument();
  });

  it("should call onOpenChange when close button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();

    render(
      <PersonalInfoEditDrawer {...defaultProps} onOpenChange={mockOnOpenChange} />
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should handle form submission successfully", async () => {
    const user = userEvent.setup();
    const mockOnSaved = vi.fn();
    const mockOnOpenChange = vi.fn();

    render(
      <PersonalInfoEditDrawer
        {...defaultProps}
        onSaved={mockOnSaved}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Find and click submit button
    const submitButton = screen.getByRole("button", { name: /บันทึก/i });
    await user.click(submitButton);

    // Wait for async operations
    await waitFor(() => {
      expect(mockOnSaved).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("should show submit button", async () => {
    render(<PersonalInfoEditDrawer {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: /บันทึก/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute("type", "submit");
  });

  it("should handle empty candidate data gracefully", () => {
    const emptyCandidate: FirebaseCandidateData = {
      uid: "test-uid",
      isActive: true,
      isSearchable: false,
      createdAt: 0,
      updatedAt: 0,
    };

    render(<PersonalInfoEditDrawer {...defaultProps} candidate={emptyCandidate} />);

    // Should render without crashing
    expect(screen.getByText("แก้ไขข้อมูลส่วนตัว")).toBeInTheDocument();
  });
});
