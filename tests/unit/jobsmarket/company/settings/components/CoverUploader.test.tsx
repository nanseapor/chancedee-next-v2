/**
 * COMP-R03: CoverUploader Component Tests
 *
 * RED Phase: All tests should FAIL until implementation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// This import will fail until implementation exists
import { CoverUploader } from "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/profile/CoverUploader";

describe("COMP-R03: CoverUploader Component", () => {
  const mockOnUpload = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Rendering Tests (~2 tests)
  // ============================================
  describe("Rendering", () => {
    it("should render upload area when no cover exists", () => {
      render(
        <CoverUploader
          currentCover={undefined}
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          disabled={false}
        />
      );

      expect(screen.getByText(/อัพโหลดรูปปก/i)).toBeInTheDocument();
      // Multiple elements show dimension recommendation, use getAllBy
      expect(screen.getAllByText(/1200×300/i).length).toBeGreaterThan(0);
    });

    it("should show current cover preview when exists", () => {
      render(
        <CoverUploader
          currentCover="https://example.com/cover.jpg"
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          disabled={false}
        />
      );

      const img = screen.getByRole("img", { name: /cover/i });
      expect(img).toHaveAttribute("src", expect.stringContaining("cover.jpg"));
    });
  });

  // ============================================
  // Upload Tests (~2 tests)
  // ============================================
  describe("Upload", () => {
    it("should call onUpload when file is selected", async () => {
      const user = userEvent.setup();
      const file = new File(["test"], "cover.jpg", { type: "image/jpeg" });

      render(
        <CoverUploader
          currentCover={undefined}
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          disabled={false}
        />
      );

      const input = screen.getByLabelText(/อัพโหลดรูปปก/i);
      await user.upload(input, file);

      expect(mockOnUpload).toHaveBeenCalledWith(file);
    });

    it("should show upload progress", async () => {
      render(
        <CoverUploader
          currentCover={undefined}
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          disabled={false}
          uploadProgress={75}
          isUploading={true}
        />
      );

      expect(screen.getByText(/75%/)).toBeInTheDocument();
    });
  });

  // ============================================
  // Dimension Recommendation Tests (~2 tests)
  // ============================================
  describe("Dimensions", () => {
    it("should show recommended dimensions hint", () => {
      render(
        <CoverUploader
          currentCover={undefined}
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          disabled={false}
        />
      );

      // Multiple elements show dimension recommendation
      expect(screen.getAllByText(/1200×300/i).length).toBeGreaterThan(0);
    });

    it("should show remove button when cover exists", () => {
      render(
        <CoverUploader
          currentCover="https://example.com/cover.jpg"
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          disabled={false}
        />
      );

      expect(screen.getByRole("button", { name: /ลบ/i })).toBeInTheDocument();
    });
  });
});
