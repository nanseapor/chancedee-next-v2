/**
 * COMP-R03: DefaultJobSettings Component Tests
 *
 * RED Phase: All tests should FAIL until implementation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// This import will fail until implementation exists
import { DefaultJobSettings } from "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/config/DefaultJobSettings";

describe("COMP-R03: DefaultJobSettings Component", () => {
  const mockInitialData = {
    default_location: "Bangkok",
    default_job_type: "full-time",
    auto_close_days: 30,
  };

  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Form Fields Tests (~2 tests)
  // ============================================
  describe("Form Fields", () => {
    it("should render all job default fields", () => {
      render(
        <DefaultJobSettings
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      expect(screen.getByLabelText(/พื้นที่เริ่มต้น/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ประเภทงานเริ่มต้น/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ปิดประกาศอัตโนมัติ/i)).toBeInTheDocument();
    });

    it("should populate fields with initial data", () => {
      render(
        <DefaultJobSettings
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    });
  });

  // ============================================
  // Validation Tests (~2 tests)
  // ============================================
  describe("Validation", () => {
    it("should validate auto_close_days is non-negative", async () => {
      // The input has min=0, so negative values are prevented at the HTML level
      // This test verifies the component has min attribute set
      render(
        <DefaultJobSettings
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      const daysInput = screen.getByRole("spinbutton", { name: /ปิดประกาศอัตโนมัติ/i });
      expect(daysInput).toHaveAttribute("min", "0");
    });

    it("should allow 0 for never auto-close", async () => {
      const user = userEvent.setup();

      render(
        <DefaultJobSettings
          initialData={{ ...mockInitialData, auto_close_days: 0 }}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      // Value should be displayed as 0
      expect(screen.getByDisplayValue("0")).toBeInTheDocument();

      const submitButton = screen.getByRole("button", { name: /บันทึก/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            auto_close_days: 0,
          })
        );
      });
    });
  });

  // ============================================
  // Submit Tests (~2 tests)
  // ============================================
  describe("Submit", () => {
    it("should call onSubmit with form data", async () => {
      const user = userEvent.setup();

      render(
        <DefaultJobSettings
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      const submitButton = screen.getByRole("button", { name: /บันทึก/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it("should disable form when disabled prop is true", () => {
      render(
        <DefaultJobSettings
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          disabled={true}
        />
      );

      expect(screen.getByLabelText(/ปิดประกาศอัตโนมัติ/i)).toBeDisabled();
    });
  });
});
